"use strict";

class Logger {
    static isEnabled = false;

    /**
     * Generic function that calls one of the 'console' functions (e.g. 'debug')
     * if the `isEnabled` attribute is set. Moreover, it adds a styled prefix
     * to the message saying "SigTools" :)
     * 
     * @param {Function} fn A console function reference, e.g.
     * `console.debug`
     * @param {any[]} args The arguments list to be passed to the console
     * function
     */
    static _caller(fn, args) {
        Logger.isEnabled && fn(
            "%cSigTools",
            "font-weight: bold; background-color: #e74c3c; color: white; padding: 0.5em 0.25em",
            ...args
        );
    }

    // A list of functions available in 'console' and supported in our logger
    // This is just a declaration because of the IDEs. The definition is below
    // See: https://developer.mozilla.org/en-US/docs/Web/API/console
    static debug() { }
    static error() { }
    static info() { }
    static log() { }
    static warn() { }
}

// dynamically define the interfaces in our logger to existing functions in
// 'console'
if (console) {

    // get the static methods added above, e.g. 'debug', 'error', etc
    const allFn = Object.getOwnPropertyNames(Logger).filter(
        prop => typeof Logger[prop] === "function" && prop !== '_caller'
    );

    for (const fnName of allFn) {
        Logger[fnName] = function () {
            Logger._caller(console[fnName], arguments);
        }
    }
}

// @if DEBUG=true
// logger is only enabled when 'gulp' env is set to development mode
Logger.isEnabled = true;
// @endif