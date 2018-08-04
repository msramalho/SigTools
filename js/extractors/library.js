"use strict";

class LibraryExtractor extends Extractor {

    constructor() {
        super();
        this.ready();
    }

    structure() {
        return {
            extractor: "library", // must be unique among extractors
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
            }],
            storage: {
                text: [{
                    name: "title",
                    default: "Return book: ${book}"
                }],
                textarea: [{
                    name: "description",
                    default: "<h1>${book}</h1><br>Return to ${library} and to shelf ${shelf} (current fine: ${fine})"
                }],
                boolean: [ //variables that should be displayed and edited in <input type="checkbox">
                    {
                        name: "apply",
                        default: true
                    },
                    {
                        name: "isHTML",
                        default: true
                    }
                ]
            }
        }
    }


    /**
     * In order for this attach to work, some css code was inserted to format the dropdown button (td.td1 a.calendarBtn.dropBtn, td.td1 div.dropdown.right) which was not the best practice, ...
     */
    attachIfPossible() {
        let table = $("p>table tr.tr1").closest("table") // get the table with the books
        table.find("tr:not(.tr1):not(:last-child)").each((i, e) => { //iterate over each book (table row)
            e = $(e)
            let day = textToDate3(e.find("td:nth-child(3)").text())
            let event = {
                book: table.find("td:nth-child(2)").text(),
                library: table.find("td:nth-child(6)").text(),
                shelf: table.find("td:nth-child(7)").text(),
                fine: table.find("td:nth-child(5)").text(),
                from: day,
                to: day,
                download: true
            }
            event.location = `Library ${event.library} - ${event.shelf}`
            table.find("td:nth-child(3)").append(getDropdown(event, this))
        })
        setDropdownListeners();

    }

    convertToURI(original) {
        let event = jQuery.extend(true, {}, original);
        event.book = encodeURIComponent(event.book);
        event.library = encodeURIComponent(event.library);
        event.shelf = encodeURIComponent(event.shelf);
        event.fine = encodeURIComponent(event.fine);
        return event;
    }

}

// add an instance to the EXTRACTORS variable, and also trigger attachIfPossible due to constructor
EXTRACTORS.push(new LibraryExtractor());