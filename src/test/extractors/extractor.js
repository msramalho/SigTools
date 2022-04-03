describe("Extractors", function () {
    it("every extractor should have a basic structure", function (done) {
        for (const e of EXTRACTORS) {
            chai.assert.containsAllKeys(
                e.structure,
                ["extractor", "description", "name"],
                `Extractor '${e.constructor.name}' is missing some mandatory properties in its structure`
            );
        }

        done();
    });
});
