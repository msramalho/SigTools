"use strict";

/**
 * A parser for profile views in Sigarra. At the moment, it only works for
 * staff (func_geral.formview) as the students view page has a different layout
 * (fest_geral.cursos_list)
 */
class UserStaffParser {
    /**
     *
     * @param {Document?} doc An optional DOM object to use as parsing context.
     * Defaults to the 'document' global variable
     *
     * @throws In case the target page does not have the expected DOM elements
     */
    constructor(doc) {
        // if 'dom' unset, default to 'document'
        doc = doc || document;

        // find the 'div' the wrapps personal data, including photo and contacts
        this.$personalInfo = doc.querySelector(".informacao-pessoal-dados");

        // if 'div' not found, throw exception
        if (this.$personalInfo == null)
            throw Error("Cannot find the DOM node with the personal data");
    }

    /**
     * Run the parser over a URL page rather than current 'document' context
     * @param {string} url
     * @returns Promise<UserParser>
     */
    static fromURL(url) {
        return fetch(url)
            .then((response) => response.arrayBuffer())
            .then((buffer) => {
                /**
                 * Responses from sigarra endpoints are encoded as
                 * `text/html; charset=iso-8859-15`. The first step is to 
                 * decode the array buffer, which has the raw bytes, to uft-8
                 */
                const decoder = new TextDecoder('iso-8859-15');
                const html = decoder.decode(buffer);
                
                // create a new DOM parser for the decoded html
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, "text/html");
                return new UserStaffParser(doc);
            });
    }

    /**
     * Finds the table row with personal information for a given label,
     * e.g. 'Name:'
     *
     * @param {string} label
     * @returns {HTMLElement} A table row with the target data
     * @returns {undefined} An entry with the specified label was not found
     */
    _tryParseField(label) {
        // The DOM element `this.$personalInfo` has a table where each row
        // has a different personal info, e.g. 'name', 'email', 'rooms', etc.
        // | Name:                  | John Doe      |
        // | Email Institucional:   | john@fe.up.pt |
        // The label param represents the field name on the left side

        const $tr = Array.from(this.$personalInfo.querySelectorAll("tr")).find(
            (e) => {
                const $tdLabel = e.children[0];
                return $tdLabel.textContent === label;
            }
        );

        return $tr;
    }

    /**
     *
     * @returns {string} The full name
     */
    _tryParseName() {
        // Unlike other fields, the name is always present and is not
        // configurable, thus it has the complete name. No validation/checks
        // are needed, I hope (right Sigarra?)
        // Moreover, the english view translates the field label, but every
        // other label is always in portuguese :)
        const $tr =
            this._tryParseField("Nome:") || this._tryParseField("Name:");
        return $tr.children[1].textContent.trim();
    }

    /**
     *
     * @returns {string|null} An URL for personal webpage
     */
    _tryParseWebpage() {
        // the hyperlink for webpage is next to the name field
        const $tr =
            this._tryParseField("Nome:") || this._tryParseField("Name:");
        if (!$tr) return null;

        const $a = $tr.children[1].querySelector("a");
        if (!$a) return null;
        else return $a.href;
    }

    /**
     *
     * @returns {string|null} The institutional email. Alternative emails are
     * not visible, except for the administration
     */
    _tryParseEmail() {
        const $tr = this._tryParseField("Email Institucional:");
        if (!$tr) return null;

        const $emailTd = $tr.children[1].cloneNode(true);

        // the '@' is typically an image, replace it with plain text
        const $img = $emailTd.querySelector("img");
        if ($img) $img.replaceWith("@");

        return $emailTd.textContent.trim();
    }

    _tryParseRooms() {
        // TODO
    }

    _tryParsePhone() {
        // TODO
    }

    /**
     * Tries to parse personal information from a Sigarra profile view
     *
     * @returns {{
     *  name: string,
     *  firstname: string,
     *  lastname: string,
     *  email: string|null,
     *  webpage: string|null,
     * }}
     */
    parse() {
        const name = this._tryParseName();
        const email = this._tryParseEmail();
        const webpage = this._tryParseWebpage();

        const allNames = name.split(" ");
        const firstname = allNames[0];
        const lastname = allNames[allNames.length - 1];

        return {
            name,
            firstname,
            lastname,
            email,
            webpage,
        };
    }
}
