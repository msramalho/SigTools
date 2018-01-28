//https://sigarra.up.pt/feup/pt/exa_geral.mapa_de_exames?p_curso_id=742
"use strict";
class ExamsTimetable {
    constructor() {
        this.table = $("table.dados:not(.mapa)");
    }

    attachIfPossible() {
        if (this.table) {
            let saveBtn = $('<a id="calendarBtn" title="Save this To your Calendar">📆</a>');
            this.table.before(saveBtn);
            /* saveBtn.click((e) => {
                this.timetable = this.timetable.events == undefined ? this.getEvents() : this.timetable;
                handleEvents(this, this.timetable.from, this.timetable.to, this.timetable.events);
            }); */
        }
    }

    getEvents() {
        /* let table = this.table.parsetable(false, true);
        let lifetime = $(".bloco-select a").attr("href");
        let lifetimeFrom, lifetimeTo;
        if (lifetime) {
            lifetimeFrom = textToDate(lifetime.match(/p_semana_inicio=(\d*)/)[1]);
            lifetimeTo = textToDate(lifetime.match(/p_semana_fim=(\d*)/)[1]);
        } else {
            $("h3").each((index, h3) => {
                if ($(h3).text().includes("Semanas de ")) {
                    let parts = $(h3).text().replace(" ", "").match(/(\d+-\d+-\d+)/g);
                    lifetimeFrom = textToDate(parts[0].replace("-", ""));
                    lifetimeTo = textToDate(parts[1].replace("-", ""));
                }
            });
        }
        return {
            from: lifetimeFrom,
            to: lifetimeTo,
            events: $(table).tableToEvents(lifetimeFrom)
        }; */
    }

    getName(event) {
        // return `[${event.acronym}] - ${event.type} - ${event.room.name}`;
    }

    getDescription(event) {
        // return `<h3>${event.name}</h3>
        //     ${getAnchor("Room:", event.room.url, event.room.name)}
        //     ${getAnchor("Teacher(s):", event.teacher.url, `${event.teacher.name} (${event.teacher.acronym})`)}${getAnchor("Class:", event.class.url, event.class.name)}`;
    }
}
Object.setPrototypeOf(ExamsTimetable.prototype, BaseExtractor);

//init on include
let et = new ExamsTimetable();
et.attachIfPossible();