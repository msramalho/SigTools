/**
 * maps the HTML from the given url into the current context of jquery selectors $("...")
 * @param {URI} url
 */
function updatejQueryContext(url) {
    url = `http://0.0.0.0:3000/${url}`;
    return new Promise((resolve) => {
        $.get(url, function(html) {
            jQuery.noConflict();
            $ = function(selector, context) {
                return new jQuery.fn.init(selector, context || new DOMParser().parseFromString(html, 'text/html'));
            };
            $.fn = $.prototype = jQuery.fn;
            jQuery.extend($, jQuery);
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