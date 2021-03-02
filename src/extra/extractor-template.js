"use strict";

class TemplateExtractor extends Extractor {

    constructor() {
        super();
        // INITIAL OPERATIONS
        this.ready();
    }

    structure() {
        return {
            extractor: "the name of the extractor", // must be unique among extractors
            description: "a simple description of what it does",
            parameters: [{//a list of the parameters that can be used any user
                name: "name of the parameter",
                description: "either describe or exemplify"
            }
                //... other parameters
            ],
            storage: { // the variables to save for this extractor (in the local storage)
                text: [ //variables that should be displayed and edited in <input type="text">
                    {
                        name: "the name of the variable, eg: title",
                        default: "The default value, eg: [${acronym}] - ${room.name}"
                    }
                ],
                textarea: [ //variables that should be displayed and edited in <textarea></textarea>
                    {
                        name: "description",
                        default: "another description - can have <strong>HTML</strong> inside"
                    }
                ],
                boolean: [ //variables that should be displayed and edited in <input type="checkbox">
                    {
                        name: "isHTML",
                        default: true
                    }
                ],
                color: [{
                    name: "colorValue",
                    default: "#009684"
                }]
            }
        }
    }


    attachIfPossible() {

    }

}

// add an instance to the EXTRACTORS variable, and also trigger attachIfPossible due to constructor
EXTRACTORS.push(new TemplateExtractor());