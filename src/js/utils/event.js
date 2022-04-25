/**
 * Enumerator-like class to represent calendar event status. When an
 * {@link CalendarEvent} is added to calendar clients, it may show as busy or
 * free time slots.
 *
 * When you add an exam, you want it to show as "Busy" so that you do not
 * schedule other apointements that colide with the exam event. On the other
 * hand, events that are more like reminders, such as bill and library
 * deadlines, you might prefer to set the event as "Free" as it does not
 * consume time in your agenda.
 *
 * The implementation is inspired in
 * {@link https://2ality.com/2020/01/enum-pattern.html}. Could be more robust,
 * but I think is "enum"-ish enough :)
 */
class CalendarEventStatus {
    /** @private */
    static _allowed = ["Free", "Busy"];

    static FREE = new CalendarEventStatus("Free");
    static BUSY = new CalendarEventStatus("Busy");

    constructor(name) {
        if (!CalendarEventStatus._allowed.includes(name))
            throw Error(`Unknown value '${name}'. Supported values are: ${CalendarEventStatus._allowed.join(",")}`);
        this.name = name;
    }

    static fromValue(val) {
        if (val == "Free") return CalendarEventStatus.FREE;
        else if (val == "Busy") return CalendarEventStatus.BUSY;
    }

    value() {
        return this.name;
    }

    toString() {
        return `CalendarEventStatus.${this.name}`;
    }
}

/**
 * Represents a calendar event instance, e.g. an exam, a recurring class or
 * a bill deadline
 *
 * A calendar event is characterised by:
 * - a title and description that is shown in the calendar client
 * - a start and an end date-time, e.g., starts a 2nd March 8:00 am, and ends
 * by 2nd March 10:00 am
 * - an optional location
 *
 * The event may be weekly recurrent. See {@link setRecur} to set the
 * recurrence time period. The start/end date-times are calculated accordingly
 * with the defined period. See {@link getRecurRule} to get the recurring rule
 * for ical calendar formats.
 *
 * Events can be created as "All Day" events, recommended for for reminder-like
 * events. See {@link initAllDayEvent}.
 *
 * Finally, events have a status. If the status is "FREE" it means the event
 * does not take time in the agenda. If it is "BUSY" it does.
 * The status is used by calendar clients to detect conflicts between
 * overlapping events, in case the events consume time. Or may be used when
 * schedulling a meeting, to find free time slots. In Sigtools, events default
 * to BUSY, except reminder-like events, e.g., bills, library book deadlines,
 * etc. Note: Some calendar clients support additional status,
 * such as "Out of Office", "Tentative", etc. These are not standardized and
 * are not supported.
 */
class CalendarEvent {
    /**
     *
     * @param {String} title The event title
     * @param {String} description The event description
     * @param {Boolean} isHTML If true, the description is HTML, otherwise it
     * is plaintext
     * @param {Date} start The event's starting date-time
     * @param {Date?} end The event's ending date-time. If null/undefined, the
     * event has no duration
     */
    constructor(title, description, isHTML, start, end) {
        /** @type {String} */
        this.title = title;
        /** @type {String} */
        this.description = description;
        /**
         * Flag indicating if the description is in HTML format
         * @type {Boolean}
         */
        this.isHTML = isHTML;
        /**
         * @private
         * The start date-time
         * @type {Date}
         */
        this._start = start;
        /**
         * @private
         * The end date-time
         * @type {Date}
         */
        this._end = end || start;
        /** @type {String?} */
        this.location = null;
        /**
         * The event status. If the status is "FREE" it means the event
         * does not take time in the agenda, if it is "BUSY" it does.
         * @type {CalendarEventStatus}
         */
        this.status = CalendarEventStatus.BUSY;
        /**
         * @private
         * Whether the event is "All Day". This property should not be used
         * directly, instead see {@link initAllDayEvent}. It automatically
         * calculates the correct start and end times to ensure calendar
         * clients mark the event as "All Day".
         * @type {Boolean}
         */
        this._allDay = false;
        /**
         * @private
         * If the event is recurrent, this property indicates the recurrence
         * starting date (time is ignored). See {@link setRecur} for setting
         * a recurrence period.
         *
         * Note that it does not necessarially
         * match {@link _start}. It can be <, =, or > than the provided start
         * date. Hence, the getter {@link start} must re-calculate the starting
         * date accordingly with the recurrence period.
         * @type {Date?} */
        this._recurStart = null;
        /**
         * @private
         * Similar to {@link _recurStart}, but sets the end of recurrence
         * period
         * @type {Date?}
         */
        this._recurEnd = null;
    }

