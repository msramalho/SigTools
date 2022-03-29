"use strict";

/**
 * @deprecated
 * @see createEventsModal
 * 
 * display list of events to present to the user and the download interface
 * @param {Extractor} extractor a Extractor descendant that handled the events
 * @param {Date} from for recurring events when do they start [optional]
 * @param {Date} to for recurring events when do they end [optional]
 * @param {Array} events list of objects that need to have (at least) {from, to, location, download}
 */
function handleEvents(extractor, events, from, to) {
    if (from === undefined || to === undefined)
        createModal(extractor, events, getRepeat(from, to));
    else
        createModal(extractor, events, getRepeat(from, to), from.addDays(1), to.addDays(1));
}

/**
 * @deprecated
 * @see createEventsModal
 */
function createModal(extractor, events, repeat, from, to) {
    let eventsHtml = "";
    for (let i = 0; i < events.length; i++) {
        // var google_url = eventToGCalendar(extractor, events[i], repeat);
        // var outlook_url = eventToOutlookCalendar(extractor, events[i], repeat);
        eventsHtml += `
        <li>
            <input type="checkbox" id="event_${i}" ${events[i].download?"checked":""}>
            <label for="event_${i}" title="${events[i].from.toLocaleDateString("en-uk")} to ${events[i].to.toLocaleDateString("en-uk")}">${extractor.getName(events[i])}</label>
            ${getDropdown(events[i], extractor, repeat, {target: "dropdown_"+i, divClass:"dropdown right removeFrame"})[0].outerHTML}
        </li>`;
    }

    let modal =
        `<div id="sig_eventsModal">
            <div class="sig_modalBody">
                <h1>SigTools</h1>
                <h2>Select the events you want to download:</h2>
                <ul class="sig_eventsList">
                    ${eventsHtml}
                    <br>
                </ul>
                ${
                    (from === undefined || to === undefined) ? '':
                    `<h3>If you want to change the start and end periods (only for the .ics file)</h3>
                    From <input type="date" id="repeat_from" value="${from.toISOString().split('T')[0]}">
                    to <input type="date" id="repeat_to" value="${to.toISOString().split('T')[0]}">`
                }
                <hr>
                <div>
                    <a id="sig_downloadIcs" class="calendarBtn"
                        title="Save this to your Calendar"><img src="${chrome.extension.getURL("icons/calendar.svg")}"/> Download .ics</a>
                </div>
            </div>
            <div class="sig_overlay"></div>
        </div>`;
    modal = $(modal);
    $("head").before(modal);
    setDropdownListeners(extractor, repeat);
    modal.find("#sig_downloadIcs").click((e) => {
        repeat = getRepeat(new Date($("#repeat_from").val()), new Date($("#repeat_to").val())) // if user updates from and to dates in modal, the repetition changes
        updateEvents(modal, events)

        //decide whether to add as single or recurring events (based on the start and end dates supplied)
        let cal = ics("sigtools"); //creat ics instance
        events.forEach(event => { //iterate events
            if (event.download) //if this event was selected by user -> add it
                cal.addEvent(extractor.getName(event), extractor.getDescription(event), event.location, event.from.toString(), event.to.toString(), repeat);
        }, extractor);

        //donwloads .ics file
        if (!cal.download())
            swal("No event selected for download!", "You need to select at least one event", "warning", {
                buttons: false
            })
        else
            clearModal();
    });
    modal.find(".sig_overlay").click(() => {
        updateEvents(modal, events);
        clearModal();
    });

}

/**
 * @deprecated
 * @see CalendarEvent.recurRule
 */
function getRepeat(from, to) {
    let repeat = undefined
    if (from && to && dayDiff(from, to) > 6) {
        repeat = {
            freq: "WEEKLY",
            until: to
        };
    }
    return repeat;
}

/**
 * @deprecated
 */
function clearModal() {
    $("#sig_eventsModal").remove();
}

/**
 * @deprecated
 */
function updateEvents(modal, events) {
    modal.find(".sig_eventsList li").each((index, li) => {
        events[index].download = $(li).find('input[type="checkbox"]').is(":checked")
    });
}

