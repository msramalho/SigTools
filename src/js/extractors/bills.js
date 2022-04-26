class Bills extends EventExtractor {
    /** @type {boolean} */
    ignoreHasPaymentRefs = null;

    constructor() {
        super();
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
                            "e.g. Propinas - Mestrado Integrado em Engenharia Informática e Computação - Prestação 1",
                    },
                    {
                        name: "deadline",
                        description: "The payment deadline, e.g. 2019-03-31",
                    },
                    {
                        name: "amount",
                        description: "The amount to pay, e.g. 99,90 €",
                    },
                ],
                storage: {
                    boolean: [
                        {
                            name: "ignoreHasPaymentRefs",
                            default: true,
                        },
                    ],
                },
            },
            "${description}",
            "Amount: ${amount}",
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
                title="Save bills deadlines to your Calendar">
                <img src="${chrome.extension.getURL("icons/calendar.svg")}"/>
            </a>`
        );
        $calendarBtn.addEventListener("click", (e) => createEventsModal(events));

        // insert the button before the table
        this.$pendingBillsTable().insertAdjacentElement("beforebegin", $calendarBtn);
    }

    /**
     * The DOM element for the table that lists the pending bills
     * @returns {HTMLElement | null}
     */
    $pendingBillsTable() {
        const $tables = Sig.doc.querySelectorAll("#tab0 > table");
        return $tables.length > 0 ? $tables[0] : null;
    }

    /**
     * All table rows for pending bills. Each row corresponds to a bill
     * @returns
     */
    $pendingBillsTableRows() {
        const $table = this.$pendingBillsTable();
        return $table ? $table.querySelectorAll("tbody > tr") : null;
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
            // If the bill has a deadline, create an event for it, otherwise skip
            //
            // Also consider the 'ignore if has payment ref' user option
            // The reasoning is if the ATM button does not exist for a pending
            // bill has an ATM, the same bill is listed in another table with
            // the ATM reference. See BillsPaymentRefs extractor. If the user
            // wants, it can be skipped.

            if (bill.deadline && (!this.ignoreHasPaymentRefs || bill.hasATMBtn)) {
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
            return $td ? $td.innerText.trim() : null;
        };

        /**
         * @param {number} index The column index, starting at 1
         * @returns {Number | null}
         */
        const getColumnAsCurrency = ($tr, index) => {
            const value = getColumnAsText($tr, index).replace("€", "").trim();
            // note that parseFloat only supports decimal literals,
            // https://262.ecma-international.org/5.1/#sec-A.2
            // sigarra numbers are formatted in portuguese locale, therefore the
            // , must be replaced by .
            return value && Number.parseFloat(value.replace(".", "").replace(",", "."));
        };

        // get all <tr> for the pendings bills
        const $bills = this.$pendingBillsTableRows();
        if (!$bills) return [];

        // iterate over the table rows, each row => a bill
        // skip first row, it is a table header, inside tbody :)
        const pendingBills = [];

        for (let i = 1; i < $bills.length; i++) {
            const $bill = $bills[i];

            // parse the initial bill amount
            const initialAmount = getColumnAsCurrency($bill, 8);
            // parse the fees value if it exists
            const fees = getColumnAsCurrency($bill, 10) || 0;
            // append new bill information
            pendingBills.push({
                description: getColumnAsText($bill, 3),
                amount: Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(initialAmount + fees),
                deadline: getColumnAsText($bill, 5) || null,
                hasATMBtn: $bill.querySelector(`td:nth-child(9)`).childElementCount !== 0,
            });
        }

        return pendingBills;
    }
}

// add an instance to the EXTRACTORS variable, and also trigger attachIfPossible due to constructor
EXTRACTORS.push(new Bills());
