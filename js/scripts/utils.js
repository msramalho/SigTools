/**
 * prorotype to add days to the current javascript Date
 * @param {int} days number of days to add
 * @returns new date after operation
 */
Date.prototype.addDays = function (days) {
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
Date.prototype.setHoursMinutes = function (daysMinutes, index) {
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
Date.prototype.toGCalendar = function () {
    return this.toISOString().replace(/(-)|(\:)/g, "").split(".")[0] + "Z";
};

/**
 * convert year/month/day string into a date variable
 * @param {string} text format: year/month/day
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
 */
function eventToGCalendar(extractor, event) {
    return (
        `https://calendar.google.com/calendar/r/eventedit?text=${extractor.getName(event, true)}&location=${event.location}&details=${extractor.getDescription(event, true)}&dates=${event.from.toGCalendar()}/${event.to.toGCalendar()}&sprop=name:${extractor.getName(event, true)}&sprop=website:${"https://github.com/msramalho/SigToCa"}`);
    return res;
}

/**
 * execute a command and returna default value if an exception is thrown
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