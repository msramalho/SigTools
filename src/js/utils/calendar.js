"use strict";
/**
 * return a URL for google chrome event adding from an event
 * @param {Extractor} extractor class that implements getName and getDescription from the event
 * @param {event object} event needs to have (at least) {from, to, location, download}
 * @param {*} repeat if undefined the even does not repeat overtime, otherwise it does (uses the same format as ics.js, so: repeat = { freq: "WEEKLY", until: stringFriendlyWithDate };)
 * https://richmarr.wordpress.com/2008/01/07/adding-events-to-users-calendars-part-2-web-calendars/
 */
function eventToGCalendar(extractor, event, repeat) {
    let recur = "";
    if (repeat) recur = `&recur=RRULE:FREQ=${repeat.freq};UNTIL=${(new Date(repeat.until)).toGCalendar()}`;

    let dates = '';
    if (event.from && event.to)
        dates = `&dates=${event.from.toGCalendar()}/${event.to.toGCalendar()}`;

    if (event)
        return (`https://calendar.google.com/calendar/r/eventedit?text=${extractor.getName(event, true)}&location=${event.location}&details=${extractor.getDescription(event, true, false)}&sprop=name:${extractor.getName(event, true)}&sprop=website:${"https://github.com/msramalho/SigTools"}${recur}${dates}`);
}

/**
 * Create a 'Add to Calendar' URL for Outlook.com
 * 
 * Base URL: https://outlook.live.com/calendar/0/deeplink/compose
 * Query parameters:
 * * `path`: `/calendar/action/compose`
 * * `rru`: `addevent`
 * * `subject`: The event subject (string)
 * * `body`: The event description (string, no html support)
 * * `location`: Event location (string)
 * * `startdt`: event start time in ISO 8601 (YYYY-mm-ddTHH:mm:ss+Z)
 * * `enddt`: event start time in ISO 8601 (YYYY-mm-ddTHH:mm:ss+Z)
 * 
 * @param {Extractor} extractor class that implements getName and getDescription from the event
 * @param {event object} event needs to have (at least) {from, to, location, download}
 * @param {*} repeat if undefined the even does not repeat overtime, otherwise it does (uses the same format as ics.js, so: repeat = { freq: "WEEKLY", until: stringFriendlyWithDate };)
 * 
 * @see {@link https://en.wikipedia.org/wiki/ISO_8601 ISO 8601}
 */
function eventToOutlookCalendar(extractor, event, repeat) {
    const obj = {
        baseURL: 'https://outlook.live.com/calendar/0/deeplink/compose',
        queryParams: {
            rru: 'addevent',
            path: '/calendar/action/compose',
            subject: encodeURIComponent(extractor.getName(event, true)),
            location: encodeURIComponent(event.location),
            body: encodeURIComponent(extractor.getDescription(event, true, true)),
            startdt: luxon.DateTime.fromJSDate(event.from).toISO(),
            enddt: luxon.DateTime.fromJSDate(event.to).toISO()
        }
    }

    return obj.baseURL + '?' + Object.entries(obj.queryParams)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');
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