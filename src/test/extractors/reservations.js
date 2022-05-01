describe("Reservations Extractor", function () {

    describe("Invalid DOM", function () {
        it("should not throw", function (done) {
            const res = new Reservations();
            const ev1 = res.parseReservationView();
            const ev2 = res.parseReservationsList();
            done();
        });
    })

    describe("Reservation view page (individual event)", function () {
        before(function () {
            return updatejQueryContext("reservations/item.html").then(() => {
                this.res = new Reservations();
            });
        });

        it("Should parse individual reservation correctly", function (done) {
            /** @type {Reservations} */
            this.res;

            const ev = this.res.parseReservationView();
            chai.assert.deepEqual(ev.from, new Date("2022-04-05 09:00"), "Wrong start datetime");
            chai.assert.deepEqual(ev.to, new Date("2022-04-05 16:00"), "Wrong end datetime");
            chai.assert.equal(ev.room.name, "C620", "Wrong room");
            chai.assert.match(ev.room.url, /instal_geral.espaco_view\?pv_id=73580$/, "Wrong room url");
            done();
        });
    })

    describe("List of reservations page", function () {
        before(function () {
            return updatejQueryContext("reservations/list.html").then(() => {
                this.res = new Reservations();
            });
        });

        it("Should ignore canceled reservations", function (done) {
            const ev = this.res.parseReservationsList();
            chai.assert.lengthOf(ev, 3);
            done();
        });

        it("Should parse list of reservations correctly", function (done) {
            /** @type {Reservations} */
            this.res;

            const ev = this.res.parseReservationsList();

            chai.assert.deepEqual(ev[0].from, new Date("2022-04-05 09:00"), "Wrong start datetime");
            chai.assert.deepEqual(ev[0].to, new Date("2022-04-05 16:00"), "Wrong end datetime");
            chai.assert.equal(ev[0].room.name, "C620", "Wrong room");
            chai.assert.match(ev[0].room.url, /instal_geral.espaco_view\?pv_id=73580$/, "Wrong room url");

            chai.assert.deepEqual(ev[1].from, new Date("2022-04-07 09:00"), "Wrong start datetime");
            chai.assert.deepEqual(ev[1].to, new Date("2022-04-07 17:00"), "Wrong end datetime");
            chai.assert.equal(ev[1].room.name, "C616", "Wrong room");
            chai.assert.match(ev[1].room.url, /instal_geral.espaco_view\?pv_id=73581$/, "Wrong room url");

            chai.assert.deepEqual(ev[2].from, new Date("2022-04-08 09:00"), "Wrong start datetime");
            chai.assert.deepEqual(ev[2].to, new Date("2022-04-08 14:00"), "Wrong end datetime");
            chai.assert.equal(ev[2].room.name, "C616", "Wrong room");
            chai.assert.match(ev[2].room.url, /instal_geral.espaco_view\?pv_id=73581$/, "Wrong room url");

            done();
        });
    })
});
