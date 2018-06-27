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
                }],
                color: [{
                    name: "chart_color",
                    default: "#009688"
                }],
                boolean: [{
                    name: "apply",
                    default: true
                }]
            }
        }
    }


    attachIfPossible() {
        // return if table not found
        if (!this.originalTable.length) return

        // append the canvas
        this.originalTable.before(`<div class="gradeChartDiv" style="min-width: ${this.chart_min_width};"><canvas id="gradesChart"></canvas></div>`);

        // generate the chart
        new Chart($("#gradesChart").get(), {
            type: 'bar',
            data: {
                labels: this.getLabels(),
                datasets: [{
                    label: "Grades",
                    data: this.getAccumulatedGrades(),
                    backgroundColor: "#009688"
                }]
            },
            options: {}
        });
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
        this.table.find("tr:has(>td)").each((_, tr) => {
            this.grades.push({
                id: $(tr).find("td.n").html(),
                name: $(tr).find("td:nth-child(2)").html(),
                course: $(tr).find("td:nth-child(3)").html(),
                grade: $(tr).find("td.n").html()
            })
        });
        return this.grades.map(o => o.grade)
    }

    /**
     * Iterates the valid labels and counts the number of elements in the grades that match them
     * @returns an array, aligned with the labels, of the counting operation
     */
    getAccumulatedGrades() {
        let grades = this.getGrades(), res = []
        this.getLabels().forEach(l => {
            res.push([...grades].filter(g => g == l).length)
        });
        return res;
    }

    /**
     * Returns an array with the labels RFC, RFE, ... that are present in the chart (to avoid empty columns)
     * along with the numeric values from 10 to 20
     */
    getLabels() {
        let mandatory = new Set(["10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"])
        let extra = new Set(["RFF", "RFC", "RFE", "RFR", "RA", "RD", "REC"])
        let present = new Set(this.getGrades())
        let intersect = new Set([...extra].filter(x => present.has(x))) // intersect extra with present
        return Array.from(new Set([...intersect, ...mandatory])) // join intersection with mandatory
    }

    getEvents(index) {

    }

    convertToURI(original) {

    }

}

// add an instance to the EXTRACTORS variable, and also trigger attachIfPossible due to constructor
EXTRACTORS.push(new Grades());