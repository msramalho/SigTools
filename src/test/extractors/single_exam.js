describe("SingleExam extractor", function () {
    describe("Normal view", function () {
        let ev = null;

        before(function () {
            return updatejQueryContext("single_exam/normal.html").then(() => {
                const singleExam = new SingleExam();
                ev = singleExam.getEvent();
            });
        });

        it("Should parse dates correctly", () => {
            chai.assert.deepEqual(ev.from, new Date("2022-05-11 17:30"), "Start datetime");
            chai.assert.deepEqual(ev.to, new Date("2022-05-11 19:30"), "End datetime");
        });

        it("Should parse subject correctly", () => {
            chai.assert.equal(ev.subject.name, "Sistemas Operativos", "Course name");
            chai.assert.equal(ev.subject.acronym, "SO", "Course acronym");
            chai.assert.match(ev.subject.url, /ucurr_geral.ficha_uc_view\?pv_ocorrencia_id=484378$/, "Course URL");
        });

        it("Should parse type of exam correctly", () => {
            chai.assert.equal(ev.info, "Mini-testes (2ºS)");
        });

        it("Should parse rooms correctly", () => {
            chai.assert.isArray(ev.rooms);
            chai.assert.lengthOf(ev.rooms, 10);
            chai.assert.equal(ev.rooms[0].name, "B104");
            chai.assert.match(ev.rooms[0].url, /instal_geral.espaco_view\?pv_id=73471$/);
            chai.assert.equal(ev.rooms[5].name, "B102");
            chai.assert.match(ev.rooms[5].url, /instal_geral.espaco_view\?pv_id=73445$/);
            chai.assert.equal(ev.rooms[9].name, "B304");
            chai.assert.equal(ev.roomNames, "B104, B208, B213, B105, B103, B102, B308, B307, B305, B304");
        });

        it("Should parse teachers/supervisors correctly", () => {
            chai.assert.isArray(ev.teachers);
            chai.assert.lengthOf(ev.teachers, 11);
            chai.assert.equal(ev.teachers[0].name, "Rui Carlos Camacho de Sousa Ferreira da Silva");
            chai.assert.equal(ev.teachers[3].name, "Luís Filipe Pinto de Almeida Teixeira");
        });
    })

    describe("View with optional parameter 'Observations'", function () {
        let ev = null;
        before(function () {
            return updatejQueryContext("single_exam/observations.html").then(() => {
                const singleExam = new SingleExam();
                ev = singleExam.getEvent();
            });
        });

        it("Should parse correctly", function () {
            chai.assert.equal(ev.subject.name, "Laboratório de Bases de Dados e Aplicações Web", "Course name");
            chai.assert.equal(ev.subject.acronym, "LBAW", "Course acronym");
            chai.assert.equal(ev.info, "Port.Est.Especiais 1ºS");
            chai.assert.deepEqual(ev.from, new Date("2022-05-16 14:30"), "Start datetime");
            chai.assert.deepEqual(ev.to, new Date("2022-05-16 17:30"), "End datetime");
            chai.assert.isArray(ev.rooms);
            chai.assert.lengthOf(ev.rooms, 1);
            chai.assert.isArray(ev.teachers);
            chai.assert.lengthOf(ev.teachers, 4);
        });
    })

    describe("View with missing parameter 'Vigilantes'", function () {
        let ev = null;
        before(function () {
            return updatejQueryContext("single_exam/no_supervisors.html").then(() => {
                const singleExam = new SingleExam();
                ev = singleExam.getEvent();
            });
        });

        it("Should parse correctly", function () {
            chai.assert.equal(ev.subject.name, "Desenho de Construção Mecânica", "Course name");
            chai.assert.equal(ev.subject.acronym, "DCM", "Course acronym");
            chai.assert.equal(ev.info, "Mini-testes (2ºS)");
            chai.assert.deepEqual(ev.from, new Date("2022-05-16 14:30"), "Start datetime");
            chai.assert.deepEqual(ev.to, new Date("2022-05-16 16:30"), "End datetime");
            chai.assert.isArray(ev.rooms);
            chai.assert.lengthOf(ev.rooms, 4);
            chai.assert.isArray(ev.teachers);
            chai.assert.lengthOf(ev.teachers, 0);
        });
    })
})