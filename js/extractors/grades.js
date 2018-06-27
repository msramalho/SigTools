"use strict";

class Grades extends Extractor {

    constructor() {
        super();
        this.originalTable = $("table.dadossz");
        this.table = this.originalTable.clone();
        this.ready();
    }

    structure() {
        return {
            extractor: "grades",
            description: "Produces a histogram and some statistics on the global grades page",
            parameters: [],
            storage: {
                text: [{
                        name: "chart_min_width",
                        default: "400px"
                    }
                ],
                boolean: [{
                    name: "apply",
                    default: true
                }]
            }
        }
    }


    attachIfPossible() {
        //return if table not found
        if (this.originalTable == undefined) return

        let s = this.originalTable.html() + "";
        this.originalTable.before(`<div class="gradeChartDiv" style="min-width: ${this.chart_min_width};"><canvas id="gradesChart"></canvas></div>`);
        console.log(this.originalTable);
        // this.originalTable.html( s);
        // console.log(this.originalTable.html())
        // let myBarChart = new Chart(ctx, {
        //     type: 'bar',
        //     data: this.getGrades(),
        //     options: {}
        // });
    }

    /**
     * Loads an object {id, name, course, grade} into this.grades
     * @returns an array with the grade values (non-numeric included)
     */
    getGrades() {
        //singleton implementation
        if (this.grades != undefined) return this.grades.map(o => o.grade)

        this.grades = []
        //iterate rows, ignoring the header
        this.table.find("tr:not(:first-child)").each((_, tr) => {
            this.grades.push({
                id: $(tr).find("td.n").html(),
                name: $(tr).find("td:nth-child(2)").html(),
                course: $(tr).find("td:nth-child(3)").html(),
                grade: $(tr).find("td.n").html()
            })
        });
        return this.grades.map(o => o.grade)

    }

    getEvents(index) {

    }

    convertToURI(original) {

    }

}

// add an instance to the EXTRACTORS variable, and also trigger attachIfPossible due to constructor
EXTRACTORS.push(new Grades());