"use strict";

class LibraryExtractor extends Extractor {

    constructor() {
        super();
        this.ready();
    }

    structure() {
        return {
            extractor: "library",
            description: "Allows users to save book renewal events to their calendars",
            parameters: [{
                name: "book",
                description: "eg: Os Maias"
            }, {
                name: "library",
                description: "eg: FEUP"
            }, {
                name: "shelf",
                description: "eg: 033/Lol/NOT"
            }, {
                name: "fine",
                description: "eg: 0.5€"
            }, {
                name: "renew_link",
                description: "a url to click for renewing the book, eg: https://...?func=BOR_LOAN_RENEW&doc_number=123456..."
            }],
            storage: {
                text: [{
                    name: "title",
                    default: "Return book: ${book}"
                }],
                textarea: [{
                    name: "description",
                    default: "<h1>${book}</h1><br>Return to ${library} and to shelf ${shelf} (current fine: ${fine})<br><a href='${renew_link}'>Renew book</a>"
                }],
                boolean: [
                    {
                        name: "isHTML",
                        default: true
                    }
                ]
            }
        }
    }

    attachIfPossible() {
        let table = $("p>table tr.tr1").closest("table") // get the table with the books
        if (table.length) { // we are in the page with a list of all the books
            table.find("tr:not(.tr1):not(:last-child)").each((i, e) => { //iterate over each book (table row)
                e = $(e)
                let day = textToDate3(e.find("td:nth-child(3)").text())
                let event = {
                    book: table.find("td:nth-child(2)").text(),
                    library: table.find("td:nth-child(6)").text(),
                    shelf: table.find("td:nth-child(7)").text(),
                    fine: table.find("td:nth-child(5)").text(),
                    from: day,
                    to: day
                }
                event.location = `Library ${event.library} - ${event.shelf}`
                table.find("td:nth-child(2):not(:last-child)").append(getDropdown(event, this, false, {
                    target: `dropdown_${i}`,
                    divClass: "dropdown removeFrame"
                }))
            })
        } else { //we are in the page that has the details of a single book
            table = $("div.title ~ br ~ table td.td1").closest("table") // get the table with the books
            // query helper: line, column, index of table (first[0] or second[1]), returns the text in the cell
            // if the row does not exist in table 0, then i=0 means the second table, example barcode: q(7,0)
            let q = (l, i, c = 2) => table.find(`tr:nth-child(${l}) td:nth-child(${c})`).eq(i).text()
            let day = textToDate3(q(2, 0))
            let event = {
                book: `${q(3,1)} (${q(7,0)})`,
                library: q(1, 1),
                shelf: q(3, 1),
                fine: q(4, 0),
                renew_link: table.find("a").get(0).href,
                from: day,
                to: day
            }
            event.location = `Library ${event.library} - ${event.shelf}`
            table.eq(0).prev().before(getDropdown(event, this, false, {
                divClass: "dropdown",
                divStyle: "margin-left:5%;margin-top:15px;"
            }))
        }
        setDropdownListeners();

    }

    convertToURI(event) {
        event.book = encodeURIComponent(event.book);
        event.library = encodeURIComponent(event.library);
        event.shelf = encodeURIComponent(event.shelf);
        event.fine = encodeURIComponent(event.fine);
        event.renew_link = encodeURIComponent(event.renew_link);
        return event;
    }

}

// add an instance to the EXTRACTORS variable, and also trigger attachIfPossible due to constructor
EXTRACTORS.push(new LibraryExtractor());