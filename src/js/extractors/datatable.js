"use strict";

class TableUtils {
    /**
     * Checks if a table row, `<tr>`, is a header row
     * 
     * @param {*} $tr 
     * @returns {boolean}
     */
    static isHeaderRow($tr) {
        if (!$tr.is('tr'))
            throw Error(`Expected <tr> element. Got ${$tr}`);
        // A table row is considered as header if and only if all cells/children
        // are `<th>`. According to MDN, a `tr` can have as children `td`, `th`
        // and other script related elements, such `<script>` or `<template>`
        // See: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tr#technical_summary

        // Thus the condition below is: number of cells (`td` or `th`) must
        // match the number of header cells. If its not, then at least one cell
        // is `td` and is no longer safe to assume it as a table header
        // Note: we use jQuery 'children' to only search direct children nodes.
        // If the cells are deeper on the tree, it is unexpected behavior
        return $tr.children("th,td").length === $tr.children("th").length;
    }

    /**
     * Finds a sequence of table rows `<tr>` that can be header rows
     * 
     * @param {*} $table 
     * @returns 
     */
    static getHeaderRows($table) {
        // find the first table row (not necessarially the first table children (e.g. <caption>))
        const $firstRow = $table.find("tr").first();
        // if the first table row is a header row, iterate over the sibling table rows while they are headers
        if (TableUtils.isHeaderRow($firstRow)) {
            // iterate over the sibling rows, and collect the header ones
            const $rows = $firstRow.find("~ tr");
            const $headerRows = [$firstRow];
            let foundHeader = true;
            for (let i = 0; i < $rows.length && foundHeader; i++) {
                foundHeader = TableUtils.isHeaderRow($($rows[i]));
                if (foundHeader)
                    $headerRows.push($($rows[i]));
            }
            return $headerRows;
        }
        // first table row is not a header, give up
        return [];
    }
}
class DataTable extends Extractor {
    static dtRootWrapperCls = 'dataTables_wrapper';
    static dtCustomRootWrapperCls = 'SigTools__dt';
    static dtTableWrapperCls = 'SigTools__dt__table';
    static dtTableCls = 'dataTable';

    // options to use in the datatable constructors
    static datatableOptions = {
        paging: false,
        order: [],
        /**
         * Define the table control elements to appear on the page and in what order
         * @see {@link https://datatables.net/reference/option/dom}
         *
         * Moreover, we also use this to wrap around DataTable elements in `div`s with
         * our own class names. This enables us to create CSS rules with more specificity
         * thus overriding the library defaults with more ease
         *
         * 1. A wrapper div with class 'SigTools__dt'
         * 2. B -> the buttons for copying and exporting table data
         * 3. f -> filter inputs (search box)
         * 4. r -> show a loading indicator (see: https://datatables.net/reference/option/processing)
         * 5. t -> the table itself with class 'SigTools__dt__table'
         * 6. i -> information summary
         * 7. p -> pagination control
         */
        dom: `<"${DataTable.dtCustomRootWrapperCls}"Bfr<"${DataTable.dtTableWrapperCls}"t>i>`,
        buttons: ['copyHtml5', 'print', {
            extend: 'csvHtml5',
            charset: 'UTF-8',
            bom: true
        }, {
                extend: 'excelHtml5',
                charset: 'UTF-8',
                bom: true
            }
        ],
    }

    /**
     * 
     * @param {*} $table The <table> jQuery element where DataTable is applied
     * @returns The top root node created by DataTable that wraps table among filter/sorting inputs
     */
    static getWrapper($table) {
        return $table.parents(`.${DataTable.dtRootWrapperCls}`);
    }

    constructor() {
        super();
        this.loading = false; // indicates when there is an ongoing ajax request
        this.ready();
    }

    structure() {
        return {
            extractor: "datatable",
            name: "Datatable",
            description: "Makes tables that are typically static become sortable, searchable and exportable in copy-paste, csv, excel and print mode",
            icon: "datatable.png",
            parameters: [],
            storage: {
                boolean: [{
                    name: "disable_one_row",
                    default: true
                }],
                text: [{
                    name: "exclude_urls_csv",
                    default: "coop_candidatura_geral.editar_candidatura,ucurr_geral.ficha_uc_view,func_geral.formview,fest_geral.cursos_list,vig_geral.docentes_vigilancias_list"
                }]
            }
        }
    }

    attachIfPossible() {
        $("table.dados,table.dadossz,table.tabela:has( tr.i)")
            .each((_, t) => this.attachTableIfPossible($(t)));
    }

