"use strict";

class SingleExam extends Extractor {

    constructor() {
        super();
        this.ready();
    }

    structure() {
        return {
            extractor: "single_exam",
            name: "Single Exam",
            description: "Calendar event from a single exam page",
            icon: "exam.png",
            parameters: [{
                    name: "subject.name",
                    description: "eg: Programação em Lógica"
                },
                {
                    name: "subject.acronym",
                    description: "eg: PLOG"
                }, {
                    name: "subject.url",
                    description: "link to the exam page on sigarra"
                }, {
                    name: "info",
                    description: "eg: Normal, Recurso, ..."
                }, {
                    name: "location",
                    description: "list of room names"
                }, {
                    name: "rooms",
                    description: "list of rooms, if available (array of {name, url})"
                }, {
                    name: "teachers",
                    description: "list of teachers present during the exam, if available (array of {name, url})"
                }
            ],
            storage: { // the variables to save for this extractor (in the local storage)
                text: [{
                    name: "title",
                    default: "Exam [${subject.acronym}] ${info} - ${location}"
                }],
                textarea: [{
                    name: "description",
                    default: "Exam ${info}: <a href=\"${subject.url}\">${subject.name}</a><br>Information:${info}<br>Rooms: ${rooms.map(x=>`<a href=\"${x.url}\">${x.name}</a>`)}<br>Teachers: ${teachers.map(x=>`<br><a href=\"${x.url}\">${x.name}</a>`).join(``)}"
                }],
                boolean: [{
                    name: "isHTML",
                    default: true
                }]
            }
        }
    }

    attachIfPossible() {
        $("table").before(getDropdown(this.getEvent(), this))
        setDropdownListeners();
    }

    getEvent() {
        // get array of rows
        let rows = $("table tr td:nth-child(2)").toArray()
        rows = rows.map(r => $(r))

        // date calculations
        let h, m, dh, dm;
        [h, m] = rows[4].text().split(":").map(x => parseInt(x))
        let start = new Date((new Date(rows[3].text())).setHours(h, m));
        [dh, dm] = rows[5].text().split(":").map(x => parseInt(x))
        let end = new Date((new Date(start)).setHours(h + dh, m + dm));

        //get the rooms
        let rooms = rows[6].find("a").toArray().map(a => {
            return {
                name: $(a).text(),
                url: $(a)[0].href
            }
        })

        return {
            subject: {
                name: this._getSubjectName(),
                acronym: rows[0].text(),
                url: rows[0].find("a")[0].href,
            },
            info: rows[2].text().split(" - ")[0],
            from: start,
            to: end,
            duration: rows[5].text(),
            rooms: rooms,
            location: rooms.map(x => x.name).join(', '),
            teachers: rows[7].find("a").toArray().map(a => {
                return {
                    name: $(a).text(),
                    url: $(a)[0].href
                }
            })
        }
    }

    /**
     * Uses jQuery and ReGeX to find the subjects name and return it
     */
    _getSubjectName() {
        let a = $("h1").toArray();
        for (let i = 0; i < a.length; i++) {
            let m = $(a[i]).text().match(/ - (.+) \(/m)
            if (m && m.length >= 1) return m[1]
        }
    }


}

// add an instance to the EXTRACTORS variable, and also trigger attachIfPossible due to constructor
EXTRACTORS.push(new SingleExam());