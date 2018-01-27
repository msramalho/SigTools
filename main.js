"use strict";

let ct = new ClassesTimetable();
ct.attachIfPossible();

/**
 * display list of events to present to the user and the download interface
 * @param {Extractor} extractor a BaseExtractor descendant that handled the events
 * @param {Date} from for recurring events when do they start [optional]
 * @param {Date} to for recurring events when do they end [optional]
 * @param {Array} events list of objects that need to have (at least) {from, to, location, download}
 */
function handleEvents(extractor, from, to, events) {
    let repeat = undefined;
    if (from && to && daydiff(from, to) > 6) {
        repeat = {
            freq: "WEEKLY",
            until: to.toString()
        };
    }
    createModal(extractor, events, repeat);
}

function createModal(extractor, events, repeat) {
    let eventsHtml = "";
    for (let i = 0; i < events.length; i++) {
        eventsHtml += `<li><input type="checkbox" id="event_${i}" style="transform: scale(1.3);" ${events[i].download?"checked":""}><label for="event_${i}">${extractor.getName(events[i])}</label></li>`;
    }

    let modal =
        `<div id="sig_eventsModal">
            <div style="position: fixed;width: 500px;height: auto;background-color: #fff;z-index: 1000;display: block;padding: 10px 20px 10px 20px;margin: auto;top: 4%;left: 0;right: 0;border-radius: 5px;box-shadow: 0px 10px 22px 4px rgba(0,0,0,0.56);font-family:monospace;max-height:80%;">
                <h1 style="text-align:center;">SigToCal</h1>
                <h2 style="text-align:center;">Select the events you want to download:</h2>
                <ul id="sig_eventsList" style="font-size: 18px;list-style: none;overflow-y: auto;max-height: 350px;">
                    ${eventsHtml}
                </ul>
                <hr>
                <div>
                    <a id="sig_downloadIcs" style="display: block;text-align: center;text-decoration: none;font-size: 23px;color: #ecf0f1;margin: 0;margin-bottom: 10px;padding: 10px 20px;border-radius: 2px;box-shadow: 0 1px 4px rgba(0, 0, 0, .6);background-color: #2196F3;transition: background-color .5s;cursor: pointer;"
                        title="Save this To your Calendar">📆 Download .ics</a>
                </div>
            </div>
            <div id="sig_overlay" style="z-index:900;width:100%;height:100%;position:fixed;top:0;bottom:0;background-color:#e3e3e396;"></div>
        </div>`;
    modal = $(modal);
    $("head").before(modal);
    modal.find("#sig_downloadIcs").click((e) => {
        updateEvents(modal, events);
        console.log(events);

        //decide wether to add as single or recurring events (based on the start and end dates supplied)
        let cal = ics(); //creat ics instance
        events.forEach(event => { //iterate events
            if (event.download) //if this event was selected by user -> add it
                cal.addEvent(extractor.getName(event), extractor.getDescription(event), event.location, event.from.toString(), event.to.toString(), repeat);
        }, extractor);

        //donwloas .ics file
        if (!cal.download())
            alert("No event selected for download!");
        else
            clearModal();
    });
    modal.find("#sig_overlay").click(() => {
        updateEvents(modal, events);
        clearModal();
    });

}

function clearModal() {
    $("#sig_eventsModal").remove();
}

function updateEvents(modal, events) {
    modal.find("#sig_eventsList li").each((index, li) => {
        events[index].download = $(li).find('input[type="checkbox"]').is(":checked")
    });
}