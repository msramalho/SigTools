"use strict";

const DateTime = luxon.DateTime;

/**
 * 
 * @param {Object} url 
 * @param {String} url.baseURL 
 * @param {Object} url.queryParams 
 */
function __compileURL(url) {
    return url.baseURL + '?' + Object.entries(url.queryParams)
        // remove parameters with undefined values (e.g. start and end time)
        .filter(([key, value]) => value !== undefined && value !== null)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');
}

/**
 * Create a 'Add to Calendar' URL for Google Calendar
 * 
 * Base URL: https://calendar.google.com/calendar/render
 * Query parameters:
 * * `action`: `TEMPLATE`
 * * `dates`: <start date>/<end date>
 *  * Both dates in ISO 8601 simplified (YYYYMMDDTHHmmss+Z)
 * * `text`: The event title (string)
 * * `details`: The event description (string, with html support)
 * * `location`: Event location (string)
 * * `recur`: A recurrence rule with format RRULE:FREQ=<freq>;UNTIL=<date>
 *  * Standard: {@link https://icalendar.org/iCalendar-RFC-5545/3-8-5-3-recurrence-rule.html}
 *  * Date is in the same format as start/end dates

 * @param {Extractor} extractor class that implements getName and getDescription from the event
 * @param {event object} event needs to have (at least) {from, to, location, download}
 * @param {*} repeat
 */
function eventToGCalendar(extractor, event, repeat) {
    const luxonSettings = {
        format: 'basic',
        suppressMilliseconds: true,
        includeOffset: false
    }
    const startDate = DateTime.fromJSDate(event.from).toISO(luxonSettings);
    const endDate = DateTime.fromJSDate(event.to).toISO(luxonSettings);
    const getRecur = () =>
        `RRULE:FREQ=${repeat.freq};UNTIL=${DateTime.fromJSDate(repeat.until).toISO(luxonSettings)}`;

    return __compileURL({
        baseURL: 'https://calendar.google.com/calendar/render',
        queryParams: {
            action: 'TEMPLATE',
            dates: `${startDate}/${endDate}`,
            text: extractor.getName(event, true),
            details: extractor.getDescription(event, true),
            location: event.location,
            recur: repeat ? getRecur() : null
        }
    });
}

/**
 * Create a 'Add to Calendar' URL for Outlook.com
 * 
 * Base URL: https://outlook.live.com/calendar/0/deeplink/compose
 * Query parameters:
 * * `path`: `/calendar/action/compose`
 * * `rru`: `addevent`
 * * `subject`: The event title (string)
 * * `body`: The event description (string, no html support)
 * * `location`: Event location (string)
 * * `startdt`: Event start time in ISO 8601 (YYYY-mm-ddTHH:mm:ss+Z)
 * * `enddt`: Event start time in ISO 8601 (YYYY-mm-ddTHH:mm:ss+Z)
 * 
 * @param {Extractor} extractor class that implements getName and getDescription from the event
 * @param {event object} event needs to have (at least) {from, to, location, download}
 * @param {*} repeat no support for Outlook.com
 * 
 * @see {@link https://en.wikipedia.org/wiki/ISO_8601 ISO 8601}
 */
function eventToOutlookCalendar(extractor, event, repeat) {
    /**
     * Custom encoding for Microsoft Calendar
     * * Unicode for "normal" space: `U+0020`
     * * Unicode for thin space: `U+2009`
     * 
     * Note: replaceAll() for strings still not well supported, and using
     * unicode in regex (to replace all ocurrences with replace()) is tricky
     * as well. Hacky solution below uses split() and join()
     * 
     * @see {@link https://github.com/msramalho/SigTools/issues/83}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replaceAll}
     */
    const customEncode = (str) => str.split('\u0020').join('\u2009');

    return __compileURL({
        baseURL: 'https://outlook.live.com/calendar/0/deeplink/compose',
        queryParams: {
            rru: 'addevent',
            path: '/calendar/action/compose',
            subject: encodeURIComponent(customEncode(extractor.getName(event, true))),
            location: encodeURIComponent(customEncode(event.location)),
            body: encodeURIComponent(customEncode(extractor.getDescription(event, true, true))),
            startdt: DateTime.fromJSDate(event.from).toISO(),
            enddt: DateTime.fromJSDate(event.to).toISO()
        }
    });
}

/**
 * Create a 'Add to Calendar' URL for Yahoo
 * 
 * Base URL: https://calendar.yahoo.com/
 * Query parameters:
 * * `title`: The event title (string)
 * * `desc`: The event description (string, unknown html support)
 * * `in_loc`: Event location (string)
 * * `st`: Event start time in ISO 8601 simplified
 * * `et`: Event end time in ISO 8601 simplified
 * * `v`: `60`
 * @param {Extractor} extractor class that implements getName and getDescription from the event
 * @param {event object} event needs to have (at least) {from, to, location, download}
 * @param {*} repeat no support for Outlook.com
 * 
 * @see eventToGCalendar
 */
function eventToYahooCalendar(extractor, event, repeat) {
    const luxonSettings = {
        format: 'basic',
        suppressMilliseconds: true,
        includeOffset: false
    }
    const startDate = DateTime.fromJSDate(event.from).toISO(luxonSettings);
    const endDate = DateTime.fromJSDate(event.to).toISO(luxonSettings);

    return __compileURL({
        baseURL: 'https://calendar.yahoo.com/',
        queryParams: {
            title: extractor.getName(event, true),
            desc: extractor.getDescription(event, true),
            in_loc: event.location,
            st: startDate,
            et: endDate,
            v: '60'
        }
    });
}

/**
 * Returns an element object <a> for OneClick feature with a <img> child
 * @param {string} class_atr_a The class for <a> element
 * @param {string} class_atr_img The class for <img> child element
 * @param {string} service 'google' || 'outlook'. This is used to set the correct title and icon automatically
 * @param {string} url
 * @param {boolean} html URL's with inline html or with plain text require different encodings
 */
function generateOneClickDOM(class_atr_a, class_atr_img, service, url, html, title) {
    var a = document.createElement("a");
    var img = document.createElement("img");

    // set class
    a.className = class_atr_a;
    img.className = class_atr_img;

    // set title and append an <img>
    if (service == "google") {
        a.setAttribute("title", "Add this single event to your Google Calendar in one click!");
        img.setAttribute("alt", "google calendar icon");
        img.setAttribute("src", `${chrome.extension.getURL("icons/gcalendar.png")}`);
    } else if (service == "outlook") {
        a.setAttribute("title", "Add this single event to your Outlook Calendar in one click!");
        img.setAttribute("alt", "outlook calendar icon");
        img.setAttribute("src", `${chrome.extension.getURL("icons/outlook.png")}`);
    } else if (service == "yahoo") {
        a.setAttribute("title", "Add this single event to your Yahoo Calendar in one click!");
        img.setAttribute("alt", "yahoo calendar icon");
        img.setAttribute("src", `${chrome.extension.getURL("icons/yahoo.png")}`);
    }
    a.appendChild(img);

    // add href attribute to automatically set the pointer/cursor
    a.setAttribute("href", "#");
    if (title != undefined) a.innerHTML += title

    // add event listener
    if (html)
        a.setAttribute("onclick", `window.open(decodeURI('${encodeURI(url.replace(/'/g, "\""))}').replace(/\\s/g, "%20"));`);
    else
        a.setAttribute("onclick", `window.open('${url.replace(/\n/g, '%0A')}');`);

    return a;
}