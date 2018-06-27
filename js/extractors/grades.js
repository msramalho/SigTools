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

        // append the main div
        this.originalTable.before(`<div class="gradeChartDiv" style="min-width: ${this.chart_min_width};"><h2>SigToCa</h2></div>`)

        // attach modules (order of invocation matters)
        this.attachDownload()
        this.attachCharts()
        this.attachMetrics()
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
                    backgroundColor: "#009688"
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

        let passed = g.length
        let failed = this.getGrades().length - passed

        let max = m.max(g),
            min = m.min(g)
        let best = this.grades.filter(i => i.grade == max).sort((a, b) => a - b)
        let worst = this.grades.filter(i => i.grade == min).sort((a, b) => a - b)
        let fail = this.grades.filter(i => !$.isNumeric(i.grade)).sort((a, b) => a - b)

        let metricsHtml = `
        <div class="gradeMetrics">
            <h4>Personal Analysis</h4>
            <table>
                <tr><td>My grade: </td><td>${mine}</td></tr>
                <tr><td>Position: </td><td>${g.sort().reverse().indexOf(mine)+1}º</td></tr>
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
            <strong>Worst (passed) students - with ${min}</strong>
            <p>${this._getHtmlStudentList(worst)}</p>
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
     * inject html to download the data
     */
    attachDownload() {
        // read subject data
        let t = $("table.form")
        let subject = t.find("tr:nth-child(3) td:last-child").html()
        let year = t.find("tr:nth-child(6) td:last-child").html().substring(0, 4)
        let semester = t.find("tr:last-child td:last-child").html().substring(0, 1)

        // JSON download
        $("div.gradeChartDiv").append(`<a href="#" id="gradeDownloadJSON">Download JSON</a> `)
        $("#gradeDownloadJSON").click(() => {
            download(JSON.stringify(this.grades), subject + "_" + year + "_" + semester + ".json")
        })

        // csv download
        $("div.gradeChartDiv").append(`<a href="#" id="gradeDownloadCsv">Download CSV</a>`)
        $("#gradeDownloadCsv").click(() => {
            download(jsonToCsv(this.grades), subject + "_" + year + "_" + semester + ".csv")
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
        let mandatory = new Set(["10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"])
        let extra = new Set(["RFF", "RFC", "RFE", "RFR", "RA", "RD", "REC"])
        let present = new Set(this.getGrades())
        let intersect = new Set([...extra].filter(x => present.has(x))) // intersect extra with present
        return Array.from(new Set([...intersect, ...mandatory])) // join intersection with mandatory
    }
}

// add an instance to the EXTRACTORS variable, and also trigger attachIfPossible due to constructor
EXTRACTORS.push(new Grades());