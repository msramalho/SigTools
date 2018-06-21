"use strict";
/**
 * The base extractor that works as an interface for the other interfaces
 */
class Extractor {
    structure = {}

    constructor() {}

    /**
     * Loads the structure.storage values into memory or uses the defaults if not set
     */
    init() {
        let that = this;
        return new Promise(
            function(resolve, reject) {
                chrome.storage.local.get(structure.name, (obj) => {
                    structure.storage.forEach(option => {
                        // if this option is not set yet, then use the default, else use stored value
                        if (obj[option.name] == undefined) that[option.name] = option.default;
                        else that[option.name] = obj[option.name];
                    });
                    resolve();
                });
            }
        )
    }

    /**
     * function that receives an event and returns its name in the desired format
     */
    getName(event, forUrl) {
        if (forUrl) event = this.convertToURI(event);
        return parseStrFormat(event, this.title, this.isHTML);
    }

    /**
     * function that receives an event and returns its description in the desired format
     */
    getDescription(event, forUrl) {
        if (forUrl) event = this.convertToURI(event);
        return parseStrFormat(event, this.description, this.isHTML);
    }
}