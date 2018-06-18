"use strict";
class MoodleEvent {
    constructor() {
        $(".hasevent").each((index, td) => {
            let popupContent = $(`<div>${$(td).attr("data-core_calendar-popupcontent")}</div>`);
            let newPopupContent = "";
            popupContent.find("div").each((index, div) => {
                div = $(div);
                newPopupContent += MoodleEvent.getNewDiv(div, MoodleEvent.getEvent(div));
            });
            $(td).attr("data-core_calendar-popupcontent", newPopupContent);
        });
    }

    static convertToURI(original) {
        let event = jQuery.extend(true, {}, original);
        event.url = encodeURIComponent(event.url);
        return event;
    }

    /**
     *
     * @param {*} event
     * @param {*} forUrl
     * @param {*} noHTML If true, returns the description in plain text. Otherwise, returns the description HTML formatted
     */

    static getNewDiv(div, event) {
        var google_url = eventToGCalendar(MoodleEvent, event);
        var outlook_url = eventToOutlookCalendar(MoodleEvent, event);

        // Browsers ignore newlines on the URLs, they are ommited. Therefore, I encode all newlines if formats are plain text

        return `
        ${div.find("img")[0].outerHTML}
        ${generateOneClickDOM("sig_moodleCalendar", "calendarIconMoodle smallicon", "google", google_url, MoodleEvent.isHTML()).outerHTML}
        ${generateOneClickDOM("sig_moodleCalendar", "calendarIconMoodle smallicon", "outlook", outlook_url, MoodleEvent.isHTML()).outerHTML}
        ${div.find("a")[0].outerHTML}`;
    }

    static getEvent(eventTd) {
        let anchor = eventTd.find("a");
        let d = new Date(1000 * parseFloat(anchor[0].href.match(/time=(\d+)/)[1]));
        return {
            name: anchor.text(),
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
asyncGetMoodle()
    .then((moodle) => {
        // define the static methods getName and getDescription
        MoodleEvent.getName = function(event, forUrl) {
            if (forUrl) event = this.convertToURI(event);

            //In case some of the attributes are undefined, replace it with 'n/a'
            return parseStrFormat(event, moodle.title, moodle.isHTML);
        }

        MoodleEvent.getDescription = function(event, forUrl) {
            if (forUrl) event = this.convertToURI(event);

            //In case some of the attributes are undefined, replace it with 'n/a'
            return parseStrFormat(event, moodle.desc, moodle.isHTML);
        }

        MoodleEvent.isHTML = function() {
            return moodle.isHTML;
        }

        let extractorMoodleEvent = new MoodleEvent();
    })