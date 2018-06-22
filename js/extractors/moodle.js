"use strict";

class Moodle extends Extractor {

    constructor() {
        super();
        this.ready();
    }

    attachIfPossible() {
        $(".hasevent").each((index, td) => {
            let popupContent = $(`<div>${$(td).attr("data-core_calendar-popupcontent")}</div>`);
            let newPopupContent = "";
            popupContent.find("div").each((index, div) => {
                div = $(div);
                newPopupContent += this.getNewDiv(div, Moodle.getEvent(div));
            });
            $(td).attr("data-core_calendar-popupcontent", newPopupContent);
        });
    }

    structure() {
        return {
            extractor: "moodle",
            description: "Extracts moodle calendar events",
            parameters: [{
                    name: "name",
                    description: "eg: Minitest Compilers"
                },
                {
                    name: "type",
                    description: "eg: Submission"
                }, {
                    name: "url",
                    description: "link to the event page in moodle"
                }
            ],
            storage: {
                text: [{
                    name: "title",
                    default: "${name}"
                }],
                textarea: [{
                    name: "description",
                    default: "Type:${type}\nLink: <a href=\"${url}\">${name}</a>"
                }],
                boolean: [{
                    name: "isHTML",
                    default: true
                }]
            }
        }
    }

    convertToURI(original) {
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
    getNewDiv(div, event) {
        var google_url = eventToGCalendar(this, event);
        var outlook_url = eventToOutlookCalendar(this, event);

        // Browsers ignore newlines on the URLs, they are ommited. Therefore, I encode all newlines if formats are plain text
        return `
        ${div.find("img")[0].outerHTML}
        ${generateOneClickDOM("sig_moodleCalendar", "calendarIconMoodle smallicon", "google", google_url, Moodle.isHTML).outerHTML}
        ${generateOneClickDOM("sig_moodleCalendar", "calendarIconMoodle smallicon", "outlook", outlook_url, Moodle.isHTML).outerHTML}
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

// add an instance to the EXTRACTORS variable, and also trigger attachIfPossible due to constructor
EXTRACTORS.push(new Moodle());