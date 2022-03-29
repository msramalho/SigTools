"use strict";

class Timetable extends Extractor {

    constructor() {
        super();
        this.table = $("table.horario");
        this.timetable = [];
        this.ready();
    }

    structure() {
        return {
            extractor: "timetable",
            name: "Timetables",
            description: "Extracts timetables from sigarra",
            icon: "timetable.png",
            parameters: [{
                    name: "name",
                    description: "eg: Programação em Lógica"
                },
                {
                    name: "acronym",
                    description: "eg: PLOG"
                },{
                    name: "type",
                    description: "eg: T, TP, PL"
                },{
                    name: "room.name",
                    description: "eg: B001"
                },{
                    name: "room.url",
                    description: "link to the room on sigarra"
                },{
                    name: "klass.name",
                    description: "eg: 5MIEIC01"
                },{
                    name: "klass.url",
                    description: "link to the class information"
                },{
                    name: "teacher.name",
                    description: "eg: Raul Moreira Vidal"
                },{
                    name: "teacher.acronym",
                    description: "eg: RMV"
                },{
                    name: "teacher.url",
                    description: "link to the teacher page on sigarra"
                }
            ],
            storage: {
                text: [{
                        name: "title",
                        default: "[${acronym}] - ${type} - ${room.name}"
                    }
                ],
                textarea: [
                    {
                        name: "description",
                        default: "Type: ${type}\nClass: <a href=\"${klass.url}\">${klass.name}</a>\nTeacher: <a href=\"${teacher.url}\">${teacher.name} (${teacher.acronym})</a>\nRoom: <a href=\"${room.url}\">${room.name}</a>"
                    }
                ],
                boolean: [{
                    name: "isHTML",
                    default: true
                }]
            }
        }
    }

    attachIfPossible() {
        if (this.table) {
            let saveBtn = $(`<a class="calendarBtn" title="Save timetable to your Calendar"><img src="${chrome.extension.getURL("icons/calendar.svg")}"/></a>`);
            let timespan = $("table.horario-semanas");
            if (timespan.length > 0) timespan.before(saveBtn);
            else this.table.before(saveBtn);
            saveBtn.click((e) => {
                this.timetable = this.timetable.events == undefined ? this.getEvents() : this.timetable;
                handleEvents(this, this.timetable.events, this.timetable.from, this.timetable.to);
            });
        }
    }

    getEvents() {
        let table = this.table.parseTable(false, true);
        let lifetime = $(".bloco-select a").attr("href");
        let lifetimeFrom, lifetimeTo;
        if (lifetime) {
            lifetimeFrom = textToDate(lifetime.match(/p_semana_inicio=(\d*)/)[1]);
            lifetimeTo = textToDate(lifetime.match(/p_semana_fim=(\d*)/)[1]);
        } else {
            $("h3").each((index, h3) => {
                if ($(h3).text().includes("Semanas de ")) {
                    let parts = $(h3).text().replace(" ", "").match(/(\d+-\d+-\d+)/g);
                    lifetimeFrom = textToDate2(parts[0]);
                    lifetimeTo = textToDate2(parts[1]);
                }
            });
        }
        let events = $(table).tableToEvents(lifetimeFrom);
        if (this.table.parent("div").next("div").find("table.dados th[colspan=6]")[0] != undefined) {
            //if there is a table for overlaping classes
            this.table.parent("div").next("div").find("table.dados tr.d").each((trIndex, tr) => {
                events.push(getOverlappingClass(tr.innerHTML, lifetimeFrom)); //could send only events prior to this if, but no real impact
            });
        }
        return {
            from: lifetimeFrom,
            to: lifetimeTo,
            events: events
        };
    }

}

$.prototype.parseTable = function(dupCols, dupRows, textMode) {
    if (dupCols === undefined) dupCols = false;
    if (dupRows === undefined) dupRows = false;
    if (textMode === undefined) textMode = false;

    let columns = [],
        curr_x = 0,
        curr_y = 0;

    this.find("> tbody > tr").each(function(row_idx, row) { //only the first instance of the table
        curr_y = 0;
        $(" > td, > th", row).each(function(col_idx, col) {
            let rowspan = $(col).attr('rowspan') || 1;
            let colspan = $(col).attr('colspan') || 1;
            let content = $(col).html().replace(/&nbsp;/g, "") || "";

            if (textMode === true) content = $(col).text().trim() || "";

            for (let x = 0; x < rowspan; x++) {
                for (let y = 0; y < colspan; y++) {
                    if (columns[curr_y + y] === undefined)
                        columns[curr_y + y] = []

                    while (columns[curr_y + y][curr_x + x] !== undefined) {
                        curr_y += 1
                        if (columns[curr_y + y] === undefined)
                            columns[curr_y + y] = []
                    }

                    if ((x === 0 || dupRows) && (y === 0 || dupCols))
                        columns[curr_y + y][curr_x + x] = content
                    else
                        columns[curr_y + y][curr_x + x] = ""
                }
            }
            curr_y += 1;
        });
        curr_x += 1;
    });
    return columns;
};

$.prototype.tableToEvents = function(fromDate) {
    let events = [];
    for (let i = 1; i < this.length; i++) { //ignore the first column, with times
        let day = this[i];
        let counter = 1; //count the number of blocks this class takes
        for (let j = 2; j < day.length; j++) { //ignore the first row with day names, start at two to see previous
            if ((day[j] != day[j - 1] || j == day.length - 1) && (day[j - 1].length > 0)) { //if this event stops toDay and is not empty or if its the last event of the day and is not empty
                events.push(getClass(day[j - 1], i, this[0][j - counter], this[0][j - 1], fromDate));
                counter = 1;
            } else if (day[j] == day[j - 1]) {
                counter += 1;
            } else if (day[j] != day[j - 1]) {
                counter = 1;
            }
        }
    }
    return events;
};

