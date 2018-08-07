"use strict";
/**
 * The base extractor that works as an interface for the other interfaces
 */
class Extractor {

    /**
     * Initialize variables: this.structure object, init, and attachIfPossible
     */
    constructor() {
        this.structure = this.structure()
    }

    /**
     * Must return an object that describes the class: name, description, parameters in its events, variables that go to the storage
     */
    structure() {
        throw "Must implement structure method on children of Extractor"
    }

    /**
     * function to be called after init, where all the initial HTML changes are made to the pages
     */
    attachIfPossible() {
        throw "Must implement attachIfPossible method on children of Extractor"
    }

    /**
     * function that receives an event and clones it, and calls encodeURIComponent on the necessary elements and then returns the new object, that can be safely used in injected URIs
     */
    convertToURI(original) {
        throw "Must implement convertToURI method on children of Extractor"
    }

    /**
     * simple wrapper that waits for init and then calls attachIfPossible, should be called in constructor of implementing classes
     */
    ready() {
        this.init().then(() => this.attachIfPossible())
    }

    /**
     * Loads the structure.storage values into memory or uses the defaults if not set
     */
    init() {
        let that = this;
        return new Promise(
            function(resolve, reject) {
                chrome.storage.local.get(that.structure.extractor, (obj) => {
                    obj = obj[that.structure.extractor]; // remove wrapper so that values are directly accessible
                    getProperties(that.structure.storage).forEach(prop => {
                        that.structure.storage[prop].forEach(option => {
                            // if this option is not set yet, then use the default, else use stored value
                            if (obj == undefined || obj[option.name] == undefined) that[option.name] = option.default;
                            else that[option.name] = obj[option.name];
                            option.value = that[option.name]; // save the value in the structure
                        });
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
        if (forUrl) event = this._getConvertedToUri(event)
        return parseStrFormat(event, this.title, this.isHTML)
    }

    /**
     * function that receives an event and returns its description in the desired format
     */
    getDescription(event, forUrl) {
        if (forUrl) event = this._getConvertedToUri(event)
        return parseStrFormat(event, this.description, this.isHTML)
    }

    _getConvertedToUri(original) {
        let event = jQuery.extend(true, {}, original)
        return this.convertToURI(event)
    }
}

let EXTRACTORS = []; //each new extractor shall add an instance of itself to this variable