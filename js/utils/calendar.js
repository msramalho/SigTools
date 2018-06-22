"use strict";
/**
 * return a URL for google chrome event adding from an event
 * @param {Extractor} extractor class that implements getName and getDescription from the event
 * @param {event object} event needs to have (at least) {from, to, location, download}
 * @param {*} repeat if undefined the even does not repeat overtime, otherwise it does (uses the same format as ics.js, so: repeat = { freq: "WEEKLY", until: stringFriendlyWithDate };)
 */
function eventToGCalendar(extractor, event, repeat) {
    let recur = "";
    if (repeat) recur = `&recur=RRULE:FREQ=${repeat.freq};UNTIL=${(new Date(repeat.until)).toGCalendar()}`;
    return (
        `https://calendar.google.com/calendar/r/eventedit?text=${extractor.getName(event, true)}&location=${event.location}&details=${extractor.getDescription(event, true, false)}&dates=${event.from.toGCalendar()}/${event.to.toGCalendar()}&sprop=name:${extractor.getName(event, true)}&sprop=website:${"https://github.com/msramalho/SigToCa"}${recur}`);
}

/**
 * return a URL for adding events to Outlook.com
 * @param {Extractor} extractor class that implements getName and getDescription from the event
 * @param {event object} event needs to have (at least) {from, to, location, download}
 * @param {*} repeat if undefined the even does not repeat overtime, otherwise it does (uses the same format as ics.js, so: repeat = { freq: "WEEKLY", until: stringFriendlyWithDate };)
 */
function eventToOutlookCalendar(extractor, event, repeat) {
    var data = `&startdt=${event.from.toGCalendar()}&enddt=${event.to.toGCalendar()}` +
        `&subject=${extractor.getName(event, true)}` +
        `&location=${event.location}` +
        `&body=${extractor.getDescription(event, true, true)}`;

    return 'https://outlook.live.com/owa/?path=/calendar/action/compose&rru=addevent' + data;
}

/**
 * Returns an element object <a> for OneClick feature with a <img> child
 * @param {string} class_atr_a The class for <a> element
 * @param {string} class_atr_img The class for <img> child element
 * @param {string} service 'google' || 'outlook'. This is used to set the correct title and icon automatically
 * @param {string} url
 * @param {boolean} html URL's with inline html or with plain text require different encodings
 */
function generateOneClickDOM(class_atr_a, class_atr_img, service, url, html) {
    var a = document.createElement("a");
    var img = document.createElement("img");

    // set class
    a.className = class_atr_a;
    img.className = class_atr_img;

    // set title and append an <img>
    if (service == "google") {
        a.setAttribute("title", "Add this single event to your Google Calendar in One click!");
        img.setAttribute("alt", "google calendar icon");
        img.setAttribute("src", `${chrome.extension.getURL("icons/gcalendar.png")}`);
    } else if (service == "outlook") {
        a.setAttribute("title", "Add this single event to your Outlook Calendar in One click!");
        img.setAttribute("alt", "outlook calendar icon");
        img.setAttribute("src", `${chrome.extension.getURL("icons/outlook.png")}`);
    }
    a.appendChild(img);

    // add href attribute to automatically set the pointer/cursor
    a.setAttribute("href", "#");

    // add event listener
    if (html)
        a.setAttribute("onclick", `window.open(decodeURI('${encodeURI(url)}').replace(/\\s/g, "%20"));`);
    else
        a.setAttribute("onclick", `window.open('${url.replace(/\n/g, '%0A')}');`);

    return a;
}