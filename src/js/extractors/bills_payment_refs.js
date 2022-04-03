class BillsPaymentRefs extends EventExtractor {
    constructor() {
        super();
        this.ready();
    }

    structure() {
        return super.structure(
            {
                extractor: "bills_payment_refs",
                name: "Pending Bills (with ATM ref.)",
                description: "Extracts pending bills with generated ATM references",
                icon: "bill.png",
                parameters: [
                    {
                        name: "deadline",
                        description: "The payment deadline, e.g.: '2019-03-31'",
                    },
                    {
                        name: "totalAmount",
                        description:
                            "The total amount to pay, which is the value associated with the ATM reference, e.g. '34,85 €'",
                    },
                    {
                        name: "atm.entity",
                        description: "The ATM entity identifier, e.g. '10316'",
                    },
                    {
                        name: "atm.reference",
                        description: "The ATM payment reference, e.g. '123456789'",
                    },
                    {
                        name: "bills",
                        description:
                            "An array of individual bills associated with the ATM reference. It is an array of {description:string, amount:string} objects",
                    },
                ],
            },
            "${bills.map(b => b.description).join(' & ')}",
            "Payment details:\n\t- Amount: ${totalAmount}\n\t- Entity: ${atm.entity}\n\t- Reference: ${atm.reference}\n\nBills:\n${bills.map(b => '\t- ' + b.description).join('\\n')}",
            "",
            false,
            CalendarEventStatus.FREE
        );
    }

    attachIfPossible() {
        // parse all pending bills
        const events = this.getEvents();
        if (events.length === 0) return;

        // create button for opening the modal
        const $calendarBtn = createElementFromString(
            `<a class="calendarBtn"
                style="display: inline-block;"
                title="Save bills with payment references to your Calendar">
                <img src="${chrome.extension.getURL("icons/calendar.svg")}"/>
            </a>`
        );
        $calendarBtn.addEventListener("click", (e) => createEventsModal(events));

        // insert the button before the table
        this.$billsWithATMTable() && this.$billsWithATMTable().insertAdjacentElement("beforebegin", $calendarBtn);
    }

    /**
     * Get the table listing generated ATM references for one or more pending
     * bills
     * @returns {HTMLElement | null}
     */
    $billsWithATMTable() {
        const $tables = Sig.doc.querySelectorAll("#tab0 > table");
        return $tables.length === 2 ? $tables[1] : null;
    }

    /**
     * Get the table rows for the main table. Each row corresponds to a pending
     * bill. Multiple bills can be associated to the same ATM reference, thus
     * not every row has the ATM details. Check 'rowspan' attributes to
     * determine how many bills are associated per ATM reference.
     * @returns {HTMLElement | null}
     */
    $billsWithATMTableRows() {
        const $tables = Sig.doc.querySelectorAll("#tab0 > table");
        const $tableATM = $tables.length === 2 ? $tables[1] : null;
        return $tableATM ? $tableATM.querySelectorAll("tbody > tr") : null;
    }

    /**
     * Creates calendar events for all pending bills with ATM payment references
     *
     * @returns {CalendarEvent[]}
     */
    getEvents() {
        const eventsLst = [];

        for (const bill of this.parseBillsWithATM()) {
            eventsLst.push(
                CalendarEvent.initAllDayEvent(
                    this.getTitle(bill),
                    this.getDescription(bill),
                    this.isHTML,
                    bill.deadline
                )
                    .setLocation(this.getLocation(bill))
                    .setStatus(CalendarEventStatus.FREE)
            );
        }

        return eventsLst;
    }

    /**
     * Parses all pending bills with generated ATM references
     *
     * @returns {{
     *  deadline: string,
     *  atm: {
     *   entity: string,
     *   reference: string,
     *  },
     *  totalAmount: string,
     *  bills: {
     *   description: string,
     *   amount: string,
     *  }[],
     * }[]}
     */
    parseBillsWithATM() {
        /**
         * @param {number} index The column index, starting at 1
         * @returns {string | null}
         */
        const getColumnAsText = ($tr, index) => {
            const $td = $tr.querySelector(`td:nth-child(${index})`);
            return $td ? $td.innerText.trim() : null;
        };

        // Get all <tr> for the pendings bills
        const $bills = this.$billsWithATMTableRows();
        if (!$bills) return [];

        // Iterate over the table rows, each row => a bill
        // Skip first row, it is a table header, inside tbody :)
        const pendingBills = [];

        for (let i = 1; i < $bills.length; ) {
            const $bill = $bills[i];

            // Determine how many bills were aggregated for the same ATM
            // reference by checking the rowspan attribute
            const span = Number.parseInt($bill.querySelector(`td:nth-child(3)`).getAttribute("rowspan")) || 1;

            // Get the name & amount for all bills aggregated in this ATM
            // reference
            const items = [];
            for (let j = i; j < span + i; j++) {
                items.push({
                    description: getColumnAsText($bills[j], 1),
                    amount: getColumnAsText($bills[j], 2),
                });
            }

            // create info object for this ATM reference
            pendingBills.push({
                deadline: getColumnAsText($bill, 3),
                atm: {
                    entity: getColumnAsText($bill, 4),
                    reference: getColumnAsText($bill, 5),
                },
                totalAmount: getColumnAsText($bill, 6),
                bills: items,
            });

            // advance to the table row of the next ATM reference
            i += span;
        }

        return pendingBills;
    }
}

// add an instance to the EXTRACTORS variable, and also trigger attachIfPossible due to constructor
EXTRACTORS.push(new BillsPaymentRefs());
