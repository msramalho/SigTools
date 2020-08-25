"use strict";

class Moodle extends Extractor {

    constructor() {
        super();
        this.waitForEvents().then(() => {
            this.ready()
        }).catch(() => {
            console.warn("No event detected in asynchronous page");
        })
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

    /**
     * Polls the page for .hasevent for a max of 10s
     */
    waitForEvents() {
        return new Promise((resolve, reject) => {
            let counter = 0;
            let interval = setInterval(() => {
                if ($(".hasevent").length) {
                    clearInterval(interval)
                    resolve()
                }
                if (counter++ == 40) { // 40 * 250 = 10000
                    clearInterval(interval)
                    reject()
                }
            }, 250);
        })
    }

    attachIfPossible() {
        // create and place button
        this.saveBtn = $(`<a title="Save Moodle events to your Calendar" href="#"><img src="${chrome.extension.getURL("icons/calendar.svg")}"/></a>`)
        let header = $(".block_calendar_month > div.header > div.title > div.block_action,.block.block_fake > div.header > div.title > div.block_action").last()
        header.append(this.saveBtn)
        // load initial events
        this.refreshEvents()
        this.saveBtn.click(() => {
            this.refreshEvents()
            handleEvents(this, this.events)
        })
    }

    refreshEvents() {
        $(".hasevent").each((_, td) => {
            let popupContent = $(`<div>${$(td).attr("data-core_calendar-popupcontent")}</div>`);
            let newPopupContent = "";
            popupContent.find("div").each((_, div) => {
                div = $(div);
                newPopupContent += this.getNewDiv(div, Moodle.getEvent(div));
            });
            $(td).attr("data-core_calendar-popupcontent", newPopupContent);
        });
        this.events = []
        $(".hasevent").each((_, e) => {
            this.events = [...this.events, ...Moodle.getDayEvents($(e))]
        })
    }


    convertToURI(event) {
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

    static getDayEvents(eventTd) {
        let anchor = eventTd.find("a");
        let d = new Date(1000 * parseFloat(anchor[0].href.match(/time=(\d+)/)[1]));
        d = d.addDays(parseInt(anchor.text()) - 1)
        return eventTd.children(".hidden").find("div").map((_, e) => {
            e = $(e)
            return {
                name: e.text().trim(),
                type: e.find("img").attr("src").match(/uporto\/(\w+)\/\d+\/icon/)[1],
                url: anchor[0].href,
                from: d,
                to: d,
                location: "Moodle",
                download: true
            };
        })
    }
}

// add an instance to the EXTRACTORS variable, and also trigger attachIfPossible due to constructor
EXTRACTORS.push(new Moodle());