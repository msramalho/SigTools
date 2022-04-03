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

class Random extends EventExtractor {
    constructor() {
        super();
        this.ready();
    }

    structure() {
        return super.structure(
            {
                extractor: "random",
                name: "Pending Bills (with ATM ref.)",
                description: "Extracts pending bills with generated ATM references",
                icon: "bill.png",
                parameters: [
                    {
                        name: "simple",
                        description: "string",
                    },
                    {
                        name: "nested.a",
                        description: "string",
                    },
                    {
                        name: "nested.b.c.d.e",
                        description:
                            "string",
                    },
                ],
            },
            "title",
            "description",
            "",
            true,
            CalendarEventStatus.FREE
        );
    }
}

describe("EventExtractors", function () {
    it("should be able to enforce required parameters at runtime", function (done) {
        const r = new Random();

        chai.assert.doesNotThrow(r._validateEventParams.bind(r, {
            simple: "lorem ipsum",
            nested: {
                a: "test",
                b: {
                    c: {
                        d: {
                            e: "aaaaaaaaaaaaaaaa"
                        }
                    }
                }
            }
        }));

        chai.assert.throws(r._validateEventParams.bind(r, {
            // wrong!
            nested: {
                a: "test",
                b: {
                    c: {
                        d: {
                            e: "aaaaaaaaaaaaaaaa"
                        }
                    }
                }
            }
        }));

        chai.assert.throws(r._validateEventParams.bind(r, {
            simple: "lorem ipsum",
            nested: {
                a: "test",
                b: {
                    opsi: { // wrong
                        d: {
                            e: "aaaaaaaaaaaaaaaa"
                        }
                    }
                }
            }
        }));

        done();
    });
});
