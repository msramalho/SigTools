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
 * @deprecated
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
 * @deprecated
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
 * @deprecated
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
 * @deprecated
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
 * Generate URLs for adding singular events in common online calendars such
 * as Google, Microsoft Outlook/Office 365 and Yahoo
 */
class CalendarUrlGenerator {
    /**
     *
     * @param {CalendarEvent} event
     */
    constructor(event) {
        this.event = event;
        this.recur = event.recurRule;
    }

    /**
     * Create a 'Add to Calendar' URL for Google Calendar
     *
     * @returns {String} 'Add to calendar' link for Google Calendars
     */
    google() {
        /**
         * Base URL: `https://calendar.google.com/calendar/render`
         *
         * Query parameters:
         * * `action`: `TEMPLATE`
         * * `dates`: `<start date>/<end date>`
         *      * in ISO 8601 simplified (YYYYMMDDTHHmmss+Z)
         *      * if event is allday, just remove the times
         * * `text`: The event title (string)
         * * `details`: The event description (string, with html support)
         * * `location`: Event location (string)
         * * `recur`: A recurrence rule with format `RRULE:FREQ=<freq>;UNTIL=<date>`
         *   * Standard: {@link https://icalendar.org/iCalendar-RFC-5545/3-8-5-3-recurrence-rule.html}
         * * Date is in the same format as start/end dates
         */
        const luxonSettings = {
            format: "basic",
            suppressMilliseconds: true,
            includeOffset: false,
        };
        
        // If the event is "All Day", format the start and end dates as ISO
        // dates, e.g. `20220425`, without any time or timezones offsets
        // Otherwise, use the ISO date-time format without offset, e.g.,
        // 20220425T173000
        let startDate, endDate;
        if (this.event.isAllDay) {
            startDate = DateTime.fromJSDate(this.event.start).toISODate(luxonSettings);
            endDate = DateTime.fromJSDate(this.event.end).toISODate(luxonSettings);
        } else {
            startDate = DateTime.fromJSDate(this.event.start).toISO(luxonSettings);
            endDate = DateTime.fromJSDate(this.event.end).toISO(luxonSettings);
        }

        return this._compileURL({
            baseURL: "https://calendar.google.com/calendar/render",
            queryParams: {
                action: "TEMPLATE",
                dates: `${startDate}/${endDate}`,
                text: this.event.titleEncoded,
                details: this.event.descriptionEncoded,
                location: this.event.location,
                recur: this.recur
                    ? `RRULE:FREQ=${this.recur.freq};UNTIL=${DateTime.fromJSDate(this.recur.until).toISO(
                          luxonSettings
                      )}`
                    : null,
            },
        });
    }

    /**
     * Create a 'Add to Calendar' URL for Outlook.com
     *
     * @returns {String} 'Add to calendar' link for Outlook.com calendars
     */
    outlook() {
        /**
         * Base URL: `https://outlook.live.com/calendar/0/deeplink/compose`
         *
         * Query parameters: {@link _getMicrosoftQueryParams}
         */
        return this._compileURL({
            baseURL: "https://outlook.live.com/calendar/0/deeplink/compose",
            queryParams: this._getMicrosoftQueryParams(),
        });
    }

    /**
     * Create a 'Add to Calendar' URL for Office365
     *
     * @returns {String} 'Add to calendar' link for Office365 calendars
     */
    office365() {
        /**
         * Base URL: `https://outlook.office.com/calendar/0/deeplink/compose`
         *
         * Query parameters: {@link _getMicrosoftQueryParams}
         */
        return this._compileURL({
            baseURL: "https://outlook.office.com/calendar/0/deeplink/compose",
            queryParams: this._getMicrosoftQueryParams(),
        });
    }

