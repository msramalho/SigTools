"use strict";


let table = $("table.horario");
if (table) {
    let saveBtn = $('<a id="calendarBtn">Save</a>');
    $("table.horario-semanas").before(saveBtn);
    saveBtn.click(function (e) {
        let events = getEvents();
        console.log(events);
    });
}

//list of checkboxes with the events found, wehter to add them or not, to what scehdule, between date A and B, according to selected!!, but editable
//Export as .icm, if possible, ...
//find bet way to parse table, according to rowspan