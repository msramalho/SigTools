"use strict";
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
 * convert day/Portuguese3LetterMonth/year string into a date variable
 * @param {string} text format: day/Portuguese3LetterMonth/year
 * @returns new date after operation
 */
function textToDate3(text) {
    let m = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"] // TODO: test all, tested so far: ["Set"]
    let t = text.split("/")
    console.log(text);
    return new Date(`${m.indexOf(t[1])+1}/${t[0]}/${t[2]}`);
}

/**
 * return the difference (in days) between two dates
 * @param {Date} first date 1
 * @param {Date} second date 2
 * @returns int
 */
function dayDiff(first, second) {
    return Math.round((second - first) / (1000 * 60 * 60 * 24));
}

/**
 * Return the index of the day in the week, for portuguese days - Monday is 1
 * @param {String} day
 */
function getPtDayOfWeek(day) {
    return ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"].indexOf(day.trim().toLowerCase());
}