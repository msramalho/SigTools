"use strict";
class BaseExtractor {
    constructor() {}

    /**
     * add the calendar btn to the DOM tree (only maked sense ifApplicable is true) with the correct listeners
     */
    attachIfPossible() {}

    /**
     * function that receives an event and returns its name in the desired format
     */
    getName(event) {
        return "";
    }

    /**
     * function that receives an event and returns its description in the desired format
     */
    getDescription(event) {
        return "";
    }

    /**
     * returns an event object that matches the current extractor's format and context
     */
    static getEvent(){}
}