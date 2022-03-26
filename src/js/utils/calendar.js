"use strict";

/** Shortcut for DateTime in Luxon lib */
const DateTime = luxon.DateTime;

/**
 * An object event. Different extracts produce different event objects, as
 * different information is available (bills, exams, timetable classes, ...).
 * However, at least three properties are mandatory: `from`, `to`, `location`.
 * 
 * @typedef {Object} SigEvent 
 * @property {Date?} from - The start date
 * @property {Date?} to - The end date
 * @property {String?} location - The event location, if any
 */

/**
 * A recurrency object with a date that defines the end of the recurring event
and the frequency
 * 
 * @typedef {Object} SigRecurrence 
 * @property {String} freq - Any frequency rule supported in RFC standard.
For SigTools context, the unique expected value is 'WEEKLY'
 * @property {Date} until - The end date for the recurring event
 * @see {@link https://icalendar.org/iCalendar-RFC-5545/3-8-5-3-recurrence-rule.html}
*/

/**
 * Creates the final URL for adding events to third-party calendars, formating
 * the query parameters automatically
 * 
 * @param {Object} url 
 * @param {String} url.baseURL - The base URL for the third-party calendar
 * @param {Object} url.queryParams - An object of key/values for query parameters.
 * Null/undefined values are skipped automatically 
 * 
 * @returns {String} URL string, e.g. `https://calendar.google.com/calendar/render/?text=Example&dates=...`
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
 * Base URL: `https://calendar.google.com/calendar/render`
 * 
 * Query parameters:
 * * `action`: `TEMPLATE`
 * * `dates`: `<start date>/<end date>`
 *  * Both dates in ISO 8601 simplified (YYYYMMDDTHHmmss+Z)
 * * `text`: The event title (string)
 * * `details`: The event description (string, with html support)
 * * `location`: Event location (string)
 * * `recur`: A recurrence rule with format `RRULE:FREQ=<freq>;UNTIL=<date>`
 *   * Standard: {@link https://icalendar.org/iCalendar-RFC-5545/3-8-5-3-recurrence-rule.html}
 * * Date is in the same format as start/end dates
 *
 * @param {Extractor} extractor The extractor
 * @param {SigEvent} event A single event to be calenderized
 * @param {SigRecurrence?} repeat Recurrence metadata, if applicable
 * 
 * @returns {String} 'Add to calendar' link for Google Calendars
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
            text: extractor.getNameEncoded(event),
            details: extractor.getDescriptionEncoded(event),
            location: event.location,
            recur: repeat ? getRecur() : null
        }
    });
}

/**
 * Prepares query parameters for Office365 and Outlook.com 'Add to calendar'
 * links
 * 
 * Query parameters:
 * * `path`: `/calendar/action/compose`
 * * `rru`: `addevent`
 * * `subject`: The event title (string)
 * * `body`: The event description (string, no html support)
 * * `location`: Event location (string)
 * * `startdt`: Event start time in ISO 8601 (YYYY-mm-ddTHH:mm:ss+Z)
 * * `enddt`: Event start time in ISO 8601 (YYYY-mm-ddTHH:mm:ss+Z)
 * 
 * @see {@link https://en.wikipedia.org/wiki/ISO_8601 ISO 8601}
 * 
 * @returns {Object} Object of key/value for the supported query parameters in
 * Microsoft calendars
 */
