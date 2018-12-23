describe('Grades extractor', function() {
    before(() => {
        return new Promise((resolve) => {
            updatejQueryContext("test/pages/grades_monitoria.html").then(resolve)
        })
    })
    let e;
    it('should create a valid extractor', function(done) {
        e = new Grades()
        e.structure.should.contain.all.keys("description", "extractor", "parameters", "storage")
        e.structure.extractor.should.equal("grades")
        e.apply = true
        e.attachIfPossible() // will throw async: "Failed to create chart: can't acquire context from the given item"
        done()
    })
    it('should get the proper labels for the plot', function(done) {
        let l = e.getLabels()
        l.should.have.length(28)
        l.should.eql(["RFF", "RFC", "RFE", "RFR", "RA", "RD", "REC", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20])
        done()
    })
    it('should get the proper numeric grades', function(done) {
        let l = e.getNumericGrades()
        l.should.have.length(36)
        l.should.eql([16, 16, 18, 16, 16, 16, 15, 17, 17, 16, 17, 16, 16, 15, 17, 17, 15, 17, 17, 18, 18, 18, 17, 18, 16, 15, 16, 15, 16, 17, 18, 18, 15, 18, 18, 16])
        done()
    })
    it('should get the proper accumulated grades', function(done) {
        let l = e.getAccumulatedGrades()
        l.should.have.length(28)
        l.should.eql([1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 12, 9, 9, 0, 0])
        done()
    })
    it('should get the proper overall grades', function(done) {
        let l = e.getGrades()
        l.should.have.length(43)
        l.should.eql(["RFF", "RFC", "RFE", "RFR", "RA", "RD", "REC", "16", "16", "18", "16", "16", "16", "15", "17", "17", "16", "17", "16", "16", "15", "17", "17", "15", "17", "17", "18", "18", "18", "17", "18", "16", "15", "16", "15", "16", "17", "18", "18", "15", "18", "18", "16"])
        done()
    })
    it('should have a function to generate students html list items', function(done) {
		e._getHtmlStudentList().should.eql("\n")
		let l = e._getHtmlStudentList([{
            id: "201403027",
            name: "msramalho"
		}])
		l.should.match(/<ul>/)
		l.should.match(/<li>/)
		l.should.contain("201403027")
		l.should.contain("msramalho")
        done()
    })
})