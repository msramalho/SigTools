before(() => {

})

describe('parse timetable', function() {
    it('should return list of events', function() {
        updatejQueryContext("test/pages/timetable_rcom.html").then(() => {
            let t = new Timetable()
            console.log(t);
            chai.expect(t.structure.extractor).to.equal("timetable")
            events = t.getEvents()
            chai.expect(t.getEvents()).to.equal("timetable")
        })
    });
});