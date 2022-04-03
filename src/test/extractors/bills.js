describe("Bill extractor", function () {
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

describe("Bills with payment references extractor", function () {
    describe("When table does not exist", function () {
        before(function () {
            return updatejQueryContext("bills/normal.html").then(() => {
                this.billExtractor = new BillsPaymentRefs();
            });
        });

        it("should not throw", function (done) {
            /** @type {BillsPaymentRefs} */
            const e = this.billExtractor;
            chai.assert.doesNotThrow(e.attachIfPossible.bind(e));
            done();
        });

        it("should return empty lists", function (done) {
            /** @type {BillsPaymentRefs} */
            const e = this.billExtractor;
            chai.assert.isEmpty(e.parseBillsWithATM());
            chai.assert.isEmpty(e.getEvents());
            done();
        });

        it("should not modify DOM", function (done) {
            /** @type {BillsPaymentRefs} */
            const e = this.billExtractor;
            chai.assert.isNull(Sig.doc.querySelector('a.calendarBtn'));
            done();
        });
    });
    
    describe("When table exists", function () {
        before(function () {
            return updatejQueryContext("bills/with_atm.html").then(() => {
                this.billExtractor = new BillsPaymentRefs();
            });
        });

        it("should correctly aggregate the bills per ATM reference", function (done) {
            /** @type {BillsPaymentRefs} */
            this.billExtractor;

            const bills = this.billExtractor.parseBillsWithATM();

            chai.assert.equal(bills.length, 3);
            chai.assert.equal(bills[0].bills.length, 3);
            chai.assert.equal(bills[1].bills.length, 2);
            chai.assert.equal(bills[2].bills.length, 1);

            done();
        });

        it("should parse correctly", function (done) {
            /** @type {BillsPaymentRefs} */
            this.billExtractor;

            const bills = this.billExtractor.parseBillsWithATM();

            chai.assert.deepEqual(bills[0], {
                deadline: "2022-04-02",
                atm: {
                    entity: "10316",
                    reference: "272053250",
                },
                totalAmount: "69,80 €",
                bills: [
                    {
                        description: "Propinas - Mestrado em Engenharia Informática e Computação Prestação 7 2021/2022",
                        amount: "34,85 €",
                    },
                    {
                        description: "Propinas - Mestrado em Engenharia Informática e Computação Prestação 6 2021/2022",
                        amount: "34,85 €",
                    },
                    {
                        description:
                            "Juros de mora Propinas - Mestrado - Mestrado em Engenharia Informática e Computação\n                                Prestação 7 2021/2022 - Juros de Mora",
                        amount: "0,10 €",
                    },
                ],
            });

            chai.assert.deepEqual(bills[1], {
                deadline: "2022-04-30",
                atm: {
                    entity: "10316",
                    reference: "273471066",
                },
                totalAmount: "69,70 €",
                bills: [
                    {
                        description: "Propinas - Mestrado em Engenharia Informática e Computação Prestação 8 2021/2022",
                        amount: "34,85 €",
                    },
                    {
                        description: "Propinas - Mestrado em Engenharia Informática e Computação Prestação 9 2021/2022",
                        amount: "34,85 €",
                    },
                ],
            });

            chai.assert.deepEqual(bills[2], {
                deadline: "2022-04-11",
                atm: {
                    entity: "10316",
                    reference: "272494361",
                },
                totalAmount: "5,00 €",
                bills: [
                    {
                        description: "Serviço de Impressão Serviço de Impressão",
                        amount: "5,00 €",
                    },
                ],
            });
            done();
        });
    });
});
