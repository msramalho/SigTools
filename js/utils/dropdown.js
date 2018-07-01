/**
 * Return a Jquery element that has a dropdown and the dropdown buttons for a single event
 * @param {Event} event
 * @param {Context} context the "this" value before (must be an extractor with getName, get Description and isHTML)
 */
function getDropdown(event, context, target) {
	target = target || "calendarDropdown"
    let google_url = eventToGCalendar(context, event);
    let outlook_url = eventToOutlookCalendar(context, event);
	let yahoo_url = eventToYahooCalendar(context, event);
    return $(`
	<div class="dropdown right">
		<a class="calendarBtn dropBtn" target="${target}" title="Save this exam to your Calendar">📆</a>
		<div id="${target}" class="dropdown-content">
		${generateOneClickDOM("", "dropdownIcon", "google", google_url, context.isHTML, "Google").outerHTML}
		${generateOneClickDOM("", "dropdownIcon", "outlook", outlook_url, context.isHTML, "Outlook").outerHTML}
		${generateOneClickDOM("", "dropdownIcon", "yahoo", yahoo_url, context.isHTML, "Yahoo").outerHTML}
		</div>
	</div>`);
}

/**
 * unbind and rebind the listeners for the dropdown buttons
 */
function setDropdownListeners() {
    $(".dropBtn").unbind();
    $(".dropBtn").click(toggleDropdown);
}

/**
 * Toggle dropdown buttons
 */
function toggleDropdown(btn) {
    document.getElementById($(btn.target).attr("target")).classList.toggle("show");
}

// Close the dropdown if the user clicks outside
window.onclick = function(event) {
    if (!event.target.matches('.dropBtn')) {
        let dropdowns = document.getElementsByClassName("dropdown-content");
        for (let i = 0; i < dropdowns.length; i++) {
            let openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}