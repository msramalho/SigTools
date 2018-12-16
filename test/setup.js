/**
 * maps the HTML from the given url into the current context of jquery selectors $("...")
 * @param {URI} url
 */
function updatejQueryContext(url) {
    return $.get(url, function(html) {
        jQuery.noConflict();
        $ = function(selector, _) {
            return new jQuery.fn.init(selector, new DOMParser().parseFromString(html, 'text/html'));
        };
        $.fn = $.prototype = jQuery.fn;
        jQuery.extend($, jQuery);
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