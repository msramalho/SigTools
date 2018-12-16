before(() => {

})

describe('parse timetable', function() {
    it('should return list of events', function(done) {
        updatejQueryContext("test/pages/timetable_rcom.html").then(() => {
            let t = new Timetable()
            console.log(t);
            console.log(expect);
            expect(t.structure.extractor).to.equal("timetable")
            let events = t.getEvents()
            console.log(events);
            // expect
            events.should.be.an('object');
            done()
        }).catch(done)
    });
});
// updatejQueryContext("test/pages/timetable_rcom.html").then(() => {
//     describe('parse timetable', function() {
//         it('should return list of events', function() {
//             let t = new Timetable()
//             console.log(t);
//             console.log(expect);
//             expect(t.structure.extractor).to.equal("timetable")
//             events = t.getEvents()
//             console.log(events);
//             // expect
//             expect(events).to.be.a("object")
//             mocha.checkLeaks();
//             mocha.run();
//         });
//     });
// })