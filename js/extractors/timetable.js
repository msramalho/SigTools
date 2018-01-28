"use strict";
class ClassesTimetable {
    constructor() {
        this.table = $("table.horario");
        this.timetable = [];
    }

    attachIfPossible() {
        if (this.table) {
            console.log("found");
            let saveBtn = $('<a id="calendarBtn" title="Save this To your Calendar">📆</a>');
            let timespan = $("table.horario-semanas");
            if (timespan.length > 0) timespan.before(saveBtn);
            else this.table.before(saveBtn);
            saveBtn.click((e) => {
                this.timetable = this.timetable.events == undefined ? this.getEvents() : this.timetable;
                handleEvents(this, this.timetable.from, this.timetable.to, this.timetable.events);
            });
        }
    }

    getEvents() {
        let table = this.table.parsetable(false, true);
        let lifetime = $(".bloco-select a").attr("href");
        let lifetimeFrom, lifetimeTo;
        if (lifetime) {
            lifetimeFrom = textToDate(lifetime.match(/p_semana_inicio=(\d*)/)[1]);
            lifetimeTo = textToDate(lifetime.match(/p_semana_fim=(\d*)/)[1]);
        } else {
            $("h3").each((index, h3) => {
                if ($(h3).text().includes("Semanas de ")) {
                    let parts = $(h3).text().replace(" ", "").match(/(\d+-\d+-\d+)/g);
                    lifetimeFrom = textToDate(parts[0].replace("-",""));
                    lifetimeTo = textToDate(parts[1].replace("-",""));
                }
            });
        }
        return {
            from: lifetimeFrom,
            to: lifetimeTo,
            events: $(table).tableToEvents(lifetimeFrom)
        };
    }

    getName(event) {
        return `[${event.acronym}] - ${event.type} - ${event.room.name}`;
    }

    getDescription(event) {
        return `<h3>${event.name}</h3>
            ${getAnchor("Room:", event.room.url, event.room.name)}
            ${getAnchor("Teacher(s):", event.teacher.url, `${event.teacher.name} (${event.teacher.acronym})`)}${getAnchor("Class:", event.class.url, event.class.name)}`;
    }
}
Object.setPrototypeOf(ClassesTimetable.prototype, BaseExtractor);

$.prototype.parsetable = function (dupCols, dupRows, textMode) {
    if (dupCols === undefined) dupCols = false;
    if (dupRows === undefined) dupRows = false;
    if (textMode === undefined) textMode = false;

    let columns = [],
        curr_x = 0,
        curr_y = 0;

    this.find("> tbody > tr").each(function (row_idx, row) { //only the first instance of the table
        curr_y = 0;
        $(" > td, > th", row).each(function (col_idx, col) {
            let rowspan = $(col).attr('rowspan') || 1;
            let colspan = $(col).attr('colspan') || 1;
            let content = $(col).html().replace(/&nbsp;/g, "") || "";

            if (textMode === true) content = $(col).text().trim() || "";

            let x = 0,
                y = 0;
            for (x = 0; x < rowspan; x++) {
                for (y = 0; y < colspan; y++) {
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

$.prototype.tableToEvents = function (fromDate) {
    let events = [];
    for (let i = 1; i < this.length; i++) { //ignore the first column, with times
        let day = this[i];
        let counter = 1; //count the number of blocks this class takes
        for (let j = 2; j < day.length; j++) { //ignore the first row with day names, start at two to see previous
            if ((day[j] != day[j - 1] || j == day.length - 1) && (j <= 0 || day[j - 1].length > 0)) { //if this event stops toDay and is not empty or if its the last event of the day and is not empty
                events.push(getClass(day[j - 1], i, this[0][j - counter], this[0][j - 1], fromDate));
                counter = 1;
            } else if (day[j] == day[j - 1]) {
                counter += 1;
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
            return cell.find("b").text().match(/\((.+)\)/)[1];
        }, ""),
        from: eventFrom,
        to: eventTo,
        class: {
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