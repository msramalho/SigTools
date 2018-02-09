// set some initial values for formats
chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.local.set({
        "moodle_title": "${event.name} (${event.type})",
        "moodle_desc": "Link: ${event.url}",
        "class_title": "",
        "class_desc": "",
        "exam_title":"",
        "exam_desc": ""
    });
})