/**
 * Creates and opens a Modal for selecting multiple events to download as ICS
 * file. The list of events have inline options to add a particular event to
 * online calendars, such as Google, Microsoft Outlook/Office 365 and Yahoo.
 * 
 * If the events are recurrent, the user may customise the recurrency period.
 * See the parameters {@link from} and {@link to} to define an initial
 * recurrence period.
 * 
 * @param {CalendarEvent[]} events A list of events available for download
 * @param {Date?} from The starting date of the recurrence period 
 * @param {Date?} to The ending date of the recurrence period
 */
function createEventsModal(events, from, to) {
    // If pre-defined recurrence period is set, mark all events as recurrent
    if (from && to) {
        for (const event of events) {
            event.setRecur(from, to);
        }
    }

    // Create the Modal's HTML element
    const $modal = createElementFromString(
        `<div id="sig_eventsModal">
            <div class="sig_modalBody">
                <h1>SigTools</h1>
                <h2>Select the events you want to download:</h2>
                <ul class="sig_eventsList"></ul>
                ${
                    from === undefined || to === undefined
                        ? ""
                        : `<h3>You can change the start and end periods:</h3>
                    From <input type="date" id="repeat_from" value="${from.toISOString().split("T")[0]}">
                    to <input type="date" id="repeat_to" value="${to.toISOString().split("T")[0]}">`
                }
                <hr>
                <div>
                    <a id="sig_downloadIcs" class="calendarBtn"
                        title="Save this to your Calendar"><img src="${chrome.extension.getURL(
                            "icons/calendar.svg"
                        )}"/> Download .ics</a>
                </div>
            </div>
            <div class="sig_overlay"></div>
        </div>`);

    // Generate the list of events to display in the modal
    const $eventsList = [];
    for (let i = 0; i < events.length; i++) {
        const event = events[i];
        
        // Create the <li> for the event
        const start = event.start.toLocaleDateString("en-uk");
        const end = event.end.toLocaleDateString("en-uk");
        const $item = createElementFromString(`
        <li>
            <input type="checkbox" id="event_${i}">
            <label for="event_${i}" title="${start} to ${end}">${event.title}</label>
        </li>`);
        
        // Attach event listener for changes in checkboxes,
        // toggling the download flag for the respective event
        $item.querySelector("input").addEventListener("change", (e) => {
            event.download = e.target.checked; // if checked, mark event for download
        });

        // Attach the inline dropdown to add this single event to online calendars
        $item.append(createEventDropdown(event, {divClass:"dropdown right removeFrame"}));

        // Add the element to the list
        $eventsList.push($item);
    }

    // Add the list of events to the modal in DOM tree
    $modal.querySelector(".sig_eventsList").append(...$eventsList);

    // Add click action for the 'download ICS' button
    $modal.querySelector("#sig_downloadIcs").addEventListener("click", (e) => {
        // Create ics instance
        const cal = ics("sigtools");

        for (const event of events) {
            // If event not selected for download, skip
            if (!event.download)
                continue;
            
            // Add event to ICS
            cal.addEvent(
                event.title,
                event.description,
                event.location || "",
                event.start.toString(),
                event.end.toString(),
                event.recurRule,
            );            
        }

        // Downloads the .ics file
        if (!cal.download())
            swal("No event selected for download!", "You need to select at least one event", "warning", {
                buttons: false,
            });
    });

    // Update recurrence period on all events on date changes
    if (from && to) {
        const updateRecurence = (e) => {
            const from = new Date($modal.querySelector("#repeat_from").value);
            const to = new Date($modal.querySelector("#repeat_to").value);

            for (const event of events) {
                event.setRecur(from, to);
            }
        }
        $modal.querySelector("#repeat_from").addEventListener("change", updateRecurence);
        $modal.querySelector("#repeat_to").addEventListener("change", updateRecurence);
    }

    // Add the modal to the DOM
    document.querySelector("head").insertAdjacentElement("beforebegin", $modal);

    // Add event listener for clicks outside the modal div to close it
    document.querySelector(".sig_overlay").addEventListener("click", (ev) => {
        $modal.remove();
        // drop the injected 'download' property
        for (const event of events)
            event.download = undefined;
    });
}