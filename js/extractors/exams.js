"use strict";

class Exams extends Extractor {

    constructor() {
        super();
        this.table = $("table.dados:not(.mapa)").add("table.dadossz:not(.mapa)");
        this.exams = new Array(this.table.length);
        this.ready();
    }

    structure() {
        return {
            extractor: "exams",
            description: "Extracts exams events from sigarra",
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
                    description: "list of rooms, if available"
                }
            ],
            storage: {
                text: [{
                    name: "title",
                    default: "Exam [${subject.acronym}] - ${location}"
                }],
                textarea: [{
                    name: "description",
                    default: "Exam: ${subject.name} [${subject.acronym}]\nExam page: <a href=\"${subject.url}\">${subject.name}</a>\nInformation:${info}"
                }]
            }
        }
    }


    attachIfPossible() {
        if (this.table) {
            this.table.each((index, table) => {
                table = $(table);
                this.exams[index] = this.exams[index] == undefined ? this.getEvents(index) : this.exams[index];
                if (this.exams[index].events.length != 0) {
                    let saveBtn = $(`<a class="calendarBtn" title="Save exams to your Calendar"><img src="${chrome.extension.getURL("icons/calendar.svg")}"/></a>`);
                    table.before(saveBtn);
                    saveBtn.click(() => {
                        handleEvents(this, this.exams[index].events);
                    });
                }
            });
        }
    }

    getEvents(index) {
        return {
            info: jTry(() => {
                    return $(this.table.eq(index).parents("table")[0]).prev("h3").html().split(" ")[0];
                },
                "Exam"),
            events: this.table.eq(index).parseExamTable()
        };
    }

    convertToURI(event) {
        event.subject.name = encodeURIComponent(event.subject.name);
        event.info = encodeURIComponent(event.info);
        event.subject.url = encodeURIComponent(event.subject.url);
        return event;
    }

    static getEvent(day, exameTd) {
        //calculate the start and end times
        let hours = exameTd.html().match(/\d+:\d+-\d+:\d+/g)[0].replace("-", " - ");
        let start = new Date(day.getTime());
        start = start.setHoursMinutes(hours, 0);
        let end = new Date(day.getTime());
        end = end.setHoursMinutes(hours, 1);
        //get other variables from the html
        let subjectInfo = exameTd.find("a:first-child()");
        return {
            from: start,
            to: end,
            location: jTry(() => {
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

$.prototype.parseExamTable = function() {
    let exams = [];

    this.find("> tbody > tr > th").each((rowIndex, row) => { //iterate each th
        let date = new Date($(row).find("span.exame-data").text());
        let correspTr = this.find(`tbody > tr > td.l.k:eq(${rowIndex})`);
        let correspTable = correspTr.find("table.dados.mapa");
        if (correspTable != undefined) {
            correspTable.find("td.exame").each((exameIndex, exameTd) => {
                exams.push(Exams.getEvent(date, $(exameTd)));
            });
        }
    });

    return exams;
};

// add an instance to the EXTRACTORS variable, and also trigger attachIfPossible due to constructor
EXTRACTORS.push(new Exams());