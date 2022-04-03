"use strict";
/**
 * The base extractor that works as an interface for the other interfaces
 */
class Extractor {
    /**
     * Initialize variables: this.structure object, init, and attachIfPossible
     */
    constructor() {
        this.structure = this.structure() || {};
        // implement default properties, that each extractor can override at own risk
        this.structure.storage = this.structure.storage || {};
        this.structure.storage.boolean = this.structure.storage.boolean || [];
        this.structure.storage.boolean.push({
            name: "apply",
            default: true,
        });
        this.structure.storage.text = this.structure.storage.text || [];
        let has_exclude_urls = this.structure.storage.text.some((setting) => setting.name == "exclude_urls_csv");
        if (!has_exclude_urls) {
            this.structure.storage.text.push({
                name: "exclude_urls_csv",
                default: "",
            });
        }
        // load default properties
        this.url = window.location.href.toLowerCase();
    }

    /**
     * Must return an object that describes the class: name, description, parameters in its events, variables that go to the storage
     */
    structure() {
        throw "Must implement structure method on children of Extractor";
    }

    /**
     * function to be called after init, where all the initial HTML changes are made to the pages
     */
    attachIfPossible() {
        throw "Must implement attachIfPossible method on children of Extractor";
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
        let excluded_page = this.exclude_urls_csv
            .split(",")
            .some((e) => e.length > 0 && this.url.includes(e.toLowerCase()));
        let options_page = this.url.indexOf("options.html") != -1;
        if (excluded_page)
            console.warn(`Extractor ${this.structure.extractor} was NOT APPLIED to this page as it is blacklisted`);
        if (!this.apply)
            console.warn(
                `Extractor ${
                    this.structure.extractor
                } was NOT APPLIED to this page, you have disabled it in the options page (${chrome.extension.getURL(
                    "options.html"
                )})`
            );
        return !options_page && !excluded_page && this.apply;
    }

    /**
     * Loads the structure.storage values into memory or uses the defaults if not set
     */
    init() {
        let that = this;
        return new Promise(function (resolve, reject) {
            chrome.storage.local.get(that.structure.extractor, (obj) => {
                obj = obj[that.structure.extractor]; // remove wrapper so that values are directly accessible
                getProperties(that.structure.storage).forEach((prop) => {
                    that.structure.storage[prop].forEach((option) => {
                        // if this option is not set yet, then use the default, else use stored value
                        if (obj == undefined || obj[option.name] == undefined) that[option.name] = option.default;
                        else that[option.name] = obj[option.name];
                        option.value = that[option.name]; // save the value in the structure
                    });
                });
                resolve();
            });
        });
    }

    /**
     * function that receives an event and returns its name in the desired format
     * @deprecated
     */
    getName(event) {
        return parseStrFormat(event, this.title, this.isHTML);
    }

    /**
     * @deprecated
     */
    getNameEncoded(event) {
        return encodeURIComponent(this.getName(event));
    }

    /**
     * @deprecated
     * function that receives an event and returns its description in the desired format
     */
    getDescription(event) {
        return parseStrFormat(event, this.description, this.isHTML);
    }

    /**
     * @deprecated
     */
    getDescriptionEncoded(event) {
        return encodeURIComponent(this.getDescription(event));
    }
}

class EventExtractor extends Extractor {
    /**
     * A format-string that sets calendar event's title for this extractor.
     * The format-string is set by the user in the options page and the default
     * is set in {@link structure} method.
     * @type {string}
     */
    title = null;
    /**
     * A format-string that sets calendar event's description. Similar to
     * {@link title}
     * @type {string}
     */
    description = null;
    /**
     * A format-string for the calendar event's location
     * @type {string}
     */
    location = null;
    /**
     * A flag indicating whether the title and description format-strings are
     * plain text or HTML. It is necessary to handle encoding in specific
     * calendars.
     */
    isHTML = null;
    /**
     * A flag indicating if events created by this extractor should appear as
     * "BUSY" or "FREE" in the calendar
     * @type {CalendarEventStatus}
     */
    status = null;

    /**
     *
     */
    constructor() {
        super();
    }

    init() {
        return super.init().then(() => {
            // the event's status setting is stored as String in storage
            // this "casts" the value to CalendarEventStatus before is used
            this.status = CalendarEventStatus.fromValue(this.status);
        });
    }

