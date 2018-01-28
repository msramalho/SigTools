//https://sigarra.up.pt/feup/pt/exa_geral.mapa_de_exames?p_curso_id=742
"use strict";
class ExamsTimetable {
    constructor() {
        this.table = $("table.dados:not(.mapa)");
    }

    attachIfPossible() {
        if (this.table) {
            let saveBtn = $('<a class="calendarBtn" title="Save this To your Calendar">📆</a>');
            this.table.before(saveBtn);
            saveBtn.click((e) => {
                this.exams = this.exams == undefined ? this.getEvents() : this.exams;
                handleEvents(this, this.exams.events);
            });
        }
    }

    getEvents() {
        return {
            info: jTry(() => {
                    return $(this.table.parents("table")[0]).prev("h3").html().split(" ")[0];
                },
                "Exam"),
            events: this.table.parseExamTable()
        };
    }

    getName(event) {
        return `[${event.subject.acronym}] - ${this.exams.info} - ${event.location}`;
    }

    getDescription(event) {
        return `<h3>${this.exams.info} ${event.subject.name} [${event.subject.acronym}]</h3>${getAnchor("Subject:", event.subject.url, event.subject.name)}`;
    }

    static getEvent(day, exameTd) {
        //calculate the start and end times
        let hours = exameTd.html().match(/\d+:\d+-\d+:\d+/g)[0].replace("-", " - ");
        let start = new Date(day.getTime());
        start = start.setHoursMinutes(hours, 0);
        let end = new Date(day.getTime());
        end = end.setHoursMinutes(hours, 1);
        //get other variables from the html
        let rooms = exameTd.find("span.exame-sala").text();
        let subjectInfo = exameTd.find("a:first-child()");
        return {
            from: start,
            to: end,
            location: rooms,
            download: false,
            subject: {
                name: subjectInfo.attr("title"),
                acronym: subjectInfo.text(),
                url: subjectInfo[0].href
            }
        };
    }
}
Object.setPrototypeOf(ExamsTimetable.prototype, BaseExtractor);

$.prototype.parseExamTable = function () {
    let exams = [];

    this.find("> tbody > tr > th").each((rowIndex, row) => { //iterate each th
        let date = new Date($(row).find("span.exame-data").text());
        let correspTable = this.find(`tbody > tr > td > table.dados.mapa:eq(${rowIndex})`);
        correspTable.find("td.exame").each((exameIndex, exameTd) => {
            exams.push(ExamsTimetable.getEvent(date, $(exameTd)));
        });
    });

    return exams;
};



//init on include
let et = new ExamsTimetable();
et.attachIfPossible();