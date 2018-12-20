describe('Timetable extractor', function() {
    before(() => {
        return new Promise((resolve) => {
            updatejQueryContext("test/pages/timetable_rcom.html").then(resolve)
        })
    })
    let e;

    it('should create a valid extractor', function(done) {
        e = new Timetable()
        e.structure.should.contain.all.keys("description", "extractor", "parameters", "storage")
        e.structure.extractor.should.equal("timetable")
        done()
    })

    it('should return list of events', function(done) {
        e.timetable = e.getEvents()
        e.timetable.should.be.an('object')
        e.timetable.events.should.have.length(8)
        e.timetable.events.forEach(event => {
            event.should.contain.all.keys("acronym", "download", "from", "klass", "location", "name", "room", "teacher", "to", "type")
            event.name.should.eql("Redes de Computadores")
            event.download.should.be.true
            event.acronym.should.eql("RCOM")
        })
        let first = e.timetable.events[0]
        first.type.should.be.eql("TP")
        first.teacher.name.should.be.eql("Manuel Pereira Ricardo")
        first.teacher.acronym.should.be.eql("MPR")
        first.location.should.be.eql("I320+I321")
        first.room.name.should.be.eql("I320+I321")
        first.room.url.should.include("hor_geral.composto_salas?p_c_sala=2594257")
        first.klass.name.should.be.eql("3MIEIC07")
        first.klass.url.should.include("hor_geral.turmas_view?pv_turma_id=207806&pv_ano_lectivo=2017&pv_periodos=1&pv_periodos=2&pv_periodos=4&pv_periodos=5&pv_periodos=8")
        first.from.should.eql(new Date("2017-09-18 08:30"))
        first.to.should.eql(new Date("2017-09-18 10:30"))
        done()
    }).timeout(5000)

    it('should return correct dates for RCOM', function(done) {
        e.timetable.from.should.eql(new Date("2017-09-16 24:00"))
        e.timetable.to.should.eql(new Date("2017-09-22 24:00"))
        done()
    })
})