/**
 * Get an object with all the class information (time, teacher, room, ...) from the table cell html
 * @param {string} html the content of the cell in the timetable
 * @param {integer} dayOfWeek from 1 to 6 (Monday to Saturday)
 * @param {string} from eg. 08:30 - 09:00
 * @param {string} to eg. 10:30 - 11:00
 * @param {Date} the date of the first Sunday
 */
function getClass(html, dayOfWeek, from, to, firstSunday) {
    if (html == "") return {};

    //variables that simplify selection
    let cell = $("<div>" + html + "</div>");
    let classAnchor = cell.find("span.textopequenoc a");
    let roomTd = cell.find("table.formatar td:first-child()");
    let teacherTd = cell.find("table.formatar td.textod");

    //time management variables
    let eventFrom = new Date(firstSunday.getTime());
    eventFrom = eventFrom.addDays(dayOfWeek); //monday adds 1 day to sunday and so on
    eventFrom = eventFrom.setHoursMinutes(from, 0); //split from and set those as the date hours and minutes
    let eventTo = eventFrom.setHoursMinutes(to, 1);

    return {
        name: jTry(() => {
            return cell.find("b acronym").attr("title");
        }, "NotFound"),
        acronym: jTry(() => {
            return cell.find("b a").html();
        }, ""),
        type: jTry(() => {
            return getClassType(cell.find("b").text());
        }, ""),
        from: eventFrom,
        to: eventTo,
        klass: {
            name: jTry(() => {
                    return classAnchor.text();
                }, ""),
                url: jTry(() => {
                    return classAnchor[0].href;
                }, ""),
        },
        location: jTry(() => {
            return roomTd.text(); // duplicate information due to modular approach
        }, ""),
        room: {
            name: jTry(() => {
                return roomTd.text();
            }, ""),
            url: jTry(() => {
                return roomTd.find("a")[0].href;
            }, ""),
        },
        teacher: {
            name: jTry(() => {
                return teacherTd.find("acronym").attr("title");
            }, teacherTd.text()),
            acronym: jTry(() => {
                return teacherTd.find("a").text();
            }, teacherTd.text()),
            url: jTry(() => {
                return teacherTd.find("a")[0].href;
            }, "")
        },
        download: true
    };
}

/**
 * Get an object with all the class information (time, teacher, room, ...) from the table cell html
 * @param {string} html the content of the cell in the timetable
 * @param {Date} the date of the first Sunday
 */
function getOverlappingClass(html, firstSunday) {
    if (html == "") return {};

    //variables that simplify selection
    let cell = $("<table>" + html + "</table>");
    let roomAnchor = cell.find('[headers="t4"] a');
    let teacherAnchor = cell.find('[headers="t5"] a');
    let classAnchor = cell.find('[headers="t6"] a');
    let t1 = cell.find('[headers="t1"]');
    let acronym = t1.find("a").text();

    //time management variables
    let eventFrom = new Date(firstSunday.getTime());
    eventFrom = eventFrom.addDays(getPtDayOfWeek(cell.find('[headers="t2"]').text())); //monday adds 1 day to sunday and so on
    eventFrom = eventFrom.setHoursMinutes(`${cell.find('[headers="t3"]').text()} - `, 0); //split from and set those as the date hours and minutes, reuse the function for getClass
    let eventTo = new Date(eventFrom.getTime() + getDurationFromUser(acronym));
    return {
        name: jTry(() => {
            return t1.find("acronym").attr("title");
        }, "No Name"),
        acronym: acronym,
        type: jTry(() => {
            return getClassType(t1.selfText().trim());
        }, ""),
        from: eventFrom,
        to: eventTo,
        klass: {
            name: jTry(() => {
                    return classAnchor.text();
                }, ""),
                url: jTry(() => {
                    return classAnchor[0].href;
                }, ""),
        },
        location: jTry(() => {
            return roomAnchor.text(); // duplicate information due to modular approach
        }, ""),
        room: {
            name: jTry(() => {
                return roomAnchor.text();
            }, ""),
            url: jTry(() => {
                return roomAnchor[0].href;
            }, ""),
        },
        teacher: {
            name: jTry(() => {
                return teacherAnchor.attr("title");
            }, teacherAnchor.text()),
            acronym: jTry(() => {
                return teacherAnchor.text();
            }, "No Teacher"),
            url: jTry(() => {
                return teacherAnchor[0].href;
            }, "")
        },
        download: true,
        overlap: true
    };
}

/**
 * prompt the user for the class duration, since it is not present
 * @param {string} acronym
 * @returns duration in milliseconds,
 */
function getDurationFromUser(acronym) {
    return Number(prompt(`An overlapping class was found and there is no information about it's duration. Please insert its duration in minutes (class ${acronym}):`, 120)) * 60 * 1000; //60 * 60 * 1000;
}

/**
 * get the type of a class, enclosed in parentheses
 * @param {String} str in the format: "(TYPE)"
 * @returns TYPE
 */
function getClassType(str) {
    return str.match(/\((.+)\)/)[1];
}

// add an instance to the EXTRACTORS variable, and also trigger attachIfPossible due to constructor
EXTRACTORS.push(new Timetable());