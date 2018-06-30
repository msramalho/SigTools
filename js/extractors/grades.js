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

        // create div for attaching modules
        this.originalTable.before(`<div class="gradeChartDiv" style="min-width: ${this.chart_min_width};"><h2 class="noBorder" style="margin-top:0;">SigToCa Grade Analysis</h2></div>`)
        // attach modules (order of invocation matters)
        this.attachCharts()
        this.attachMetrics()

        // inject dynamic tables
        this.originalTable.prev().after($(`<h2 class="noBorder">SigToCa Dynamic Tables</h2>`))
        this.originalTable.prepend($(`<thead>${this.originalTable.find("tr").html()}</thead>`))
        this.originalTable.find("tbody tr:has(> th)").remove()
        // sorting guide: https://www.datatables.net/plug-ins/sorting/
        $("table.dadossz").dataTable({
            paging: false,
            order: [],
            dom: 'Bfrtip',
            buttons: ['copy', 'csv', 'excel', 'print'],
        });
    }

    /**
     * inject the histogram of the grades
     */
    attachCharts() {
        // append the canvas
        $("div.gradeChartDiv").append(`<canvas id="gradesChart"></canvas>`)

        // generate the chart
        new Chart($("#gradesChart").get(), {
            type: 'bar',
            data: {
                labels: this.getLabels(),
                datasets: [{
                    label: "Grades",
                    data: this.getAccumulatedGrades(),
                    backgroundColor: this.chart_color
                }]
            }
        })
    }

    /**
     * inject metrics and textual information
     */
    attachMetrics() {
        let g = this.getNumericGrades();
        let m = math

        let name = $(".nomelogin").html()
        let mine = this.grades.find(i => i.name == name).grade
        mine = $.isNumeric(mine) ? parseInt(mine) : 0

        let passed = g.filter(x => x >= 10).length
        let failed = this.getGrades().length - passed

        let max = m.max(g),
            min = m.min(g)
        let best = this.grades.filter(i => i.grade == max).sort((a, b) => a - b)
        let fail = this.grades.filter(i => !$.isNumeric(i.grade) || parseInt(i.grade) < 10).map(s => {
            s.name = `${s.name} (${s.grade})`;
            return s;
        })

        let metricsHtml = `
        <div class="gradeMetrics">
            <h4>Personal Analysis</h4>
            <table>
                <tr><td>My grade: </td><td>${mine}</td></tr>
                <tr><td>Position: </td><td>${g.sort((a, b) => b - a).indexOf(mine)+1}º</td></tr>
                <tr><td>Same as me: </td><td>${this.getGrades().filter(i => i == mine).length}</td></tr>
            </table>
            <hr/>
            <h4>Overall Statistics</h4>
            <table>
                <tr><td>Average: </td><td>${m.round(m.mean(g), 2)}</td> <td>Std: </td><td>${m.round(m.std(g),2)}</td></tr>
                <tr><td>Min: </td><td>${m.min(g)}</td> <td>Max: </td><td>${m.max(g)}</td></tr>
                <tr><td>Median: </td><td>${m.median(g)}</td> <td>Mode: </td><td>${m.mode(g)}</td></tr>
                <tr><td>Passed: </td><td>${passed}</td> <td>in percent: </td><td>${m.round(100*passed/(failed+passed), 2)}%</td></tr>
                <tr><td>Failed: </td><td>${failed}</td> <td>in percent: </td><td>${m.round(100*failed/(failed+passed), 2)}%</td></tr>
            </table>
            <hr/>
            <h4>Group Analysis</h4>
            <strong>Best students - with ${max}</strong>
            <p>${this._getHtmlStudentList(best)}</p>
            <strong>Failed students</strong>
            <p>${this._getHtmlStudentList(fail)}</p>
        </div>
        `
        $("div.gradeChartDiv").append(metricsHtml)
    }

    /**
     * Uses Mustache to generate an unordered list of students with links
     * @param {array of {id,grade,name,course}} students
     */
    _getHtmlStudentList(students) {
        return Mustache.render(`
        {{#list.length}}
            <ul>
                {{#list}}
                    <li><a href="fest_geral.cursos_list?pv_num_unico={{id}}">{{name}}</a></li>
                {{/list}}
            </ul>
        {{/list.length}}`, {
            list: students
        })
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
                id: $(tr).find("td.l").html(),
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
        let grades = this.getGrades()
        let res = []
        this.getLabels().forEach(l => {
            res.push([...grades].filter(g => g == l).length)
        });
        return res;
    }

    /**
     * returns an array that contains only numeric-valued grades
     */
    getNumericGrades() {
        let res = []
        this.getGrades().forEach(l => {
            if ($.isNumeric(l)) res.push(parseInt(l))
        });
        return res;
    }

    /**
     * Returns an array with the labels RFC, RFE, ... that are present in the chart (to avoid empty columns)
     * along with the numeric values from 10 to 20
     */
    getLabels() {
        let mandatory = new Set(Array.apply(null, {
            length: 21
        }).map(Number.call, Number))
        let extra = new Set(["RFF", "RFC", "RFE", "RFR", "RA", "RD", "REC"])
        let present = new Set(this.getGrades())
        let intersect = new Set([...extra].filter(x => present.has(x))) // intersect extra with present
        return Array.from(new Set([...intersect, ...mandatory])) // join intersection with mandatory
    }
}

// add an instance to the EXTRACTORS variable, and also trigger attachIfPossible due to constructor
EXTRACTORS.push(new Grades());