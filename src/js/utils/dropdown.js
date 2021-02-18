
/**
 * Returns an element object <a> for OneClick feature with a <img> child
 * @param {string} class_atr_a The class for <a> element
 * @param {string} class_atr_img The class for <img> child element
 * @param {string} service 'google' || 'outlook'. This is used to set the correct title and icon automatically
 * @param {string} url
 * @param {boolean} html URL's with inline html or with plain text require different encodings
 */
function getAddToCalendarDOM(class_atr_a, class_atr_img, service, url, html, title) {
    var a = document.createElement("a");
    var img = document.createElement("img");

    // set class
    a.className = class_atr_a;
    img.className = class_atr_img;

    // set title and append an <img>
    if (service == "google") {
        a.setAttribute("title", "Add this single event to your Google Calendar in one click!");
        img.setAttribute("alt", "google calendar icon");
        img.setAttribute("src", `${chrome.extension.getURL("icons/gcalendar.png")}`);
    } else if (service == "outlook") {
        a.setAttribute("title", "Add this single event to your Outlook Calendar in one click!");
        img.setAttribute("alt", "outlook calendar icon");
        img.setAttribute("src", `${chrome.extension.getURL("icons/outlook.png")}`);
    } else if (service == "office365") {
        a.setAttribute("title", "Add this single event to your Office365 Calendar in one click!");
        img.setAttribute("alt", "office 365 icon");
        img.setAttribute("src", `${chrome.extension.getURL("icons/office365.png")}`);
    } else if (service == "yahoo") {
        a.setAttribute("title", "Add this single event to your Yahoo Calendar in one click!");
        img.setAttribute("alt", "yahoo calendar icon");
        img.setAttribute("src", `${chrome.extension.getURL("icons/yahoo.png")}`);
    }
    a.appendChild(img);

    // add href attribute to automatically set the pointer/cursor
    a.setAttribute("href", "#");
    if (title != undefined) a.innerHTML += title

    // add event listener
    if (html)
        a.setAttribute("onclick", `window.open(decodeURI('${encodeURI(url.replace(/'/g, "\""))}').replace(/\\s/g, "%20"));`);
    else
        a.setAttribute("onclick", `window.open('${url.replace(/\n/g, '%0A')}');`);

    return a;
}

/**
 * Return a Jquery element that has a dropdown and the dropdown buttons for a single event
 * @param {Event} event
 * @param {Context} context the "this" value before (must be an extractor with getName, get Description and isHTML)
 * @param {Object} style an object containg style configurations to be used when creating the dropdown
 */
function getDropdown(event, context, repeat, style) {
    const google_url = eventToGCalendar(context, event, repeat);
    const outlook_url = eventToOutlookCalendar(context, event, repeat);
    const office365_url = eventToOffice365Calendar(context, event, repeat);
    const yahoo_url = eventToYahooCalendar(context, event, repeat);

    style = style || {}
    style.target = style.target || "calendarDropdown"
    style.divClass = style.divClass || "dropdown right "
    style.divStyle = style.divStyle || "position:initial;"
    style.aClass = style.aClass || "calendarBtn dropBtn"
    style.dropdownClass = style.dropdownClass || "dropdown-content"
    style.dropdownStyle = style.dropdownStyle || ""

    return $(`
	<div class="${style.divClass}" style="${style.divStyle}">
		<a class="${style.aClass}" target="${style.target}" title="Save this event to your Calendar"><img target="${style.target}" src="${chrome.extension.getURL("icons/calendar.svg")}"/></a>
        <div id="${style.target}" class="${style.dropdownClass}" style="${style.dropdownStyle}">
        ${getAddToCalendarDOM("", "dropdownIcon", "google", google_url, context.isHTML, "Google").outerHTML}
        ${getAddToCalendarDOM("", "dropdownIcon", "outlook", outlook_url, context.isHTML, "Outlook").outerHTML}
        ${getAddToCalendarDOM("", "dropdownIcon", "office365", office365_url, context.isHTML, "Office 365").outerHTML}
        ${getAddToCalendarDOM("", "dropdownIcon", "yahoo", yahoo_url, context.isHTML, "Yahoo").outerHTML}
		<a class="donwloadSingleIcs" data='${JSON.stringify(event)}' style="background-color:#e3e3e3" title="For other calendars, download the single .ics file" href="#"><img class="dropdownIcon" alt="apple calendar icon" src="${chrome.extension.getURL("icons/calendar.png")}">Others (.ics)</a>
		</div>
	</div>`);
}

/**
 * unbind and rebind the listeners for the dropdown buttons
 */
function setDropdownListeners(extractor, repeat) {
    $(".dropBtn > img").unbind().click(toggleDropdown)
    $(".donwloadSingleIcs").unbind().click((e) => {
        let event = JSON.parse($(e.target).attr("data"))
        let cal = ics("sigtools"); //creat ics instance
        cal.addEvent(extractor.getName(event), extractor.getDescription(event), event.location, event.from.toString() || Date(), event.to.toString() || Date(), repeat);
        if (!cal.download()) swal("No event selected for download!", "You need to select at least one event", "warning", {
            buttons: false
        });
    })
}

/**
 * Toggle dropdown buttons
 */
function toggleDropdown(btn) {
    $(`.dropdown-content:not(#${$(btn.target).attr("target")})`).each((_, dropdown) => {
        dropdown.classList.remove('show')
    })
    document.getElementById($(btn.target).attr("target")).classList.toggle("show");
}

// Close the dropdown if the user clicks outside
window.onclick = function (event) {
    if (!event.target.matches('.dropBtn > img')) {
        $(".dropdown-content").each((_, dropdown) => {
            dropdown.classList.remove('show')
        })
    }
}