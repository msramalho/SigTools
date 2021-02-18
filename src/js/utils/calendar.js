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
    const startDate = DateTime.fromJSDate(event.from).toISO({ format: 'basic' });
    const endDate = DateTime.fromJSDate(event.to).toISO({ format: 'basic' });
    const getRecur = () =>
        `RRULE:FREQ=${repeat.freq};UNTIL=${DateTime.fromJSDate(repeat.until).toISO({ format: 'basic' })}`;

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
 * * `startdt`: event start time in ISO 8601 (YYYY-mm-ddTHH:mm:ss+Z)
 * * `enddt`: event start time in ISO 8601 (YYYY-mm-ddTHH:mm:ss+Z)
 * 
 * @param {Extractor} extractor class that implements getName and getDescription from the event
 * @param {event object} event needs to have (at least) {from, to, location, download}
 * @param {*} repeat no support for Outlook.com
 * 
 * @see {@link https://en.wikipedia.org/wiki/ISO_8601 ISO 8601}
 */
function eventToOutlookCalendar(extractor, event, repeat) {
    return __compileURL({
        baseURL: 'https://outlook.live.com/calendar/0/deeplink/compose',
        queryParams: {
            rru: 'addevent',
            path: '/calendar/action/compose',
            subject: encodeURIComponent(extractor.getName(event, true)),
            location: encodeURIComponent(event.location),
            body: encodeURIComponent(extractor.getDescription(event, true, true)),
            startdt: DateTime.fromJSDate(event.from).toISO(),
            enddt: DateTime.fromJSDate(event.to).toISO()
        }
    });
}

/**
 * return a URL for adding events to Yahoo.com
 * @param {Extractor} extractor class that implements getName and getDescription from the event
 * @param {event object} event needs to have (at least) {from, to, location, download}
 * @param {*} repeat if undefined the even does not repeat overtime, otherwise it does (uses the same format as ics.js, so: repeat = { freq: "WEEKLY", until: stringFriendlyWithDate };)
 * http://chris.photobooks.com/tests/calendar/Notes.html
 */
function eventToYahooCalendar(extractor, event, repeat) {
    // calculate duration
    let dMins = (event.to - event.from) / (60 * 1000) // duration in minutes
    let dHours = Math.floor(dMins / 60) // convert to full hours
    dMins = dMins % 60 // remaining minutes

    let data =
        `&DUR=${dHours}${dMins}` +
        `&TITLE=${extractor.getName(event, true)}` +
        `&in_loc=${event.location}` +
        `&DESC=${extractor.getDescription(event, true, true)}`;

    if (event.from) data += `&ST=${event.from.toGCalendar()}`;
    // + `&REND=${}`
    return 'http://calendar.yahoo.com/?v=60' + data;
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