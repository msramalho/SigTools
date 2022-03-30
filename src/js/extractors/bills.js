class Bills extends EventExtractor {
    constructor() {
        super();
        this.tableSelector = "#tab0 > table > tbody > tr";
        this.ready();
    }

    structure() {
        return super.structure(
            {
                extractor: "bills",
                name: "Pending Bills",
                description: "Extracts all pending bills from sigarra",
                icon: "bill.png",
                parameters: [
                    {
                        name: "description",
                        description:
                            "eg: Propinas - Mestrado Integrado em Engenharia Informática e Computação - Prestação 1",
                    },
                    {
                        name: "deadline",
                        description: "The payment deadline eg: 2019-03-31",
                    },
                    {
                        name: "amount",
                        description: "The amount to pay e.g. 99,90€",
                    },
                ],
            },
            "${description}",
            "Amount: ${amount}",
            "",
            false,
            CalendarEventStatus.FREE
        );
    }

    /**
     *
     * @returns {HTMLElement | null}
     */
    $pendingBillsTable() {
        const $tables = document.querySelectorAll("#tab0 > table");
        return $tables.length > 0 ? $tables[0] : null;
    }

    /**
     *
     * @returns
     */
    $pendingBillsTableRows() {
        const $table = this.$pendingBillsTable();
        return $table ? $table.querySelectorAll("tbody > tr") : null;
    }

    attachIfPossible() {
        // parse all pending bills
        const events = this.getPendingBillsEvents();
        if (events.length === 0) return;

        // create button for opening the modal
        const $calendarBtn = createElementFromString(
            `<a class="calendarBtn"
                style="display: inline-block; margin-left: 0.25em;"
                title="Save exams to your Calendar">
                <img src="${chrome.extension.getURL("icons/calendar.svg")}"/>
            </a>`
        );
        $calendarBtn.addEventListener("click", (e) => createEventsModal(events));

        // insert the button before the table
        this.$pendingBillsTable().insertAdjacentElement("beforebegin", $calendarBtn);
    }

    getPendingBillsEvents() {
        // list of calendar events for all pending bills with available deadline
        const eventsLst = [];

        const $bills = this.$pendingBillsTableRows();
        if (!$bills) return eventsLst;

        // iterate over the table rows, each row => a bill
        // skip first row, it is a table header, inside tbody :)
        for (let i = 1; i < $bills.length; i++) {
            const $bill = $bills[i];

            // extract the necessary parameters for this bill
            const params = this.parseBill($bill);

            // if the bill has a deadline, create an event for it, otherwise skip
            if (params.deadline) {
                const ev = new CalendarEvent(
                    this.getTitle(params),
                    this.getDescription(params),
                    this.isHTML,
                    params.deadline,
                    null,
                    this.getLocation(params)
                );
                ev.status = this.status;
                eventsLst.push(ev);
            }
        }

        return eventsLst;
    }

    /**
     *
     * @param {HTMLElement} $bill A <tr> element that contains the data
     * regarding a pending bill
     *
     * @returns {{
     *  description: string,
     *  amount: string,
     *  deadline: Date | null,
     * }}
     */
    parseBill($bill) {
        /**
         * @param {number} index The column index, starting at 1
         * @returns {string | null}
         */
        const getColumnText = (index) => {
            const $td = $bill.querySelector(`td:nth-child(${index})`);
            return $td ? $td.innerText : null;
        };

        return {
            description: getColumnText(3),
            amount: getColumnText(8),
            deadline: getColumnText(5) && new Date(getColumnText(5)),
        };
    }
}

// add an instance to the EXTRACTORS variable, and also trigger attachIfPossible due to constructor
EXTRACTORS.push(new Bills());
