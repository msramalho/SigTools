class ExamSupervisions extends EventExtractor {
    constructor() {
        super();
        this.ready();
    }

    structure() {
        return super.structure(
            {
                extractor: "supervisions",
                name: "Exam Supervisions",
                description: "Extractor for teacher's exam supervisions",
                icon: "supervision.png",
                parameters: [
                    {
                        name: "name",
                        description: "eg: Programação em Lógica",
                    },
                    {
                        name: "acronym",
                        description: "eg: PLOG",
                    },
                    {
                        name: "url",
                        description: "The URL for the exam's information page",
                    },
                    {
                        name: "rooms",
                        description: "The list of rooms assigned to the exam, if available",
                    },
                ],
            },
            "Exam Supervision - ${acronym} - ${rooms}",
            'Exam Link: <a href="${url}">${name}</a>',
            "FEUP: ${rooms}",
            true,
            CalendarEventStatus.BUSY
        );
    }

    attachIfPossible() {
        // parse all events
        const events = this.parseAllSupervisions();
        if (events.length === 0) return;

        // create the button to open the events modal
        const $calendarBtn = createElementFromString(
            `<a class="calendarBtn"
                style="display: inline-block; margin-left: 0.25em;"
                title="Save exams to your Calendar">
                <img src="${chrome.extension.getURL("icons/calendar.svg")}"/>
            </a>`
        );
        $calendarBtn.addEventListener("click", (e) => createEventsModal(events));

        // attach the button in the header
        const $header = Array.from(document.querySelectorAll("h1")).find(($h) =>
            $h.innerText.startsWith("Vigilâncias de")
        );
        $header && $header.insertAdjacentElement("beforeend", $calendarBtn);
    }

    /**
     * Parses all scheduled exam supervisions, if any
     *
     * @returns {CalendarEvent[]}
     */
    parseAllSupervisions() {
        const events = [];

        // If the user has scheduled supervisions, then there is a table
        // otherwise, the page shows the error message saying there are no
        // registrations
        const $table = document.querySelector("table");
        if (!$table) return events;

        // iterate the table rows (each row => scheduled supervision), but skip
        // the first row because it is the header cells
        const $allTr = $table.querySelectorAll("tr");
        for (let i = 1; i < $allTr.length; i++) {
            const $tr = $allTr[i];

            // for this scheduled exam supervision
            const info = this.parseSupervisionEvent($tr);

            // create a new calendar event
            const event = new CalendarEvent(
                this.getTitle(info), // apply string-format in title
                this.getDescription(info), // apply string-format in description
                this.isHTML,
                info.startTime,
                info.endTime
            ).setLocation(this.getLocation(info));
            event.status = this.status;
            events.push(event);
        }

        return events;
    }

    /**
     * Parses a table row that corresponds to a supervision event
     *
     * @param {HTMLElement} $tr
     * @returns {{
     *  startTime: Date,
     *  endTime: Date,
     *  name: string,
     *  acronym: string,
     *  url: string,
     *  rooms: string?,
     * }}
     */
    parseSupervisionEvent($tr) {
        // The table has the following scheme
        // | Date       | Hour          | Course                                    | Room          |
        // | 2022-05-11 | 17:30-19:30   | SO - Sistemas Operativos (L.EIC015) - 2S  | B???, B???    |
        // Note: the room cell shows all rooms for the exam, not the room allocated to the teacher
        // Besides, the rooms cell may be empty

        // Get all cells
        const $td = $tr.querySelectorAll("td");
        if ($td.length != 4)
            // unexpected table row
            return null;

        // TODO: is it possible that date and times are missing? make code more robust

        // Parse the date
        const date = $td[0].innerText;

        // Parse starting & ending times
        const [startTime, endTime] = $td[1].innerText.split("-");

        // Parse course acronym, full name and hyperlink for the exam page
        const course = $td[2].innerText;
        let [acronym, name] = course.split("-").map((s) => s.trim());
        name = name.replace(/ \(.*\)/, ""); // remove the course identifier, e.g. L.EIC015
        const url = $td[2].querySelector("a").href;

        // Parse rooms, if available
        const rooms = $td[3].innerText || null;

        return {
            startTime: new Date(`${date} ${startTime}`),
            endTime: new Date(`${date} ${endTime}`),
            name,
            acronym,
            url,
            rooms,
        };
    }
}

EXTRACTORS.push(new ExamSupervisions());
