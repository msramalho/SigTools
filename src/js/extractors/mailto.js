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
                text: [
                    {
                        name: "exclude_urls_csv",
                        // ignore the profile page for FEUP employees
                        default: "func_geral.formview",
                    },
                ],
            },
        };
    }

    attachIfPossible() {
        // store data for all unique users
        const usersData = {};

        // find all hyperlinks for unique user profiles
        Logger.debug("[Mailto]", `Looking for all hyperlinks in the page...`);
        const allHyperlinks = this.getUserHyperlinks();

        // for each unique user, load all details from cache or by parsing the profile page
        const allPromises = [];
        const uniqueIds = new Set();
        for (const { id, node } of allHyperlinks) {
            Logger.debug("[Mailto]", `Found user ID ${id} from`, node);
            if (!uniqueIds.has(id)) {
                // register the ID to avoid duplicated processing
                uniqueIds.add(id);

                // init promise
                const p = this.getUserData(id)
                    .then(({ email, firstname, lastname, name }) => {
                        usersData[id] = {
                            email,
                            name,
                            firstname,
                            lastname,
                            id,
                        };
                        Logger.debug("[Mailto]", `Found data for user with ID '${id}'`, usersData[id]);
                    })
                    .catch((e) => {
                        Logger.error("[Mailto]", `Failed to find data for user with ID '${id}'`);
                    });

                // add this promise to the list
                allPromises.push(p);
            }
        }

        // wait for all promises to resolve/fail to ensure the usersData is updated
        Promise.allSettled(allPromises).then(() => {
            Logger.debug("[Mailto]", `Adding the 'send email' button for users with available email...`);
            // for each hyperlink in the page, add the 'send email' button
            for (const { id, node } of allHyperlinks) {
                if (id in usersData && usersData[id].email) {
                    node.insertAdjacentHTML(
                        "beforebegin",
                        `<a href="mailto:${
                            usersData[id].email
                        }"><img style="margin-right:0.25em" src="${chrome.extension.getURL("icons/email.png")}"></a>`
                    );
                }
            }

            // Update cache
            Logger.debug("[Mailto]", `Updating the users cache...`);
            chrome.storage.local.get("users_cache", (result) => {
                const cache = {
                    users_cache: {
                        ...result["users_cache"],
                        ...usersData,
                    },
                };
                chrome.storage.local.set(cache);
                Logger.debug("[Mailto]", `New cache version:`, cache);
            });

            // Add batch email modal
            const template = document.createElement("template");
            template.innerHTML = `<button>CLICK ME</button>`;
            const btn = template.content.firstElementChild;
            btn.addEventListener("click", (ev) => {
                this.attachSendBatchEmailModal(usersData);
            });
            document.querySelector("#colunaextra").appendChild(btn);
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
        /*
         * In general there is a url for FEUP employees (func_geral.formview)
         * and another one for students (fest_geral.cursos_list). The URLs
         * end with a numeric ID
         *
         * There is a third option (vld_entidades_geral.entidade_pagina), which
         * is used for both, e.g., in dissertation list pages, which causes
         * the browser to redirect to one of the aforementioned URLs depending
         * on the user ID being a FEUP employee or a student. The raw response
         * is a very short HTML page with a <meta> tag with attribute
         * `http-equiv refresh` that makes the browser load an URL within some
         * timeout. In Sigarra implementation, they use it to redirect to
         * the employee or student profile view. When using 'fetch', the `meta`
         * tags are not interpreted, and therefore no redirect occurs. In the
         * future, when support for students is added the urls
         * `vld_entidades_geral.entidade_pagina` must be handled individually
         * to find the actual url, wether it is `func_geral.formview` or
         * `fest_geral.cursos_list`. For now, it is enough to get the user ID
         * and use the version `func_geral.formview`. If it is a student ID,
         * the request simply fails and the code skips the user
         */
        const re = /(func_geral\.formview\?p_codigo|vld_entidades_geral\.entidade_pagina\?pct_codigo)=(\d+)/i;
        return Array.prototype.filter
            .call(document.querySelectorAll("a"), ($el) => re.test($el.href))
            .map(($el) => {
                const m = $el.href.match(re);
                return {
                    url: $el.href,
                    id: m[2],
                    node: $el,
                };
            });
    }

    /**
     * Loads the profile information for a given user identified by its ID. The
     * data is loaded from cache, when available. Otherwise, it attempts to
     * parse the Sigarra profile page
     *
     * @param {string|number} userID
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
                    Logger.debug("[Mailto]", `User with ID '${userID}' is cached and email is available.`);
                    resolve(result[userID]);
                } else {
                    // otherwise parse the profile page and cache the results
                    Logger.debug("[Mailto]", `User with ID '${userID}' is not cached. Trying to retrieve the data...`);
                    UserStaffParser.fromURL(`https://sigarra.up.pt/feup/pt/func_geral.formview?p_codigo=${userID}`)
                        .then((userParser) => {
                            // successful
                            const data = userParser.parse();
                            resolve(data);
                        })
                        .catch((e) => {
                            // error, probably because it is a student ID
                            reject(e);
                        });
                }
            });
        });
    }

    attachSendBatchEmailModal(usersData) {
        // the modal div template
        const $modal = createElementFromString(`<div id="sig_emailsModal">
                <div class="sig_modalBody">
                    <h1>SigTools</h1>
                    <p>Select the email recipients</p>
                    <div class="emails-select">
                        <div class="emails-select__field emails-select__field--to">
                            <!-- <div class="user"> -->
                        </div>
                    </div>
                    <div>
                        <button class="send-email">Send email</button>
                    </div>
                </div>
                <div class="sig_overlay"></div>
            </div>`);

        // add users checkboxes to select all recipients and sort by name
        const userCtnr = $modal.querySelector(".emails-select__field--to");
        for (const user of Object.values(usersData).sort((a, b) => a.name.localeCompare(b.name))) {
            const userCheckBox = createElementFromString(`
                <div class="user">
                    <input type="checkbox" id="user-${user.id}">
                    <label for="user-${user.id}">${user.firstname} ${user.lastname}</label>
                </div>
            `);
            userCtnr.append(userCheckBox);
        }

        // add 'click' event in the 'send email' button
        $modal.querySelector(".send-email").addEventListener("click", (e) => {
            const selectedIds = new Set();

            // traverse the user selection checkboxes, if checked, add to the set
            for (const $input of $modal.querySelectorAll(".emails-select__field--to .user input")) {
                if ($input.checked) {
                    const id = $input.id.split("-")[1];
                    selectedIds.add(id);
                }
            }

            // if no selected emails, do not proceed
            if (!selectedIds.size) return;

            // get the emails for the selected emails
            const selectedEmails = Object.keys(usersData)
                .filter((id) => selectedIds.has(id))
                .map((id) => usersData[id].email);

            // build the mailto link
            // format: mailto:<addr1>;<addr2>?&cc=<addr3>&bcc=<addr4>;<addr5>
            const mailto = `mailto:${selectedEmails.join(";")}`;
            window.open(mailto, "_self");
        });

        // add the modal to the DOM
        document.querySelector("head").insertAdjacentElement("beforebegin", $modal);

        // add event listener for clicks outside the modal div to close it
        document.querySelector(".sig_overlay").addEventListener("click", (ev) => {
            $modal.remove();
        });
    }
}

// add an instance to the EXTRACTORS variable, and also trigger attachIfPossible due to constructor
EXTRACTORS.push(new MailTo());