    /**
     * Creates an "All Day" event
     *
     * @param {string} title Event title
     * @param {string} description Event description
     * @param {boolean} isHTML If true, the description is HTML, otherwise it
     * is plaintext
     * @param {string | Date} start The event date. Note: As an "All Day" event
     * , the time is ignored and is always set to midnight
     * @param {string | Date | null} end The event end date if it lasts multiple
     * days. For single day events, you may ommit this parameter
     */
    static initAllDayEvent(title, description, isHTML, start, end) {
        const startDate = new Date(start);
        startDate.setHours(0, 0, 0, 0);

        let endDate;
        if (end) {
            endDate = new Date(end);
            endDate.setHours(0, 0, 0, 0);
            endDate = endDate.addDays(1);
        } else {
            endDate = new Date(startDate).addDays(1);
        }

        const ev = new CalendarEvent(title, description, isHTML, startDate, endDate);
        ev._allDay = true;
        return ev;
    }

    /**
     * Set a location for the event
     * @param {string} loc
     * @returns {CalendarEvent}
     */
    setLocation(loc) {
        this.location = loc;
        return this;
    }

    /**
     * Set the event status
     * @param {CalendarEventStatus} s
     * @returns {CalendarEvent}
     */
    setStatus(s) {
        this.status = s;
        return this;
    }

    /**
     * Set the event as a recurrent event and define the recurrence period
     * @param {Date} recurStart
     * @param {Date} recurEnd
     * @returns {CalendarEvent}
     */
    setRecur(recurStart, recurEnd) {
        this._recurStart = recurStart;
        this._recurEnd = recurEnd;

        return this;
    }

    /**
     * Calculates the recurrence rule a given event, assuming WEEKLY recurrence.
     * If the event is not recurring (see {@link setRecur}), returns null
     *
     * @see {@link https://icalendar.org/iCalendar-RFC-5545/3-8-5-3-recurrence-rule.html}
     *
     * @param {CalendarEvent} event
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
     * @see {CalendarEvent.getRecurRule}
     * @returns {{freq: "WEEKLY", until: Date}|null}
     */
    get recurRule() {
        return CalendarEvent.getRecurRule(this._recurStart, this._recurEnd);
    }

    /**
     * The event starting date-time. If the event is recurrent, the date-time
     * is re-calculated accordingly to ensure the start date-time is within the
     * recurrence period
     * @returns {Date}
     */
    get start() {
        if (this._recurStart && this._recurEnd) return this._calculateDateTime(this._start);
        else return this._start;
    }

    /**
     * The event ending date-time. If the event is recurrent, the date-time
     * is re-calculated accordingly to ensure the end date-time is within the
     * recurrence period
     * @returns {Date}
     */
    get end() {
        if (this._recurStart && this._recurEnd) return this._calculateDateTime(this._end);
        else return this._end;
    }

    /**
     * Get the event title as an encoded string
     * @returns {string}
     */
    get titleEncoded() {
        return encodeURIComponent(this.title);
    }

    /**
     * Get the event description as an encoded string
     * @returns {string}
     */
    get descriptionEncoded() {
        return encodeURIComponent(this.description);
    }

    /**
     * Whether the event is "All Day" or not
     * @returns {boolean}
     */
    get isAllDay() {
        return this._allDay;
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
        const _recur = luxon.DateTime.fromJSDate(this._recurStart);
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
