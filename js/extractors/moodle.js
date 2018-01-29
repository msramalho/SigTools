//https://sigarra.up.pt/feup/pt/exa_geral.mapa_de_exames?p_curso_id=742
"use strict";
class MoodleEvent {
    constructor() {
        // this.table = $("table.dados:not(.mapa)");
        $(".hasevent").each((index, td) => {
            let popupContent = $(`<div>${$(td).attr("data-core_calendar-popupcontent")}</div>`);
            let newPopupContent = "";
            popupContent.find("div").each((index, div) => {
                div = $(div);
                newPopupContent += MoodleEvent.getNewDiv(div, MoodleEvent.getEvent(div));
            });
            console.log(newPopupContent);
            $(td).attr("data-core_calendar-popupcontent", newPopupContent);
        });
    }
    static getName(event) {
        return `${event.name} (${event.type})`;
    }

    static getDescription(event) {
        return `<h3>${event.name} (${event.type})</h3>${getAnchor("Link:", event.url, "moodle")}`;
    }

    static getNewDiv(div, event) {


        //passar a ter duas getDescription/getName, uma para o ics e outra para o google calendar, que não tem html e não dá merda e pode ir logo no href




        return `
        ${div.find("img")[0].outerHTML}
        <a class="sig_moodleCalendar" href="${encodeURI(eventToGCalendar(MoodleEvent, event)).replace(/\s/g, "%20")}" title="Add this single event to your Google Calendar in One click!"><img class="calendarIconMoodle smallicon" alt="google calendar icon" src="${chrome.extension.getURL("icons/gcalendar.png")}"/></a>
        ${div.find("a")[0].outerHTML}`;
    }

    static getEvent(eventTd) {
        let anchor = eventTd.find("a");
        let d = new Date(parseFloat(anchor[0].href.match(/time=(\d+)/)[1]));
        return {
            name: encodeURIComponent(anchor.text()),
            type: jTry(() => {
                return eventTd.find("img").attr("title");
            }, ""),
            url: anchor[0].href,
            from: d,
            to: d,
            location: "Moodle"
        };
    }
}
Object.setPrototypeOf(MoodleEvent.prototype, BaseExtractor);

//init on include
let extractorMoodleEvent = new MoodleEvent();