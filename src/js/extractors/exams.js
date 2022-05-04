"use strict";

class Exams extends EventExtractor {

    constructor() {
        super();
        this.table = $("table.dados:not(.mapa)").add("table.dadossz:not(.mapa)");
        this.exams = new Array(this.table.length);
        this.ready();
    }

    structure() {
        return super.structure({
            extractor: "exams",
            name: "Exams",
            description: "Extracts exams events from sigarra",
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
                name: "rooms",
                description: "list of rooms, if available"
            }
            ],
        },
            "Exam [${subject.acronym}] - ${rooms}",
            "Exam: ${subject.name} [${subject.acronym}]\nExam page: <a href=\"${subject.url}\">${subject.name}</a>\nInformation: ${info}",
            "${rooms}",
            true,
            CalendarEventStatus.BUSY
        );
    }


    attachIfPossible() {
        if (this.table) {
            this.table.each((index, table) => {
                table = $(table);
                this.exams[index] = this.exams[index] == undefined ? this.getEvents(index) : this.exams[index];
                this.attachButtonEvents(this.exams[index].events, table);
            });

            // attach a button per type of exam, creating a modal that aggregates all exams of that type
            // type of exam is like 'mini teste', 'recurso', 'epoca especial', etc.
            $("h3").each((_, e) => {
                const examType = $(e).text().split(" - ")[1];
                this.attachAllByType(examType);
            });
        }
    }

    /**
     * Attach button for all exams of type `type`
     */
    attachAllByType(type, name) {
        let filteredEvents = this.exams.filter(e => e.info == type).reduce((prev, e) => prev.concat(e.events), []);
        this.attachButtonEvents(filteredEvents, $("h2"), name || type)
    }

    /**
     * attach a button with the popup for the passed elements
     * @param {array} events 
     * @param {DOM} beforeElement 
     */
    attachButtonEvents(events, beforeElement, btnText) {
        btnText = btnText || ""
        if (!events.length) return
        let saveBtn = $(`<a class="calendarBtn" title="Save exams to your Calendar"><b>${btnText}</b> (${events.length})<img src="${chrome.extension.getURL("icons/calendar.svg")}"/></a>`);
        beforeElement.before(saveBtn);
        saveBtn.click(() => createEventsModal(events));
    }

    getEvents(index) {
        return {
            info: jTry(() => {
                return $(this.table.eq(index).parents("table")[0]).prev("h3").html().split(" - ")[1];
            },
                "Exam"),
            events: this.table.eq(index).parseExamTable(this)
        };
    }

    static getEvent(day, exameTd) {
        //calculate the start and end times
        let hours = exameTd.html().match(/\d+:\d+-\d+:\d+/g)[0].replace("-", " - ");
        let start = new Date(day.getTime());
        start = start.setHoursMinutes(hours, 0);
        let end = new Date(day.getTime());
        end = end.setHoursMinutes(hours, 1);
        //get other variables from the html
        let subjectInfo = exameTd.find(">a:first-child()");
        return {
            from: start,
            to: end,
            rooms: jTry(() => {
                return exameTd.find("span.exame-sala").text();
            }, "(No Room)"),
            download: false,
            info: jTry(() => {
                return exameTd.closest("table:not(.dados)").prev("h3").html();
            }, "Exam"),
            subject: {
                name: subjectInfo.attr("title"),
                acronym: subjectInfo.text(),
                url: subjectInfo[0].href
            }
        };
    }
}
/**
 *
 * @param {Exams} extractor
 * @returns {CalendarEvent[]}
 */
$.prototype.parseExamTable = function (extractor) {
    let exams = [];

    this.find("> tbody > tr > th").each((rowIndex, row) => { //iterate each th
        let date = new Date($(row).find("span.exame-data").text());
        let correspTr = this.find(`tbody > tr > td.l.k:eq(${rowIndex})`);
        let correspTable = correspTr.find("table.dados.mapa");
        if (correspTable != undefined) {
            correspTable.find("td.exame").each((exameIndex, exameTd) => {
                // parse the exam information
                const exam = Exams.getEvent(date, $(exameTd));
                // create calendar event
                const event = new CalendarEvent(
                    extractor.getTitle(exam),
                    extractor.getDescription(exam),
                    extractor.isHTML,
                    exam.from,
                    exam.to
                )
                    .setLocation(extractor.getLocation(exam))
                    .setStatus(CalendarEventStatus.FREE);
                // push to array
                exams.push(event);
            });
        }
    });

    return exams;
};

// add an instance to the EXTRACTORS variable, and also trigger attachIfPossible due to constructor
EXTRACTORS.push(new Exams());