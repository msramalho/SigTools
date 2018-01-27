/**
 * prorotype to add days to the current javascript Date
 * @param {int} days number of days to add
 *   @returns new date after operation
 */
Date.prototype.addDays = function (days) {
    let dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
};

/**
 * add hours and days to date, by index
 * @param {string} daysMinutes format is "08:00 10:00"
 * @param {int} index the index of split(" ") to use 0 => 08:00 and 1 => 10:00
 *   @returns new date after operation
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
 * convert year/month/day string into a date variable
 * @param {string} text format: year/month/day
 *   @returns new date after operation
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

function jTry(command, defaultValue) {
    try {
        return command();
    } catch (error) {
        return defaultValue;
    }
}

function getAnchor(title, href, text) {
    console.log(title, text);
    console.log(text.includes("undefined"));
    if (href != undefined && !href.includes("undefined") && !text.includes("undefined")) return `${title} <a href="${href}">${text}</a><br/>`;
    else if (text != undefined && !text.includes("undefined")) return `${title} ${text}<br/>`;
    return "";
}