    attachTableIfPossible($table) {
        // clone table
        // in case the DataTable fails, any DOM manipulation due our pre-processing
        // or initial work of DataTable lib does not affect the original table
        // if the attaching the DataTable is OK, then we just need to update the DOM
        // once per table, which is also more efficient
        const $dtTable = $($table).clone(true);
        //const $dt = $table;

        // validate table based on user settings for minimum number of rows
        if (!this.validTable($dtTable))
            return;

        // remove DOM elements related to sorting
        $("#ordenacao").remove();
        $dtTable.find("th a").remove();

        // make the necessary transformations to the tables to make DataTable work
        this.preprocessTable($dtTable);

        try {
            // try to apply the DataTable
            $dtTable.dataTable(DataTable.datatableOptions);
            const $wrapper = DataTable.getWrapper($dtTable);

            // success, replace original table
            $table.replaceWith($wrapper);

            // inject dynamic tables title
            $wrapper.before(
                $(`<h2 class="noBorder">SigTools Dynamic Tables</h2>`)
            );
        } catch (e) {
            console.warn('Failed to apply DataTable in', $table[0]);
        }
    }

    /**
     * Check if the current table is valid for applying datatables
     */
    validTable($table) {
        // if table nested inside another table, abort
        if ($table.find('table').length !== 0)
            return false;

        const numHeadersRows = TableUtils.getHeaderRows($table).length;
        const numDataRows = $table.find("tr").toArray().length - numHeadersRows;

        return !this.disable_one_row || numDataRows > 1;
    }

    /**
     * Attempts to transform the tables to make them work with DataTable lib
     * @param {*} $table 
     */
    preprocessTable($table) {
        // transform the table if it is the erasmus listing page
        this.transformErasmus($table);

        // add <thead> if missing, required by DataTable lib
        this.transformAddTableHeader($table);

        // detects possible footers and wraps in <tfoot>
        this.transformAddFooter($table);
    }

    /**
     * Fix table for the erasmus listings page
     * @param {Table} table
     */
    transformErasmus(table) {
        if (this.url.includes("coop_candidatura_geral.ver_colocacoes_aluno")) {
            $(table.find("tr:first-child th[colspan=2]").replaceWith(table.find("tr:nth-child(2)").html()))
            table.find("tr:nth-child(2)").remove()
            table.find('th[rowspan=2]').attr('rowspan', '1');
        }
    }

    /**
     * If <thead> is missing, then it searches for candidate table header rows
     * and moves them to a new <thead> tag
     * @param {*} $table 
     */
    transformAddTableHeader($table) {
        if ($table.has("thead").length === 0) {
            // try to find consecutive header rows
            const headers = TableUtils.getHeaderRows($table);

            // if no rows are found, then table is not valid
            if (headers.length === 0)
                return false;

            // create <thead> and add it at the beginning
            const $thead = $("<thead>");
            $table.prepend($thead);

            // move each found header row to <thead>
            for (const $tr of headers) {
                // remove the row from the original place in the DOM
                $tr.remove();
                // append the row to the header
                $thead.append($tr);
            }

        }
    }

    /**
     * Attempts to extract footers to support more datatables
     * 
     * Some tables have as a last row a 'total' or similar value. In general,
     * this is a summary of the data in the table, and therefore it shouldn't be
     * part of the body and sorting mechanisms. Moreover, its quite often that
     * this last row has just two or so columns ( | Total: | < value > |), while
     * the body has more columns, thus DataTable will fail.
     * 
     * This method is a conservative approach to extract the last row and wrap it
     * in <tfoot>. It relies in:
     * (1) - Last row has a class 'totais'. Examples can be found in courses 
     * information page, e.g. https://sigarra.up.pt/feup/pt/ucurr_geral.ficha_uc_view?pv_ocorrencia_id=459523,
     * list of thesis proposals (ESTAGIOS_ALUNOS.LISTA_EMPRESAS),  
     * @param {*} $table 
     * @returns 
     */
    transformAddFooter($table) {
        // if table has no explicit thead, abort
        if ($table.children('thead').length === 0)
            return;

        let $bodyRows = $table.children('tbody').length ? $table.find('tbody > tr') : $table.find(' > tr');

        const $lastRow = $($bodyRows[$bodyRows.length - 1]);

        if ($lastRow.hasClass('totais')) {
            $lastRow.remove();
            $table.append($("<tfoot>").append($lastRow));
        }
    }
}

/**
 * if a datatable exists, remove it and return a callback to apply it again
 * @param {string} selector
 */
function removeDatatableIfExists(selector) {
    if ($.fn.dataTable.isDataTable(selector)) {
        let table = $(selector).DataTable()
        table.destroy()
        return el => el.dataTable(DataTable.datatableOptions)
    }
    return (_) => { }
}

// add an instance to the EXTRACTORS variable, and also trigger attachIfPossible due to constructor
EXTRACTORS.push(new DataTable());