function __getMicrosoftQueryParams(extractor, event, repeat) {
    /**
     * Custom encoding for Microsoft Calendars
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

    return {
        rru: 'addevent',
        path: '/calendar/action/compose',
        subject: encodeURIComponent(customEncode(extractor.getName(event))),
        location: encodeURIComponent(customEncode(event.location)),
        body: encodeURIComponent(customEncode(extractor.getDescription(event))),
        startdt: DateTime.fromJSDate(event.from).toISO(),
        enddt: DateTime.fromJSDate(event.to).toISO()
    };
}

/**
 * Create a 'Add to Calendar' URL for Outlook.com
 * 
 * Base URL: `https://outlook.live.com/calendar/0/deeplink/compose`
 * 
 * Query parameters: {@link __getMicrosoftQueryParams}
 * 
 * @param {Extractor} extractor The extractor
 * @param {SigEvent} event A single event to be calenderized
 * @param {SigRecurrence?} repeat Recurrence metadata, if applicable
 * @returns {String} 'Add to calendar' link for Outlook.com calendars
 */
function eventToOutlookCalendar(extractor, event, repeat) {
    return __compileURL({
        baseURL: 'https://outlook.live.com/calendar/0/deeplink/compose',
        queryParams: __getMicrosoftQueryParams(extractor, event, repeat)
    });
}

/**
 * Create a 'Add to Calendar' URL for Office365
 * 
 * Base URL: `https://outlook.office.com/calendar/0/deeplink/compose`
 * 
 * Query parameters: {@link __getMicrosoftQueryParams}
 * 
 * @param {Extractor} extractor The extractor
 * @param {SigEvent} event A single event to be calenderized
 * @param {SigRecurrence?} repeat Recurrence metadata, if applicable
 * @returns {String} 'Add to calendar' link for Office365 calendars
 */
function eventToOffice365Calendar(extractor, event, repeat) {
    return __compileURL({
        baseURL: 'https://outlook.office.com/calendar/0/deeplink/compose',
        queryParams: __getMicrosoftQueryParams(extractor, event, repeat)
    });
}

/**
 * Create a 'Add to Calendar' URL for Yahoo
 * 
 * Base URL: `https://calendar.yahoo.com/`
 * 
 * Query parameters:
 * * `title`: The event title (string)
 * * `desc`: The event description (string, unknown html support)
 * * `in_loc`: Event location (string)
 * * `st`: Event start time in ISO 8601 simplified ({@link eventToGCalendar})
 * * `et`: Event end time in ISO 8601 simplified
 * * `v`: `60`
 * @param {Extractor} extractor The extractor
 * @param {SigEvent} event A single event to be calenderized
 * @param {SigRecurrence?} repeat Recurrence metadata, if applicable
 * 
 * @returns {String} 'Add to calendar' link for Yahoo.com calendars
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
            title: extractor.getNameEncoded(event),
            desc: extractor.getDescriptionEncoded(event),
            in_loc: event.location,
            st: startDate,
            et: endDate,
            v: '60'
        }
    });
}

/**
 * Represents a calendar event instance, e.g. an exam, a recurring class or
 * a bill deadline
 * 
 * A calendar event is characterised by:
 * - a title and description that is shown in the calendar client
 * - a start and an end date-time, e.g. starts a 2nd March 8:00 am, and ends
 * by 2nd March 10:00 am
 * - a optional location
 * 
 * The event may be weekly recurrent. See {@link setRecur} to set the
 * recurrence time period. The start/end date-times are calculated accordingly
 * with the defined period. See {@link getRecurRule} to get the recurring rule
 * for ical calendar formats.
 */
class CalEvent {
    /**
     *
     * @param {String} title The event title
     * @param {String} description The event description
     * @param {Date} start The event's starting date-time
     * @param {Date?} end The event's ending date-time. If null/undefined, the
     * event has no duration
     * @param {String?} location The event's location
     */
    constructor(title, description, start, end, location) {
        /** @type {String} */
        this.title = title;
        /** @type {String} */
        this.description = description;
        /** @type {Date} @private */
        this._start = start;
        /** @type {Date} @private */
        this._end = end || start;
        /** @type {String?} */
        this.location = location || null;
        /** @type {Date?} */
        this.recurStart = null;
        /** @type {Date?} */
        this.recurEnd = null;
    }

    /**
     * Set the event as a recurrent event and define the recurrence period
     *
     * @param {Date} recurStart
     * @param {Date} recurEnd
     */
    setRecur(recurStart, recurEnd) {
        this.recurStart = recurStart;
        this.recurEnd = recurEnd;
    }

    /**
     * Calculates the recurrence rule a given event, assuming WEEKLY recurrence.
     * If the event is not recurring (see {@link setRecur}), returns null
     * 
     * @see {@link https://icalendar.org/iCalendar-RFC-5545/3-8-5-3-recurrence-rule.html}
     *
     * @param {CalEvent} event
     * @param {Date} recurStart
     * @param {Date} recurEnd
     *
     * @returns {{freq: "WEEKLY", until: Date}|null}
     */
    static getRecurRule(recurStart, recurEnd) {
        if (recurStart && recurEnd && dayDiff(recurStart, recurEnd) > 6) {
            return {
                freq: "WEEKLY",
                until: recurEnd,
            };
        }

        return null;
    }

    /**
     * @see {CalEvent.getRecurRule}
     * @returns
     */
    getRecurRule() {
        return CalEvent.getRecurRule(this.recurStart, this.recurEnd);
    }

    /**
     * @returns {Date}
     */
    get start() {
        if (this.recurStart && this.recurEnd) return this._calculateDateTime(this._start);
        else return this._start;
    }

    /**
     * @returns {Date}
     */
    get end() {
        if (this.recurStart && this.recurEnd) return this._calculateDateTime(this._end);
        else return this._end;
    }

    /**
     * @private
     * Calculates the start/end datetimes accordingly with the recurrence
     * period
     * 
     * @param {Date} datetime
     * @returns {Date}
     */
    _calculateDateTime(datetime) {
        // convert Date to luxon' DateTime
        const _recur = luxon.DateTime.fromJSDate(this.recurStart);
        const _datetime = luxon.DateTime.fromJSDate(datetime);

        if (_recur > _datetime) {
            // If the recurrence period starts after the original event's
            // datetime, then shift the datetime accordingly
            // For instance, consider an event where the original ocurrence is
            // on tuesdays, starting at 1st March. Then the user changes the
            // recurrence period, to start after 23rd March (Wednesday). Then
            // the events start/end datetimes should be shifted to the first
            // tuesday within the new recurrence period, i.e. 29th March

            // calculate the number of weeks diff
            const { weeks } = _recur.diff(_datetime, "weeks").toObject();
            // shift the datetime forward by 'floor(weeks) + 1' weeks, to ensure
            // it is within the recurrence period
            return _datetime.plus({ weeks: Math.floor(weeks) + 1 }).toJSDate();
        }

        return datetime;
    }
}

