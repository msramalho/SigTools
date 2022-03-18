"use strict";

class GradeSim extends Extractor {
    /** 
     * 
     * @type {{
     *      name:string,
     *      ects:number,
     *      year:string,
     *      semester:'1S'|'2S',
     *      grade:number?,
     *      simGrade:number?
     * }}
     */
    grades = {
        *[Symbol.iterator]() {
            for (const [id, obj] of Object.entries(this)) {
                yield {
                    id,
                    ...obj
                }
            }
        },
    };

    constructor() {
        super();

        // INITIAL OPERATIONS
        this.ready();

    }

    structure() {
        return {
            extractor: "the name of the extractor",
            description: "a simple description of what it does",
            parameters: [],
            storage: {}
        }
    }

    attachIfPossible() {
        this.parseGradesTable();
        this.uiInit();

        console.log(this.totalEcts());
        console.log(this.avgGrade());

    }

    totalEcts() {
        return Object.values(this.grades)
            .filter(({ simGrade }) => simGrade !== null) // skip unfinished courses
            .reduce((acc, { ects }) => acc + ects, 0.0);
    }

    avgGrade() {
        const weightedGrades = Object.values(this.grades)
            .filter(({ simGrade }) => simGrade !== null) // skip unfinished courses
            .reduce((acc, { ects, simGrade }) => acc + simGrade * ects, 0.0);

        const ects = this.totalEcts();

        return weightedGrades / ects;
    }

    /**
     * 
     */
    parseGradesTable() {
        const $t = document.querySelector('#tabelapercurso');
        const $tbody = $t.querySelector("tbody");
        // iterates over the table rows, skipping empty/seperator kind rows
        for (const $tr of $tbody.querySelectorAll('tr:not(tr.separador)')) {
            // collumns
            // 1 - year
            // 2 - semester, e.g. "1S"
            // 3 - code e.g EIC0016
            // 4 - name
            // 5 - minor ( not relevant )
            // 6 - number of credits
            try {
                // if fails in first columns, then likely is a row that does not
                // represent a course
                const year = $tr.querySelector('td:nth-child(1)').innerText;
                const semester = $tr.querySelector('td:nth-child(2)').innerText;
                const id = $tr.querySelector('td:nth-child(3)').innerText;
                const name = $tr.querySelector('.unidade-curricular').innerText;
                const ects = $tr.querySelector('td:nth-child(6)').innerText;

                // The number of subsequent columns varies, according to number of school years
                // if the course is completed (grade >= 10), there should be a cell
                // with class 'n aprovado' containing the grade
                // If it does not exist, then the course is not finished
                const tryGrade = $tr.querySelector('.n.aprovado');
                const grade = tryGrade ? tryGrade.innerText : null;

                this.grades[id] = {
                    name,
                    ects: Number.parseFloat(ects.replace(',', '.')),
                    year,
                    semester,
                    grade: grade && Number.parseInt(grade),
                    simGrade: grade && Number.parseInt(grade)
                }

            } catch (e) {
                continue;
            }
        }
    }

    /**
     * 
     */
    uiInit() {
        // prepare modal
        const $modal = this.uiCreateModal();
        $("head").before($modal);

        // prepare button to open modal
        document
            .querySelector('.caixa table:first-child')
            .insertAdjacentElement('afterend', this.uiCreateOpenModalBtn());
    }

    /**
     * Creates clickable button to launch the model where users can start
     * simulating their grades
     */
    uiCreateOpenModalBtn() {
        const $btn = document.createElement('button');
        $btn.innerHTML = `
            <img src="${browser.runtime.getURL('icons/slider-48.png')}">
        `;
        return $btn;
    }

    uiCreateModalTableRow(id, name, ects, grade) {
        const html = `
                <tr>
                    <td>${name}</td>
                    <td>${ects}</td>
                    <td>${grade}</td>
                    <td><input type="number" value="${grade}" min="10" max="20"/></td>
                </tr>
            `;
        // create table row DOM
        const $tmp = document.createElement('template');
        $tmp.innerHTML = html.trim();

        // attach event listeners to input
        const that = this;
        $tmp.content.querySelector('input').addEventListener('input', function (e) {
            const num = Number.parseInt(e.target.value);

            if (num < 10)
                num = 10;
            else if (num > 20)
                num = 20;

            e.target.value = num;
            that.grades[id].simGrade = num;
        });

        return $tmp.content.firstElementChild;
    }

    /**
     * 
     */
    uiCreateModal() {
        const modalHtml =
            `<div id="sig_eventsModal">
                <div class="sig_modalBody">
                    <h1>SigTools</h1>
                    <table>
                        <thead>
                            <th>Name (UC)</th>
                            <th>Credits</th>
                            <th>Grade</th>
                            <th>Simulate</th>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
                <div class="sig_overlay"></div>
            </div>`;

        const $tmp = document.createElement('template');
        $tmp.innerHTML = modalHtml.trim();
        const $modal = $tmp.content.firstElementChild;

        // add rows to the table, one per course (UC)
        const $ucTable = $modal.querySelector('tbody');
        for (const { id, name, ects, grade } of this.grades) {
            $ucTable.append(this.uiCreateModalTableRow(id, name, ects, grade));
        }

        return $modal;
    }
}

// add an instance to the EXTRACTORS variable, and also trigger attachIfPossible due to constructor
EXTRACTORS.push(new GradeSim());