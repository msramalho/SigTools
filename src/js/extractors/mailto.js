"use strict";
/**
 * The base extractor that works as an interface for the other interfaces
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
        for (const t of this.getProfileHyperlinks()) {
            this.getEmail(t.id).then(email => {
                if (email)
                    t.node.insertAdjacentHTML(
                        "beforebegin",
                        `<a href="mailto:${email}"><img style="margin-right:0.25em" src="${chrome.extension.getURL("icons/email.png")}"></a>`
                    );
            });
        }
    }

    /**
     *
     * @returns {{
     *  url: string,
     *  id: string,
     *  node: HTMLElement
     * }[]}
     */
    getProfileHyperlinks() {
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

    getEmail(profileID) {
        return UserStaffParser
            .fromURL(`https://sigarra.up.pt/feup/pt/func_geral.formview?p_codigo=${profileID}`)
            .then((userParser) => {
                const data = userParser.parse();
                return data.email;
            });
    }
}

// add an instance to the EXTRACTORS variable, and also trigger attachIfPossible due to constructor
EXTRACTORS.push(new MailTo());