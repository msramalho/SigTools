"use strict";
/**
 * The base extractor that works as an interface for the other interfaces
 */
class Extractor {
    structure = {}

    constructor() {}

    /**
     * add the calendar btn to the DOM tree (only made sense ifApplicable is true) with the correct listeners
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
     * returns true if description/name are html syntax. Otherwise, if textplain, returns false.
     */
    isHTML() {
        return false;
    }

    /**
     * returns an event object that matches the current extractor's format and context
     */
    static getEvent() {}
}