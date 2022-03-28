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
 * - a start and an end date-time, e.g. starts a 2nd March 8:00 am, and ends
 * by 2nd March 10:00 am
 * - a optional location
 *
 * The event may be weekly recurrent. See {@link setRecur} to set the
 * recurrence time period. The start/end date-times are calculated accordingly
 * with the defined period. See {@link getRecurRule} to get the recurring rule
 * for ical calendar formats.
 */
class CalendarEvent {
    /**
     *
     * @param {String} title The event title
     * @param {String} description The event description
     * @param {Boolean} isHTML If true, the title and description are HTML,
     * otherwise it is plaintext
     * @param {Date} start The event's starting date-time
     * @param {Date?} end The event's ending date-time. If null/undefined, the
     * event has no duration
     * @param {String?} location The event's location
     */
    constructor(title, description, isHTML, start, end, location) {
        /** @type {String} */
        this.title = title;
        /** @type {String} */
        this.description = description;
        /** @type {Boolean} */
        this.isHTML = isHTML;
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
        /** @type {CalendarEventStatus} */
        this.status = CalendarEventStatus.BUSY;
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
     * @returns
     */
    get recurRule() {
        return CalendarEvent.getRecurRule(this.recurStart, this.recurEnd);
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

    get titleEncoded() {
        return encodeURIComponent(this.title);
    }

    get descriptionEncoded() {
        return encodeURIComponent(this.description);
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
