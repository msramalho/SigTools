"use strict";

class InfiniteScroll extends Extractor {

    constructor() {
        super();
        // a loading gif to show when fetching new pages
        this.loadingGif = $(
            `<img class="sigLoading" src="${chrome.extension.getURL("icons/loading.gif")}">`
        );
        this.loading = false // indicates when there is an ongoing ajax request
        this.ready();
    }

    structure() {
        return {
            extractor: "infinite_scroll",
            name: "Infinite Scroll",
            description: "Makes annoying pagination in sigarra tables be in infinite scroll mode",
            icon: "infinite-scroll.png",
            parameters: [],
            storage: {}
        }
    }


    attachIfPossible() {
        // Note: perform query here instead of constructor to ensure this is
        // executed only after the DataTable extractor finishes manipulating the dom
        // That is ensured as long content scripts are loaded in this sequence:
        // Datatable, Infinite Scroll, others ...
        // Recall that all Extractor constructors invoke 'this.ready()' which
        // will enqueue jobs in the Promisses Queue Job, which eventually will
        // invoke attachIfPossible. Thus, DataTable promisse jobs execute before
        // infinite scroll, as desired
        this.table = $(this.selector = "table.dados");
        if (!this.table) this.table = $(this.selector = "table.dadossz");

        // return if table not found or not applied
        if (!this.table.length || !this.validTable()) return

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
     * logic and ui starting loading process
     */
    showLoading() {
        this.table.after(this.loadingGif)
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
        let m = $("p.paginar-registos").text().match(/(\d+) a (\d+) de (\d+)/) // regex on "Registos de (m[1]) a (m[2]) de (m[3])"
        let npages = Math.round(m[3] / (m[2] - m[1] + 1)) // how many pages in total
        try {
            let page = $(".paginar-paginas-posteriores a").toArray()[0].href // get the url of page 2
            let startPage = /pv_num_pag=(\d+)/gm.exec(page)[1]
            for (let i = startPage; i <= npages; i++) this.pages.push(page.replace(/(.*pv_num_pag=)\d+(.*)/gm, `$1${i}$2`))
        } catch (error) { }
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
                // gather all <tr> nodes                
                const rows = $(res).find(`${this.selector} tr.i, ${this.selector} tr.p`).toArray();
                // get the instantiated data table and append the new rows
                // note: you can pass <tr> directly
                // note: 'draw' is necessary to update the DOM
                $(this.selector).dataTable().api().rows.add(rows).draw();
                // hide the loading gif
                this.hideLoading();
            },
            fail: () => this.hideLoading()
        });
    }
}

// add an instance to the EXTRACTORS variable, and also trigger attachIfPossible due to constructor
EXTRACTORS.push(new InfiniteScroll());