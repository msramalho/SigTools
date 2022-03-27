
/**
 * @deprecated
 * @see {createDropdownItem}
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
        generateAnchorWithIcon(a, img, "Google Calendar", "icons/gcalendar.png");
    } else if (service == "outlook") {
        generateAnchorWithIcon(a, img, "Outlook Calendar", "icons/outlook.png");
    } else if (service == "office365") {
        generateAnchorWithIcon(a, img, "Office365 Calendar", "icons/office365.png");
    } else if (service == "yahoo") {
        generateAnchorWithIcon(a, img, "Yahoo Calendar", "icons/yahoo.png");
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
 * @deprecated
 */
function generateAnchorWithIcon(a, img, title, src){
    a.setAttribute("title",`Add this single event to your ${title} in one click!`);
    img.setAttribute("alt", `${title} icon`);
    img.setAttribute("src", chrome.extension.getURL(src));
}

/**
 * @deprecated
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
 * @deprecated
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
 * @deprecated
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

/**
 * Creates the dropdown for adding singular events to a calendar platform.
 * Supported platforms are:
 * - Microsoft (Outlook and Office 365)
 * - Google
 * - Yahoo
 * 
 * The dropdown includes an option to download the ICS for the event. Clicking
 * on a platform opens an URL in a new tab for composing a new event in the
 * selected platform. The URL is generated with query parameters to pre-fill
 * most of the fields with extracted information from Sigarra.
 * 
 * The generated DOM includes:
 * - button to open the dropdown
 * - the dropdown menu itself (hidden/closed by default)
 * - open links in a new tab when dropdown items are clicked (e.g. Google
 * Calendar)
 * - behaviour to show/hide the dropdown items, as well as any other dropdowns
 * so that only one dropdown is open at a time
 * - automatically close all dropdowns when clicking outside the dropdown in
 * the page
 * 
 * @param {CalEvent} event 
 * @param {Object?} style 
 * @param {String?} style.divClass Class for the dropdown's container div
 * @param {String?} style.divStyle Inline styles for the dropdown's container
 * div
 * @param {String?} style.aClass Class for the 'add event' button that opens
 * the dropdown
 * @param {String?} style.dropdownClass Class for the dropdown menu
 * @param {String?} style.dropdownStyle Inline styles for the dropdown menu
 * @returns {HTMLElement} The dropdown container 
 */
function createEventDropdown(event, style) {
    // prepare the styling for the dropdown
    style = style || {};
    style.divClass = style.divClass || "dropdown right";
    style.divStyle = style.divStyle || "position:initial;";
    style.aClass = style.aClass || "calendarBtn dropBtn";
    style.dropdownClass = style.dropdownClass || "dropdown-content";
    style.dropdownStyle = style.dropdownStyle || "";

    // create the dropdown element (button + menu)
    const $dropdown = createElementFromString(`
	<div class="sigDropdown ${style.divClass}" style="${style.divStyle}">
		<a class="sigDropdown__btn ${style.aClass}" title="Save this event to your Calendar">
            <img src="${chrome.extension.getURL("icons/calendar.svg")}"/>
        </a>
        <div class="sigDropdown__menu ${style.dropdownClass}" style="${style.dropdownStyle}">
            <a class="donwloadSingleIcs"
                style="background-color:#e3e3e3"
                title="For other calendars, download the single .ics file"
                href="#">
                <img class="dropdownIcon" alt="apple calendar icon" src="${chrome.extension.getURL(
                    "icons/calendar.png"
                )}">
                Others (.ics)
            </a>
        </div>
    </div>`);

    // add click action for the ICS download button
    $dropdown.querySelector(".donwloadSingleIcs").addEventListener("click", (e) => {
        const cal = ics("sigtools"); //creat ics instance
        cal.addEvent(event.title, event.description, event.location, event.start, event.end, event.recurRule);
        cal.download();
    });

    // on clicking the open dropdown menu, close all other dropdowns, and then show this drop menu
    $dropdown.querySelector(".sigDropdown__btn").addEventListener("click", (e) => {
        for (const $el of document.querySelectorAll(".sigDropdown__menu")) $el.classList.remove("show");
        $dropdown.querySelector(".sigDropdown__menu").classList.toggle("show");
    });

    // Add the menu items for the remainder calendars
    const googleUrlFn = () => new CalendarUrlGenerator(event).google();
    const outlookUrlFn = () => new CalendarUrlGenerator(event).outlook();
    const officeUrlFn = () => new CalendarUrlGenerator(event).office365();
    const yahooUrlFn = () => new CalendarUrlGenerator(event).yahoo();

    const $dropdownMenu = $dropdown.querySelector(".sigDropdown__menu");

    $dropdownMenu.insertAdjacentElement(
        "afterbegin",
        createDropdownItem("yahoo", yahooUrlFn, event.isHTML, "", "dropdownIcon")
    );
    $dropdownMenu.insertAdjacentElement(
        "afterbegin",
        createDropdownItem("office365", officeUrlFn, event.isHTML, "", "dropdownIcon")
    );
    $dropdownMenu.insertAdjacentElement(
        "afterbegin",
        createDropdownItem("outlook", outlookUrlFn, event.isHTML, "", "dropdownIcon")
    );
    $dropdownMenu.insertAdjacentElement(
        "afterbegin",
        createDropdownItem("google", googleUrlFn, event.isHTML, "", "dropdownIcon")
    );

    return $dropdown;
}

/**
 * Returns a dropdown item for a calendar platform. On click, opens a new tab
 * with the URL for adding an event in the selected platform
 *
 * @param {"google"|"outlook"|"office365"|"yahoo"} service
 * @param {Function|String} url The URL to be opened. Can be a function for
 * dynamically generated URLs
 * @param {boolean} isHTML Whether the URL may contain inline html, requiring
 * different encoding approaches
 * @param {string} class_atr_a The class for <a> element
 * @param {string} class_atr_img The class for <img> child element
 */
function createDropdownItem(service, url, isHTML, class_atr_a, class_atr_img) {

    // description and icon path for different services
    let desc, iconPath;
    if (service == "google") {
        desc = "Google";
        iconPath = "icons/gcalendar.png";
    } else if (service == "outlook") {
        desc = "Outlook";
        iconPath = "icons/outlook.png";
    } else if (service == "office365") {
        desc = "Office365";
        iconPath = "icons/office365.png";
    } else if (service == "yahoo") {
        desc = "Yahoo";
        iconPath = "icons/yahoo.png";
    }

    // create the dropdown item element
    const $dropdownItem = createElementFromString(`
        <a href="#"
            title="Add this single event to your ${desc} calendar in one click!"
            class="${class_atr_a}">
            <img class="${class_atr_img}"
                alt="${desc} calendar icon"
                src="${chrome.extension.getURL(iconPath)}">
            ${desc}
        </a>
    `);

    $dropdownItem.addEventListener("click", (e) => {
        let _url = typeof url === 'function' ? url() : url;
        if (isHTML)
            window.open(decodeURI(encodeURI(_url.replace(/'/g, "\""))).replace(/\\s/g, "%20"));
        else
            window.open(_url.replace(/\n/g, '%0A'));
    })

    return $dropdownItem;
}

window.addEventListener("click", (ev) => {
    // if there is a click outside the dropdown, close all dropdowns
    const $targetDrop = ev.target.closest('.sigDropdown');
    if ($targetDrop === null) {
        for (const $el of document.querySelectorAll('.sigDropdown__menu'))
            $el.classList.remove("show");
    }
});
