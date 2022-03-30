class BillsExtractor extends Extractor {
    constructor() {
        super();
        this.tableSelector = "#tab0 > table > tbody > tr";
        this.ready();
    }

    structure() {
        return {
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
                    name: "date",
                    description: "The payment deadline eg: 2019-03-31",
                },
                {
                    name: "amount",
                    description: "The amount to pay e.g. 99,90€",
                },
            ],
            storage: {
                text: [
                    {
                        name: "title",
                        default: "${description}",
                    },
                ],
                textarea: [
                    {
                        name: "description",
                        default: "Amount: ${amount}",
                    },
                ],
            },
        };
    }

    attachIfPossible() {
        $("<th>Sigtools</th>").appendTo(this._getBillsHeader()[0]);
        this._getBills().forEach((element, index) => {
            let event = this._parsePendingBill(element);
            let drop = getDropdown(event, this, undefined, {
                target: "dropdown_" + index,
                divClass: "dropdown removeFrame",
                divStyle: "display:contents;",
                dropdownStyle: "position: absolute;",
            });
            $("<td></td>").appendTo(element).append(drop[0]);
        }, this);

        setDropdownListeners(this, undefined);
    }

    _getBills() {
        let _billsDOM = $(this.tableSelector); // array-like object
        return Array.prototype.slice.call(_billsDOM, 1); // array object, removing header row
    }

    _getBillsHeader() {
        return $(this.tableSelector);
    }

    _parsePendingBill(billEl) {
        let getDateFromBill = function (index) {
            let dateFromBill = BillsExtractor._getDateOrUndefined($(billEl).children(`:nth(${index})`).text());
            if (dateFromBill === undefined) dateFromBill = new Date();
            return dateFromBill;
        };
        return {
            description: $(billEl).children(":nth(2)").text(),
            amount: $(billEl).children(":nth(7)").text(),
            from: getDateFromBill(3),
            to: getDateFromBill(4),
            date: getDateFromBill(4),
            location: "",
            download: false,
        };
    }

    static _getDateOrUndefined(dateString) {
        return dateString ? new Date(dateString) : undefined;
    }
}

// add an instance to the EXTRACTORS variable, and also trigger attachIfPossible due to constructor
EXTRACTORS.push(new BillsExtractor());
