describe("Datatables", function () {
    const isTableWrapped = function ($table) {
        return $($table).parents(".SigTools__dt__table").length === 1;
    };
    const isAllWrapped = function ($table) {
        return $($table).parents(".SigTools__dt").length === 1;
    };

    const isDataTableApplied = function ($table) {
        return isTableWrapped($table) && isAllWrapped($table);
    };

    describe("Valid tables (no pre-processing needed)", function () {
        /**
         * Check DataTable lib loads correctly on all candidate tables
         */
        it("Check DataTable loads correctly on all candidates", function () {
            updatejQueryContext("datatables/all_valid.html").then(() => {
                this.dt = new DataTable();
                this.dt.attachIfPossible();

                for (const t of $("table")) {
                    chai.assert.isTrue(isDataTableApplied(t));
                }
            });
        });
    });

    describe("Single row feature (user setting)", function () {
        it("Single row not disabled", function (done) {
            updatejQueryContext("datatables/single_row.html").then(() => {
                const dt = new DataTable();
                dt.disable_one_row = false;
                for (const t of $("table")) {
                    chai.assert.isTrue(dt.validTable($(t)));
                }
                done();
            });
        });

        it("Single row disabled", function (done) {
            updatejQueryContext("datatables/single_row.html").then(() => {
                const dt = new DataTable();
                dt.disable_one_row = true;
                for (const t of $("table")) {
                    chai.assert.isFalse(dt.validTable($(t)));
                }
                done();
            });
        });
    });

    describe("Tables with implicit headers", function () {
        before(function (done) {
            updatejQueryContext("datatables/implicit_headers.html").then(() => {
                done();
            });
        });

        describe("Testing TableUtils", function () {
            it("Check if row is a valid header row", function () {
                const $trValidHeader = $("#table-implicit-header-1 tr:nth-child(1)");
                const $trInvalidHeader1 = $("#table-implicit-header-1 tr:nth-child(2)");
                const $trInvalidHeader2 = $("#table-implicit-header-4 tr:nth-child(3)");

                chai.assert.isTrue(
                    TableUtils.isHeaderRow($trValidHeader),
                    "Expected <tr> with <th> only to be a valid table header row"
                );

                chai.assert.isFalse(
                    TableUtils.isHeaderRow($trInvalidHeader1),
                    "The <tr> is full of <td>, thus is not a valid table header"
                );

                chai.assert.isFalse(
                    TableUtils.isHeaderRow($trInvalidHeader2),
                    "The <tr> has mixed <td> and <th>, thus is not a valid table header"
                );
            });

            it("Find implicit headers", function () {
                const customAssert = (tableId, numHeaderRows, msg) => {
                    const $t = $(`#${tableId}`).first();
                    const $h = TableUtils.getHeaderRows($t);
                    chai.assert.strictEqual(
                        $h.length,
                        numHeaderRows,
                        msg || `Table #${tableId} has ${numHeaderRows} header row(s)`
                    );
                    return $h;
                };

                customAssert("table-implicit-header-1", 1);
                customAssert("table-implicit-header-2", 1);
                customAssert("table-implicit-header-3", 2);
                customAssert("table-implicit-header-4", 2);
                customAssert("table-no-header-1", 0);
                customAssert("table-no-header-2", 0);
                customAssert("table-implicit-header-5", 1);

                // table 5 has two header rows, but one of them is in the middle of the table
                // therefore, it cannot be considered
                // this test ensures it captured the correct header row
                chai.assert.strictEqual(
                    customAssert("table-implicit-header-5", 1)[0][0].getAttribute("class"),
                    "first"
                );
            });
        });

        describe("Testing DataTable", function () {
            before(function (done) {
                this.dt = new DataTable();
                done();
            });

            it("Check does not throw", function () {
                chai.assert.doesNotThrow(() => {
                    this._aux = this.dt.attachIfPossible();
                }, "The sample test file has unsupported tables where DataTable will fail and throw exception. This sould be catched");
            });

            it("Check DataTable applied with success", function () {
                const validTableIds = [
                    "table-implicit-header-1",
                    "table-implicit-header-2",
                    "table-implicit-header-3",
                    "table-implicit-header-4",
                    "table-implicit-header-5",
                ];

                for (const tid of validTableIds) {
                    chai.assert.isTrue(isDataTableApplied($(`#${tid}`)));
                }

                const invalidTableIds = ["table-no-header-1", "table-no-header-2"];

                for (const tid of invalidTableIds) {
                    chai.assert.isFalse(isDataTableApplied(isDataTableApplied($(`#${tid}`))));
                }
            });
        });
    });
});
