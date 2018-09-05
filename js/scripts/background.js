/**
 * Display changelog when installed or updated
 */
chrome.runtime.onInstalled.addListener(function(object) {
    chrome.tabs.create({
        url: chrome.extension.getURL("changelog.html")
    });
});