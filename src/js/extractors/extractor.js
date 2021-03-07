"use strict";
/**
 * The base extractor that works as an interface for the other interfaces
 */
class Extractor {

    /**
     * Initialize variables: this.structure object, init, and attachIfPossible
     */
    constructor() {
        this.structure = this.structure() || {}
        // implement default properties, that each extractor can override at own risk
        this.structure.storage = this.structure.storage || {}
        this.structure.storage.boolean = this.structure.storage.boolean || []
        this.structure.storage.boolean.push({
            name: "apply",
            default: true
        })
        this.structure.storage.text = this.structure.storage.text || []
        let has_exclude_urls = this.structure.storage.text.some((setting) => setting.name == "exclude_urls_csv")
        if (!has_exclude_urls) {
            this.structure.storage.text.push({
                name: "exclude_urls_csv",
                default: ""
            })
        }
        // load default properties
        this.url = window.location.href.toLowerCase()
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
     * simple wrapper that waits for init and then calls attachIfPossible, should be called in constructor of implementing classes
     */
    ready() {
        this.init().then(() => {
            if (this.applyToPage()) this.attachIfPossible();
        });
    }

    /**
     * check if the current page is the options.html paget -> do not include extractor
     * OR
     * if this page is in one of the excluded urls
     */
    applyToPage() {
        let excluded_page = this.exclude_urls_csv.split(",").some(e => e.length > 0 && this.url.includes(e.toLowerCase()))
        let options_page = this.url.indexOf('options.html') != -1
        if (excluded_page) console.warn(`Extractor ${this.structure.extractor} was NOT APPLIED to this page as it is blacklisted`);
        if (!this.apply) console.warn(`Extractor ${this.structure.extractor} was NOT APPLIED to this page, you have disabled it in the options page (${chrome.extension.getURL('options.html')})`);
        return !options_page && !excluded_page && this.apply
    }

    /**
     * Loads the structure.storage values into memory or uses the defaults if not set
     */
    init() {
        let that = this;
        return new Promise(
            function (resolve, reject) {
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
    getName(event) {
        return parseStrFormat(event, this.title, this.isHTML);
    }

    getNameEncoded(event) {
        return encodeURIComponent(this.getName(event));
    }

    /**
     * function that receives an event and returns its description in the desired format
     */
    getDescription(event) {
        return parseStrFormat(event, this.description, this.isHTML);
    }

    getDescriptionEncoded(event) {
        return encodeURIComponent(this.getDescription(event));
    }
}

let EXTRACTORS = []; //each new extractor shall add an instance of itself to this variable