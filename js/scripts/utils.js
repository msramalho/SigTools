/**
 * prototype to add days to the current javascript Date
 * @param {int} days number of days to add
 * @returns new date after operation
 */
Date.prototype.addDays = function(days) {
    let dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
};

/**
 * add hours and days to date, by index
 * @param {string} daysMinutes format is "08:00 - 10:00"
 * @param {int} index the index of split(" ") to use 0 => 08:00 and 1 => 10:00
 * @returns new date after operation
 */
Date.prototype.setHoursMinutes = function(daysMinutes, index) {
    let dat = new Date(this.valueOf());
    let partIndex = daysMinutes.split(" - ")[index];
    let parts = partIndex.split(":");
    dat.setHours(Number(parts[0]));
    dat.setMinutes(Number(parts[1]));
    return dat;
};

/**
 * format a date according to google calendar's: YYYYMMDDTHHmmSS and return it as a string
 * @returns new date after operation
 */
Date.prototype.toGCalendar = function() {
    return this.toISOString().replace(/(-)|(\:)/g, "").split(".")[0] + "Z";
};

/**
 * convert YearMonthDay string into a date variable
 * @param {string} text format: YearMonthDay
 * @returns new date after operation
 */
function textToDate(text) {
    return new Date(
        Number(text.substr(0, 4)),
        Number(text.substr(4, 2)) - 1,
        Number(text.substr(6, 2))
    );
}
/**
 * convert day-month-year string into a date variable
 * @param {string} text format: day-month-year
 * @returns new date after operation
 */
function textToDate2(text) {
    return new Date(text.split("-").reverse().join("-"));
}

/**
 * return the difference (in days) between two dates
 * @param {Date} first date 1
 * @param {Date} second date 2
 * @returns int
 */
function daydiff(first, second) {
    return Math.round((second - first) / (1000 * 60 * 60 * 24));
}


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
    var data = `&startdt=${event.from.toGCalendar()}&enddt=${event.to.toGCalendar()}&subject=${extractor.getName(event, true)}&location=${event.location}&body=${extractor.getDescription(event, true, true)}`;
    return 'https://outlook.live.com/owa/?path=/calendar/action/compose&rru=addevent' + data;
}

/**
 * execute a command and return a default value if an exception is thrown
 * @param {callback} command to execute, which can fail
 * @param {*} defaultValue to return on catch
 */
function jTry(command, defaultValue) {
    try {
        let tempRes = command();
        if (tempRes.length == 0) return defaultValue;
        return tempRes;
    } catch (error) {
        return defaultValue;
    }
}

/**
 * Receives a title, a url and a url text and tries to construct an html 'Title <a href="url">text</a>' but if any is undefined, simpler versions are returned
 * @param {*} title the title before the anchor
 * @param {*} href the url
 * @param {*} text the url text description
 */
function getAnchor(title, href, text) {
    if (href != undefined && !href.includes("undefined") && !text.includes("undefined")) return `${title} <a href="${href}">${text}</a><br/>`;
    else if (text != undefined && !text.includes("undefined")) return `${title} ${text}<br/>`;
    return "";
}

/**
 * Return the index of the day in the week, for portuguese days - Monday is 1
 * @param {String} day
 */
function getPtDayOfWeek(day) {
    return ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"].indexOf(day.trim().toLowerCase());
}

/**
 * Extends jquery to return text of element without the text of any nested elements
 */
jQuery.fn.selfText = function() {
    return this
        .clone() //clone the element
        .children() //select all the children
        .remove() //remove all the children
        .end() //again go back to selected element
        .text();
};