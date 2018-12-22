class Bill extends Extractor {
    constructor() {
        super();
        this.ready();
    }

    structure() {
        return {
            extractor: "bills",
            description: "Extracts all pending bills from sigarra",
            parameters: [
                {
                    name: "description",
                    description: "eg: Propinas - Mestrado Integrado em Engenharia Informática e Computação - Prestação 1"
                }, {
                    name: "date",
                    description: "The payment deadline eg: 2019-03-31"
                }, {
                    name: "amount",
                    description: "The amount to pay e.g. 99,90€"
                }
            ],
            storage: {
                text: [{
                    name: "title",
                    default: "${description}"
                }],
                textarea: [{
                    name: "description",
                    default: "Due: ${date}\nAmount: ${amount}"
                }]
            }
        }
    }

    attachIfPossible() {
        let _billsDOM = $('#tab0 > table > tbody > tr'); // array-like object
        _billsDOM = Array.prototype.slice.call(_billsDOM, 1); // array object, removing header row
        let i = 0;
        _billsDOM.forEach(element => {
            let event = this._parsePendingBill(element);
            let drop = getDropdown(event, this, undefined, {target: "dropdown_" + (++i), divClass:"dropdown right removeFrame"});
            $('<td></td>').appendTo(element).append(drop[0]);
        }, this);

        setDropdownListeners(this, undefined);
    }

    convertToURI(event) {
        event.description = encodeURIComponent(event.description);
        event.amount = encodeURIComponent(event.amount);
        return event;
    }

    _parsePendingBill(billEl) {
        let dueDateTxt = $(billEl).children(':nth(4)').text();
        let dueDate;
        if (dueDateTxt === '')
            dueDate = '';
        else
            dueDate = new Date(dueDateTxt);

        return {
            description: $(billEl).children(':nth(2)').text(),
            amount: $(billEl).children(':nth(7)').text(),
            date: dueDate,
            from: dueDate,
            to: dueDate,
            location: "",
            download: false
        };
    }
}

// add an instance to the EXTRACTORS variable, and also trigger attachIfPossible due to constructor
EXTRACTORS.push(new Bill());