    /**
     * Create a 'Add to Calendar' URL for Yahoo
     *
     * @returns {String} 'Add to calendar' link for Yahoo.com calendars
     */
    yahoo() {
        /**
         * Base URL: `https://calendar.yahoo.com/`
         *
         * Query parameters:
         * * `title`: The event title (string)
         * * `desc`: The event description (string, unknown html support)
         * * `in_loc`: Event location (string)
         * * `st`: Event start time in ISO 8601 simplified ({@link google})
         * * `et`: Event end time in ISO 8601 simplified
         * * `v`: `60`
         * * `dur`: technically could replace the `et`, but we use for marking
         * events as "All Day" events, setting `dur=allday`
         */
        
        const luxonSettings = {
            format: "basic",
            suppressMilliseconds: true,
            includeOffset: false,
        };

        // Similarly to Google links, if the event is "All Day", format the
        // start and end dates as ISO dates, e.g. `20220425`, without any time
        // or timezones offsets
        // Otherwise, use the ISO date-time format without offset, e.g.,
        // 20220425T173000
        let startDate, endDate;
        if (this.event.isAllDay) {
            startDate = DateTime.fromJSDate(this.event.start).toISODate(luxonSettings);
            endDate = DateTime.fromJSDate(this.event.end).toISODate(luxonSettings);
        } else {
            startDate = DateTime.fromJSDate(this.event.start).toISO(luxonSettings);
            endDate = DateTime.fromJSDate(this.event.end).toISO(luxonSettings);
        }

        return __compileURL({
            baseURL: "https://calendar.yahoo.com/",
            queryParams: {
                title: this.event.titleEncoded,
                desc: this.event.descriptionEncoded,
                in_loc: this.event.location,
                st: startDate,
                et: endDate,
                v: "60",
                dur: this.event.isAllDay ? "allday" : null
            },
        });
    }

    /**
     * @private
     * Creates the final URL for adding events to third-party calendars, formating
     * the query parameters automatically
     *
     * @param {Object} url
     * @param {String} url.baseURL - The base URL for the third-party calendar
     * @param {Object} url.queryParams - An object of key/values for query
     * parameters. Null/undefined values are skipped automatically
     *
     * @returns {String} URL string, e.g.
     * `https://calendar.google.com/calendar/render/?text=Example&dates=...`
     */
    _compileURL(url) {
        return (
            url.baseURL +
            "?" +
            Object.entries(url.queryParams)
                // remove parameters with undefined values (e.g. start and end time)
                .filter(([key, value]) => value !== undefined && value !== null)
                .map(([key, value]) => `${key}=${value}`)
                .join("&")
        );
    }

    /**
     * @private
     * Prepares query parameters for Office365 and Outlook.com 'Add to calendar'
     * links
     *
     * Query parameters:
     * * `path`: `/calendar/action/compose`
     * * `rru`: `addevent`
     * * `subject`: The event title (string)
     * * `body`: The event description (string, no html support)
     * * `location`: Event location (string)
     * * `startdt`: Event start time in ISO 8601 (YYYY-mm-ddTHH:mm:ss+Z).
     * * `enddt`: Event start time in ISO 8601 (YYYY-mm-ddTHH:mm:ss+Z)
     *      * Apparently, timezone offsets are not supported, convert to UTC
     *      instead
     * * `allday`: If true, the event is configured as "All Day"
     *
     * @see {@link https://en.wikipedia.org/wiki/ISO_8601 ISO 8601}
     *
     * @returns {Object} Object of key/value for the supported query parameters
     * in Microsoft calendars
     */
    _getMicrosoftQueryParams() {
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
        const customEncode = (str) => str.split("\u0020").join("\u2009");

        const luxonSettings = {
            suppressMilliseconds: true,
            includeOffset: true,
        };

        const startDate = DateTime.fromJSDate(this.event.start).toUTC().toISO(luxonSettings);
        const endDate = DateTime.fromJSDate(this.event.end).toUTC().toISO(luxonSettings);

        return {
            rru: "addevent",
            subject: encodeURIComponent(customEncode(this.event.title)),
            startdt: startDate,
            enddt: endDate,
            location: encodeURIComponent(customEncode(this.event.location || "")),
            body: encodeURIComponent(customEncode(this.event.description)),
            path: "/calendar/action/compose",
            allday: this.event.isAllDay
        };
    }
}
