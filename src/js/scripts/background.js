/**
 * Display changelog when installed or updated
 */
chrome.runtime.onInstalled.addListener(function(details) {
    // https://developer.chrome.com/extensions/runtime#type-OnInstalledReason
    if(details.reason === "update" || details.reason === "install")
        chrome.tabs.create({
            url: chrome.extension.getURL("changelog.html")
        });
});