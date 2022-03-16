"use strict";
/**
 * TODO
 */
class MailTo extends Extractor {

    constructor() {
        super();
        this.ready();
    }

    structure() {
        return {
            extractor: "mailto",
            description: "Things",
            storage: {
                text: [{
                    name: "exclude_urls_csv",
                    // ignore the profile page for FEUP employees
                    default: "func_geral.formview"
                }]
            }
        }
    }

    attachIfPossible() {
        // store data for all unique users
        const usersData = {};

        // find all hyperlinks for unique user profiles
        const allHyperlinks = this.getUserHyperlinks();

        // for each unique user, load all details from cache or by parsing the profile page
        const allPromises = [];
        const uniqueIds = new Set();
        for (const { id } of allHyperlinks) {
            if (!uniqueIds.has(id)) {
                uniqueIds.add(id);
                allPromises.push(
                    this.getUserData(id).then(({ email, firstname, lastname }) => {
                        usersData[id] = {
                            email,
                            firstname,
                            lastname
                        };
                    })
                );
            }
        }

        Promise.allSettled(allPromises).then(() => {
            // for each hyperlink in the page, add the 'send email' button
            for (const { id, node } of allHyperlinks) {
                if (id in usersData && usersData[id].email) {
                    node.insertAdjacentHTML(
                        "beforebegin",
                        `<a href="mailto:${usersData[id].email}"><img style="margin-right:0.25em" src="${chrome.extension.getURL("icons/email.png")}"></a>`
                    );
                }
            }

            // Update cache
            chrome.storage.local.get("users_cache", (result) => {
                chrome.storage.local.set({
                    "users_cache": {
                        ...result["users_cache"],
                        ...usersData
                    },
                });
            });
        });
    }

    /**
     *
     * @returns {{
     *  url: string,
     *  id: string,
     *  node: HTMLElement
     * }[]}
     */
    getUserHyperlinks() {
        const re = /func_geral\.formview\?p_codigo=(\d+)/i;
        return Array.prototype.filter.call(document.querySelectorAll("a"), ($el) => re.test($el.href)).map(($el) => {
            const m = $el.href.match(re);
            return {
                url: $el.href,
                id: m[1],
                node: $el
            }
        });
    }

    /**
     * 
     * @param {*} userID 
     * @returns {Promise<{
     *  name: string,
     *  firstname: string,
     *  lastname: string,
     *  email: string|null,
     *  webpage: string|null,
     * }>}
     */
    getUserData(userID) {
        return new Promise((resolve, reject) => {
            // try to load from cache
            chrome.storage.local.get("users_cache", (result) => {
                // note: if the entry 'users_cache' does not exist, 'result' is an empty object
                result = result["users_cache"] || {};
                if (result[userID] && result[userID].email) {
                    // if the user ID is cached and has an email, return the result
                    resolve(result[userID]);
                } else {
                    // otherwise parse the profile page and cache the results
                    UserStaffParser
                        .fromURL(`https://sigarra.up.pt/feup/pt/func_geral.formview?p_codigo=${userID}`)
                        .then((userParser) => {
                            const data = userParser.parse();
                            resolve(data);
                        })
                }
            });
        });
    }
}

// add an instance to the EXTRACTORS variable, and also trigger attachIfPossible due to constructor
EXTRACTORS.push(new MailTo());