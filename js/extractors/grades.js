"use strict";

class Grades extends Extractor {

    constructor() {
        super();
        this.table = $("table.dadossz").clone();

        this.ready();
    }

    structure() {
        return {
            extractor: "grades",
            description: "Produces a histogram and some statistics on the global grades page",
            parameters: [],
            storage: {
                boolean: [{
                    name: "apply",
                    default: true
                }]
            }
        }
    }


    attachIfPossible() {
        //iterate rows, ignoring the header
        this.grades = []
        this.table.find("tr:not(:first-child)").each((_, tr) => {
            this.grades.push($(tr).find("td.n").html())
        });
        console.log(this.grades);

        var myBarChart = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {}
        });
    }

    getGrades(){
var myBarChart = new Chart(ctx, {
    type: 'bar',
    data: data,
    options: options
});
    }

    getEvents(index) {

    }

    convertToURI(original) {

    }

}

// add an instance to the EXTRACTORS variable, and also trigger attachIfPossible due to constructor
EXTRACTORS.push(new Grades());