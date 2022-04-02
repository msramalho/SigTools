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
        const events = this.getEvents();
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

    /**
     * Creates calendar events for all pending bills, as long as they have
     * a deadline
     * 
     * @returns {CalendarEvent[]}
     */
    getEvents() {
        const eventsLst = [];

        for (const bill of this.parsePendingBills()) {
            // if the bill has a deadline, create an event for it, otherwise skip
            if (bill.deadline) {
                const ev = CalendarEvent.initAllDayEvent(
                    this.getTitle(bill),
                    this.getDescription(bill),
                    this.isHTML,
                    bill.deadline
                )
                    .setLocation(this.getLocation(bill))
                    .setStatus(CalendarEventStatus.FREE);
                eventsLst.push(ev);
            }
        }

        return eventsLst;
    }

    /**
     * Parses all pending bills found in the table
     * 
     * @returns {{
     *  description: string,
     *  amount: string,
     *  deadline: string | null,
     * }[]}
     */
    parsePendingBills() {
        /**
         * @param {number} index The column index, starting at 1
         * @returns {string | null}
         */
        const getColumnAsText = ($tr, index) => {
            const $td = $tr.querySelector(`td:nth-child(${index})`);
            return $td ? $td.innerText : null;
        };

        /**
         * @param {number} index The column index, starting at 1
         * @returns {Number | null}
         */
        const getColumnAsNumber = ($tr, index) => {
            const value = getColumnAsText($tr, index).replace("€", "").trim();
            // note that parseFloat only supports decimal literals,
            // https://262.ecma-international.org/5.1/#sec-A.2
            // sigarra numbers are formatted in portuguese locale, therefore the
            // , must be replaced by .
            return value && Number.parseFloat(value.replace(".", "").replace(",", "."));
        };

        // get all <tr> for the pendings bills
        const $bills = this.$pendingBillsTableRows();

        // iterate over the table rows, each row => a bill
        // skip first row, it is a table header, inside tbody :)
        const pendingBills = [];

        for (let i = 1; i < $bills.length; i++) {
            const $bill = $bills[i];

            // parse the initial bill amount
            const initialAmount = getColumnAsNumber($bill, 8);
            // parse the fees value if it exists
            const fees = getColumnAsNumber($bill, 10) || 0;

            pendingBills.push({
                description: getColumnAsText($bill, 3).trim(),
                amount: Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(initialAmount + fees),
                deadline: getColumnAsText($bill, 5) || null,
            });
        }

        return pendingBills;
    }
}

// add an instance to the EXTRACTORS variable, and also trigger attachIfPossible due to constructor
EXTRACTORS.push(new Bills());
