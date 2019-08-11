describe('Bill extractor', function() {
    before(() => {
        return new Promise((resolve) => {
            updatejQueryContext("test/pages/conta_corrente.html").then(resolve)
        })
    })
    let e, b;
    it('should create a valid extractor', function(done) {
        e = new Bill()
        e.structure.should.contain.all.keys("description", "extractor", "parameters", "storage")
        e.structure.extractor.should.equal("bills")
        // e.apply = true
        // e.attachIfPossible()
        done()
    })
    it('should find all the bills in the page', function(done) {
        b = e._getBills()
        b.should.have.length(2)
        done()
    })
    it('should parse all the bills properly', function(done) {
        b = b.map(e._parsePendingBill)
        b.forEach(bill => {
            bill.should.contain.all.keys("amount", "date", "description", "from", "to", "location")
            bill.download.should.eql(false)
        })
        // b[0].amount.should.equal("120,00 €")
        b[0].amount.should.have.length(8)
		b[0].description.should.equal("Carta de Curso - Licenciatura - Mestrado Integrado em Engenharia Informática e Computação - Pedido de Certificado: Carta de Curso - Grau de Licenciado")
        b[0].from.should.eql(new Date("2018-12-22 00:00"))
        b[0].to.should.eql(new Date("2019-01-08 00:00"))
        b[0].date.should.eql(new Date("2019-01-08 00:00"))

        // b[1].amount.should.equal("5,00 €")
        b[1].amount.should.have.length(6)
        b[1].description.should.equal("Certidão de Aproveitamento Escolar - Mestrado Integrado em Engenharia Informática e Computação - Pedido de Certificado: Certidão de Aproveitamento Escolar")
        b[1].from.should.eql(new Date("2018-12-22 00:00"))
        b[1].to.should.eql(new Date("2019-01-08 00:00"))
        b[1].date.should.eql(new Date("2019-01-08 00:00"))
        done()
    })
})