    /**
     * To be called by EventExtractor implementations as all instances have
     * a common structure properties. However, each implementation will have
     * its own default values, which are configured via parameters
     *
     * @param {Object} childStructure
     * @param {string} title Default title format-string
     * @param {string} description Default description format-string
     * @param {string} location Default location format-string
     * @param {boolean} isHTML If the default format-strings are HTML
     * @param {CalendarEventStatus} status Default availability for the events,
     * i.e. show as 'Busy', or show as 'Free' in calendar clients
     */
    structure(childStructure, title, description, location, isHTML, status) {
        return {
            ...childStructure,
            storage: {
                text: [
                    {
                        name: "title",
                        default: title,
                    },
                    {
                        name: "location",
                        default: location,
                    },
                ],
                textarea: [
                    {
                        name: "description",
                        default: description,
                    },
                ],
                select: [
                    {
                        name: "status", // should be stored as string in storage
                        options: [CalendarEventStatus.BUSY.value(), CalendarEventStatus.FREE.value()],
                        default: status.value(),
                    },
                ],
                boolean: [
                    {
                        name: "isHTML",
                        default: isHTML,
                    },
                ],
            },
        };
    }

    /**
     * Build the event title using the formatting set by the user in the options
     * page.
     *
     * @param {Object} params An object that sets the value for all parameters
     * available in this extractor, as declared in the {@link structure} method.
     *
     * @returns {String} The formatted string, which may be HTML or plaintext
     * depending on user settings
     */
    getTitle(params) {
        return this._evalFormatString(this.title, params);
    }

    /**
     * Build the event description using the formatting set by the user in the
     * options page.
     *
     * @param {Object} params An object that sets the value for all parameters
     * available in this extractor, as declared in the {@link structure} method.
     *
     * @returns {String} The formatted string, which may be HTML or plaintext
     * depending on user settings
     */
    getDescription(params) {
        return this._evalFormatString(this.description, params);
    }

    /**
     * Build the event's location using the format set by the user in the
     * options page.
     *
     * @param {Object} params An object that sets the value for all parameters
     * available in this extractor, as declared in the {@link structure} method.
     *
     * @returns {String} The formatted string, which may be HTML or plaintext
     * depending on user settings
     */
    getLocation(params) {
        return this._evalFormatString(this.location, params);
    }

    /**
     * Validates the metadata objects used to generate the calendar event title
     * and description.
     *
     * Title and description are customisable in the options
     * page with placeholers for extracted information. For instance, an
     * exam extractor has the course's name, acronym and url page. It has the
     * exams location/room, etc etc. The user can prepare a custom title that
     * uses the said information and format it in whatever style.
     *
     * This function ensures that the extracted metadata has all parameters as
     * declared in the Extractor's structure. See {@link structure}
     *
     * @param {Object} params
     */
    _validateEventParams(params) {
        // for each parameter declared in the extractors structure
        for (const { name: paramName } of this.structure.parameters) {
            // Some properties are declared as `a.b.c`
            // meaning that `a` and `b` are objects
            // That syntax works when using `eval`, it is valid JS syntax
            // To statically validate nested objects, we break the parameter
            // name by dots and iteratively check the entire chain
            const properties = paramName.split(".");
            let curr = params; // the current object in the chain

            for (const prop of properties) {
                if (!(prop in curr))
                    throw Error(
                        `Missing parameter '${paramName}' declared in the Extractor's structure. Received ${JSON.stringify(
                            params
                        )}`
                    );
                // move forward in the chain
                curr = curr[prop];
            }
        }
    }

    /**
     * Resolves the format string for event titles/descriptions replacing
     * the parameters placeholders with extracted values
     *
     * @param {String} formatStr
     * @param {Object} params
     * @returns
     */
    _evalFormatString(formatStr, params) {
        // ensure the metadata object, params, has all the properties
        // declated in this extractor's structure
        this._validateEventParams(params);

        // prepare the format string to be evaluated
        let str = "`" + formatStr + "`";
        if (this.isHTML) str = str.replace("\n", "<br/>");

        // In strict mode, the 'eval' has its own context
        // therefore we prepare a list of commands to be evaluated constructing
        // a string like 'cmd1;cmd2;cmd3'.
        // The first commands declare the available extractor parameters as
        // variables initialised with the extracted values
        // The last command is simply with the format string that uses the
        // parameters as variables, resulting in the desired string
        // E.g.,
        // > const name="Sistemas Operativos";const location="B101";
        // `Exame ${name} - ${location}`
        // outputs "Sistemas Operativos - B101"
        const cmds = [...Object.getOwnPropertyNames(params).map((p) => `const ${p} = params.${p}`), str];

        try {
            str = eval(cmds.join(";")).replace("undefined", "n/a").replace("null", "n/a");
        } catch (error) {
            swal(
                "Ups!",
                `There was an error parsing the event format for:\n${str}\n\nPlease check the options page for SigTools to check if you have a typo in your format options`,
                "warning"
            );
        }

        return str;
    }
}

let EXTRACTORS = []; //each new extractor shall add an instance of itself to this variable
