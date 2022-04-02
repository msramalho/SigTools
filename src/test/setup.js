/**
 * maps the HTML from the given url into the current context of jquery selectors $("...")
 * @param {URI} url Relative URL to `src/test/pages/`. Ensure you do not add the first `/`,
 * e.g. `conta_corrente.html` is correct, but `/conta_corrente.html` is not
 */
function updatejQueryContext(url) {
    url = `http://0.0.0.0:3000/test/pages/${url}`;
    return new Promise((resolve) => {
        $.get(url, function(html) {
            jQuery.noConflict();
            const dom = new DOMParser().parseFromString(html, 'text/html');
            $ = function(selector, context) {
                return new jQuery.fn.init(selector, context || dom);
            };
            $.fn = $.prototype = jQuery.fn;
            jQuery.extend($, jQuery);

            Sig.doc = dom;
            resolve();
        })
    });
}

// Mocks the existence of a chrome storage
chrome = {
    storage: {
        local: {
            set: () => {},
            get: () => {}
        }
    }
}

// Alias for chai.expect as expect, since we cannot do modules
expect = chai.expect
should = chai.should() // actually call the function