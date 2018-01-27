"use strict";


$.prototype.parsetable = function (dupCols, dupRows, textMode) {
    if (dupCols === undefined) dupCols = false;
    if (dupRows === undefined) dupRows = false;
    if (textMode === undefined) textMode = false;

    let columns = [],
        curr_x = 0,
        curr_y = 0;

    this.find("> tbody > tr").each(function (row_idx, row) { //only the first instance of the table
        curr_y = 0;
        $(" > td, > th", row).each(function (col_idx, col) {
            let rowspan = $(col).attr('rowspan') || 1;
            let colspan = $(col).attr('colspan') || 1;
            // let content = $(col).getClass();
            let content = $(col).html().replace(/&nbsp;/g, "") || "";

            if (textMode === true) content = $(col).text().trim() || "";

            let x = 0,
                y = 0;
            for (x = 0; x < rowspan; x++) {
                for (y = 0; y < colspan; y++) {
                    if (columns[curr_y + y] === undefined)
                        columns[curr_y + y] = []

                    while (columns[curr_y + y][curr_x + x] !== undefined) {
                        curr_y += 1
                        if (columns[curr_y + y] === undefined)
                            columns[curr_y + y] = []
                    }

                    if ((x === 0 || dupRows) && (y === 0 || dupCols))
                        columns[curr_y + y][curr_x + x] = content
                    else
                        columns[curr_y + y][curr_x + x] = ""
                }
            }
            curr_y += 1;
        });
        curr_x += 1;
    });

    return columns;
};


$.prototype.tableToEvents = function () {
    let events = [];
    for (let i = 1; i < this.length; i++) { //ignore the first column, with times
        let day = this[i];
        let counter = 1; //count the number of blocks this class takes
        for (let j = 2; j < day.length; j++) { //ignore the first row with day names, start at two to see previous
            if ((day[j] != day[j - 1] || j == day.length - 1) && day[j - 1].length > 0) { //if this event stops toDay and is not empty or if its the last event of the day and is not empty
                events.push(getClass(day[j - 1], this[i][0], this[0][j - counter], this[0][j - 1]));
                counter = 1;
            } else if (day[j] == day[j - 1]) {
                counter += 1;
            }
        }
    }
    return events;
};

function getClass(html, day, from, to) {
    if (html == "") return {};
    console.log(`${day} - ${from} - ${to}`);

    let cell = $("<div>" + html + "</div>");
    let classAnchor = cell.find("span.textopequenoc a");
    let roomTd = cell.find("table.formatar td:first-child()");
    let teacherTd = cell.find("table.formatar td.textod");
    return {
        name: cell.find("b acronym").attr("title") || "",
        acronym: cell.find("b a").html() || "",
        type: cell.find("b").text().match(/\((.+)\)/)[1] || "",
        from: from || 0,
        to: to || 0,
        class: {
            name: classAnchor.text(), url: classAnchor.attr("href") || ""
        },
        room: {
            name: roomTd.text() || "",
            url: roomTd.find("a").attr("href") || ""
        },
        teacher: {
            name: teacherTd.find("acronym").attr("title") || "",
            acronym: teacherTd.find("a").text() || "",
            url: teacherTd.find("a").attr("href") || ""
        }
    };
}

function textToDate(text) {
    return new Date(
        Number(text.substr(0, 4)),
        Number(text.substr(4, 2)) - 1,
        Number(text.substr(6, 2))
    );
}

function getEvents(selector = "table.horario") {
    let table = $(selector).parsetable(false, true);
    console.log(table);
    let lifetime = $(".bloco-select a").attr("href");
    return {
        from: textToDate(lifetime.match(/p_semana_inicio=(\d*)/)[1]),
        to: textToDate(lifetime.match(/p_semana_fim=(\d*)/)[1]),
        events: $(table).tableToEvents()
    };
}