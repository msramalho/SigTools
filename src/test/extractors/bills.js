describe("Bill extractor", function () {
    describe("Normal page without ATM refs", function () {
        before(function () {
            return updatejQueryContext("bills/normal.html").then(() => {
                this.bills = new Bills();
            });
        });

        it("should find all bills", function (done) {
            /** @type {Bills} */
            const bills = this.bills;
            const all = bills.parsePendingBills();
            chai.assert.strictEqual(all.length, 5);
            done();
        });

        it("should handle bills without deadlines", function (done) {
            /** @type {Bills} */
            const bills = this.bills;
            const all = bills.parsePendingBills();
            chai.assert.strictEqual(all[4].deadline, null);
            done();
        });

        it("should calculate total amount (include fees)", function (done) {
            /** @type {Bills} */
            const bills = this.bills;
            const all = bills.parsePendingBills();
            // with fee
            chai.assert.include(all[0].amount, "34,95");
            // without fee
            chai.assert.include(all[1].amount, "34,85");
            done();
        });

        it("should parse correctly", function (done) {
            /** @type {Bills} */
            const bills = this.bills;
            const all = bills.parsePendingBills();

            chai.assert.equal(
                all[0].description,
                "Propinas - Mestrado em Engenharia Informática e Computação - Prestação 7 2021/2022"
            );
            chai.assert.equal(all[0].deadline, "2022-03-31");
            chai.assert.include(all[0].amount, "34,95");

            chai.assert.equal(
                all[1].description,
                "Propinas - Mestrado em Engenharia Informática e Computação - Prestação 8 2021/2022"
            );
            chai.assert.equal(all[1].deadline, "2022-04-30");
            chai.assert.include(all[1].amount, "34,85");

            chai.assert.equal(
                all[2].description,
                "Carta de Curso - Licenciatura - Mestrado Integrado em Engenharia Informática e Computação - Pedido de Certificado: Carta de Curso - Grau de Licenciado"
            );
            chai.assert.equal(all[2].deadline, "2019-01-08");
            chai.assert.include(all[2].amount, "120,00");

            chai.assert.equal(
                all[3].description,
                "Certidão de Aproveitamento Escolar - Mestrado Integrado em Engenharia Informática e Computação - Pedido de Certificado: Certidão de Aproveitamento Escolar"
            );
            chai.assert.equal(all[3].deadline, "2019-01-08");
            chai.assert.include(all[3].amount, "5,00");

            chai.assert.equal(
                all[4].description,
                "Propinas - Mestrado em Engenharia Informática e Computação - Prestação 0 2022/2023"
            );
            chai.assert.equal(all[4].deadline, null);
            chai.assert.include(all[4].amount, "34,85");
            done();
        });

        it("should create CalendarEvents only if deadline exists", function (done) {
            /** @type {Bills} */
            const bills = this.bills;
            const events = bills.getEvents();
            chai.assert.equal(events.length, 4);
            done();
        });

        it('should create CalendarEvents as "All Day" events', function (done) {
            /** @type {Bills} */
            const bills = this.bills;
            const events = bills.getEvents();
            for (const e of events) {
                chai.assert.isTrue(e._allDay);
            }
            done();
        });
    });
});
