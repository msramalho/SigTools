before(() => {
    return new Promise((resolve) => {
        updatejQueryContext("test/pages/timetable_rcom.html").then(resolve)
    })
})

let t;
describe('parse timetable', function() {
    it('should create a valid timetable', function(done) {
        t = new Timetable()
        expect(t.structure.extractor).to.equal("timetable")
        done()
    })

    it('should return list of events', function(done) {
        // console.log(t.table.html());
        t.events = t.getEvents()
        console.log(t.events);
        t.events.should.be.an('object')
        done()
    }).timeout(5000)

    it('should return correct dates for RCOM', function(done) {
        t.events.from.should.be.a('date')
        t.events.from.should.eql(new Date("2017-09-16 24:00"))
        t.events.to.should.be.a('date')
        t.events.to.should.eql(new Date("2017-09-22 24:00"))
        done()
    })
})