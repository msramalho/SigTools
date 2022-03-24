/**
 * Attaches a SigTools box in Sigarra's right-side sidebar. If the sidebar does
 * not exist it creates one.
 *
 * This class is a singleton to ensure it can be used in multiple contexts, but
 * always operates in the same box DOM. It provides an interface to add elements
 * and ensure consistency
 */
class SigarraSidebar {
    $attachedBox = null;
    constructor() {
        if (SigarraSidebar._instance) return SigarraSidebar._instance;

        SigarraSidebar._instance = this;

        return this;
    }

    /**
     * Tries to attach a box for SigTools in the Sigarra's right-side sidebar.
     * If the box is already attached, it returns the reference to that element,
     * ensuring there is only one box for SigTools
     *
     * @returns {HTMLElement} Returns the `<div>` element for SigTools box
     */
    _attachBoxInSidebar() {
        // if the SigTools already attached to the sidebar, return it
        if (this.$attachedBox) return this.$attachedBox;

        // get the root element for the right-side sidebar in Sigarra
        // if it does not exist, create it
        let $sidebar =
            document.querySelector("#colunaextra") ||
            document
                .querySelector("#colunaprincipal")
                .insertAdjacentElement("afterend", createElementFromString('<div id="colunaextra"></div>'));

        // create a sidebar box with a header and content
        // the first content box is for hyperlinks list items, for consistency with Sigarra style
        const $box = createElementFromString(`
            <div class="caixa-opcoes" style="user-select:none;">
                <div class="caixa-opcoes-cabecalho" style="display:flex;align-items:center;">
                    <span>SigTools</span>
                    <img style="width:24px;" src="${chrome.extension.getURL("icons/icon-48.png")}">
                </div>
                <div class="caixa-opcoes-conteudo">
                    <ul></ul>
                </div>
            </div>
        `);

        $sidebar.insertAdjacentElement("afterbegin", $box);
        this.$attachedBox = $box;
        return $box;
    }

    /**
     * Adds a new menu entry to SigTool box in Sigarra's sidebar
     * Each menu entry, similar to Sigarra style, is just an hyperlink with
     * plain text
     * @param {string} text The item text
     * @param {string?} iconURL An optional icon url
     * @returns {HTMLElement} The menu entry hyperlink element, i.e., <a>,
     * so that you can add event listeners to perform some action on click
     */
    addItem(text, iconURL) {
        // attach box to sidebar if does not exist yet
        const $box = this._attachBoxInSidebar();
        if ($box === null) return null;

        const $list = $box.querySelector("ul");
        const $item = createElementFromString(
            `<li>
                <a style="cursor: pointer;">${
                    iconURL ? `<img src="${iconURL}" style="margin-right:0.25em">` : ""
                }${text}</a>
            </li>`
        );
        $item.style.listStyle = "disc";
        $list.append($item);
        return $item.querySelector("a");
    }
}
