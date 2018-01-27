"use strict";


let table = $("table.horario");
if (table) {
    let saveBtn = $('<a id="calendarBtn" title="Save this To your Calendar">📆</a>');
    $("table.horario-semanas").before(saveBtn);
    saveBtn.click(function (e) {

        let events = getEvents();
        console.log(events);
        chrome.runtime.sendMessage({
            greeting: "hello"
        }, function (response) {
            console.log(response.gapi);
        });

        // let calendar = new CalendarApi("335072133429-88od6pvvcnk67jjpnthqik7fk0au3hnm.apps.googleusercontent.com", "AIzaSyA2B83Ome4_S-EXUe5zLTrkaGeZv-Ndft4");
    });
}


//list of checkboxes with the events found, wehter to add them or not, to what scehdule, between date A and B, according to selected!!, but editable
//Export as .icm, if possible, ...
//find bet way to parse table, according to rowspan
//funcionar para https://sigarra.up.pt/feup/pt/exa_geral.mapa_de_exames?p_curso_id=742