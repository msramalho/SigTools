"use strict";

class InfiniteScroll extends Extractor {

    constructor() {
        super();
        this.table = $("table.dados");
        this.loading = false // indicates when there is an ongoing ajax request
        this.ready();
    }

    structure() {
        return {
            extractor: "infinite_scroll",
            description: "Makes annoying pagination in sigarra tables be in infinite scroll mode",
            // parameters: [],
            storage: {
                boolean: [{
                    name: "apply",
                    default: true
                }]
            }
        }
    }


    attachIfPossible() {
        // return if table not found or not applied
        if (!this.apply) return console.info("Infinite scroll not applied. To apply go to options. ")
        if (!this.table.length || !this.validTable()) return

        this.setUpLoading()
        this.readPagination()
        this.setScrollListener()
    }

    /**
     * Check if the current table is valid for applying infinite scroll
     */
    validTable() {
        let cols = this.table.find("tr:has(> th)").find("th").toArray().length
        let first = this.table.find("tr:has(> td)").eq(0).find("td").toArray().length
        return cols == first && $(".paginar").length
    }

    /**
     * inject the loading gif and load into own object
     */
    setUpLoading() {
        this.loadingGif = $(`<img class="sigLoading" src="${chrome.extension.getURL("icons/loading.gif")}">`)
        this.table.after(this.loadingGif)
        this.hideLoading()
    }

    /**
     * logic and ui starting loading process
     */
    showLoading() {
        this.loading = true
        this.loadingGif.show()
    }

    /**
     * logic and ui stoping loading process
     */
    hideLoading() {
        this.loadingGif.hide()
        this.loading = false
    }

    /**
     * extracts the pagination information from the page, if available and saves it to this.pages
     * to extract from the this.pages queue, simply this.pages.shift() (for small queues as O(n))
     */
    readPagination() {
        this.pages = []
        $(".paginar-paginas-posteriores a").toArray().forEach(a => this.pages.push($(a)[0].href))
        $(".paginar").remove()
    }

    /**
     * Creates a scroll listener that triggers loadNextPage when the user scrolls to the end of the page
     */
    setScrollListener() {
        window.onscroll = () => {
            if (Math.ceil(window.innerHeight + window.pageYOffset) >= document.body.offsetHeight)
                this.loadNextPage()
        };
    }

    /**
     * while there are next pages to expand, make ajax requests and inject the new data into the table
     */
    loadNextPage() {
        if (this.pages.length == 0 || this.loading) return
        this.showLoading()
        $.ajax({
            url: this.pages.shift(),
            type: 'GET',
            success: (res) => {
                let callback = removeDatatableIfExists("table.dados")
                // read the important rows from the result and append to current table
                let rows = $(res).find("table.dados tr.i, table.dados tr.p").toArray().map(x => x.outerHTML).join("")
                this.table.find("tbody").append(rows)
                this.hideLoading()

                // apply the callback, will only execute anything if there was a table
                callback($('table.dados'))
            },
            fail: () => this.hideLoading()
        });
    }
}

// add an instance to the EXTRACTORS variable, and also trigger attachIfPossible due to constructor
EXTRACTORS.push(new InfiniteScroll());