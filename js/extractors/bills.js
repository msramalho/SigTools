class Bill extends Extractor {
    constructor() {
        super();
        this.ready();
    }

    structure() {
        return {
            extractor: "bills",
            description: "Extracts all pending bills from sigarra",
            parameters: [{
                name: "description",
                description: "eg: Propinas - Mestrado Integrado em Engenharia Informática e Computação - Prestação 1"
            }, {
                name: "date",
                description: "The payment deadline eg: 2019-03-31"
            }, {
                name: "amount",
                description: "The amount to pay e.g. 99,90€"
            }],
            storage: {
                text: [{
                    name: "title",
                    default: "${description}"
                }],
                textarea: [{
                    name: "description",
                    default: "Amount: ${amount}"
                }]
            }
        }
    }

    attachIfPossible() {
        this._getBills().forEach((element, index) => {
            let event = this._parsePendingBill(element);
            let drop = getDropdown(event, this, undefined, {
                target: "dropdown_" + index,
                divClass: "dropdown right removeFrame"
            });
            $('<td></td>').appendTo(element).append(drop[0]);
        }, this);

        setDropdownListeners(this, undefined);
    }

    convertToURI(event) {
        event.description = encodeURIComponent(event.description);
        event.amount = encodeURIComponent(event.amount);
        return event;
    }

    _getBills() {
        let _billsDOM = $('#tab0 > table > tbody > tr'); // array-like object
        return Array.prototype.slice.call(_billsDOM, 1); // array object, removing header row
    }

    _parsePendingBill(billEl) {
        let paymentDeadline = Bill._getDateOrUndefined($(billEl).children(':nth(4)').text());
        if(paymentDeadline === undefined) paymentDeadline = new Date();
        return {
            description: $(billEl).children(':nth(2)').text(),
            amount: $(billEl).children(':nth(7)').text(),
            from: paymentDeadline,
            to: paymentDeadline,
            date: paymentDeadline,
            location: "",
            download: false
        };
    }

    static _getDateOrUndefined(dateString){
        return dateString?new Date(dateString):undefined
    }
}

// add an instance to the EXTRACTORS variable, and also trigger attachIfPossible due to constructor
EXTRACTORS.push(new Bill());