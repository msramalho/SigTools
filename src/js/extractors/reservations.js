class Reservations extends EventExtractor {
    constructor() {
        super();
        this.ready();
    }

    structure() {
        return super.structure(
            {
                extractor: "reservations",
                name: "Resource Reservations",
                description: "Add your resource reservations (e.g. library cabinets) to your Calendar",
                icon: "reservations.png",
                parameters: [
                    {
                        name: "room.name",
                        description: "E.g., C616",
                    },
                    {
                        name: "room.url",
                        description: "",
                    },
                ],
            },
            "Room reservation - ${room.name}",
            "Room url: ${room.url}",
            "FEUP: ${room.name}",
            false,
            CalendarEventStatus.FREE
        );
    }

    attachIfPossible() {
        if (this.url.match(/res_recursos_geral.pedidos_view/i)) {
            // single reservation view
            this.attachReservationView();
        }
        else if (this.url.match(/res_recursos_geral.pedidos_list/i)) {
            // list of scheduled reservations view
            this.attachReservationsList();
        }
    }

    /**
     * Auxiliar to get the nth cell of a table row
     * @param {HTMLElement} $tr Table row element
     * @param {number} index Cell index (starting at 1)
     * @returns {HTMLElement|undefined}
     */
    $getNthCell($tr, index) {
        return $tr.querySelector(`td:nth-child(${index})`);
    }

    /**
     * Attach calendar button for single reservation view
     */
    attachReservationView() {
        // parse information
        const info = this.parseReservationView();
        if (!info) return;

        // create event
        const event = new CalendarEvent(this.getTitle(info), this.getDescription(info), this.isHTML, info.from, info.to)
            .setLocation(this.getLocation(info))
            .setStatus(CalendarEventStatus.FREE);

        // create the dropdown and table cell. append it on the Sigarra's table
        const $dropdown = createEventDropdown(event);

        // attach the dropdown on DOM
        Sig.doc.querySelector("h1").insertAdjacentElement("afterend", $dropdown);
    }

    /**
     * Attach calendar button for list of scheduled reservations
     */
    attachReservationsList() {
        // parse all information
        const info = this.parseReservationsList();
        if (!info) return;

        // create calendar events
        const events = info.map((i) =>
            new CalendarEvent(this.getTitle(i), this.getDescription(i), this.isHTML, i.from, i.to)
                .setLocation(this.getLocation(i))
                .setStatus(CalendarEventStatus.FREE)
        );

        // create button for opening the modal
        const $calendarBtn = createElementFromString(
            `<a class="calendarBtn"
                style="display: inline-block; margin-left: 0.5em;"
                title="Save bills deadlines to your Calendar">
                <img src="${chrome.extension.getURL("icons/calendar.svg")}"/>
            </a>`
        );
        $calendarBtn.addEventListener("click", (e) => createEventsModal(events));

        // insert the button before the table
        Sig.doc.querySelector("h1:nth-of-type(2)").insertAdjacentElement("beforeend", $calendarBtn);
    }

    /**
     * @returns {{
     *  from: Date,
     *  to: Date,
     *  room: {
     *      name: string,
     *      url: string,
     *  }}
     * | null }
     */
    parseReservationView() {
        const $details = Sig.doc.querySelector("table:nth-of-type(2) tr:nth-of-type(2)");
        if (!$details) return null;

        try {
            const date = this.$getNthCell($details, 1).textContent.trim();
            const timeFrom = this.$getNthCell($details, 3).textContent.trim();
            const timeTo = this.$getNthCell($details, 4).textContent.trim();
            const roomName = this.$getNthCell($details, 6).textContent.trim();
            const roomUrl = this.$getNthCell($details, 6).querySelector("a").href;

            return {
                from: new Date(`${date} ${timeFrom}`),
                to: new Date(`${date} ${timeTo}`),
                room: {
                    name: roomName,
                    url: roomUrl,
                },
            };
        } catch (error) {
            Logger.error(error);
            return null;
        }
    }

    /**
     * @returns {{
     *  from: Date,
     *  to: Date,
     *  room: {
     *      name: string,
     *      url: string,
     *  }}[]}
     */
    parseReservationsList() {
        const events = [];

        for (const $res of Sig.doc.querySelectorAll("table.dados table.dados tr:nth-of-type(2)")) {
            try {
                const date = this.$getNthCell($res, 1).textContent.trim();
                const timeFrom = this.$getNthCell($res, 3).textContent.trim();
                const timeTo = this.$getNthCell($res, 4).textContent.trim();
                const roomName = this.$getNthCell($res, 6).textContent.trim();
                const roomUrl = this.$getNthCell($res, 6).querySelector("a").href;

                events.push({
                    from: new Date(`${date} ${timeFrom}`),
                    to: new Date(`${date} ${timeTo}`),
                    room: {
                        name: roomName,
                        url: roomUrl,
                    },
                });
            } catch (error) {
                Logger.error(error);
            }
        }

        return events;
    }
}

// add an instance to the EXTRACTORS variable, and also trigger attachIfPossible due to constructor
EXTRACTORS.push(new Reservations());
