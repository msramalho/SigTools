// set some initial values for formats
chrome.runtime.onInstalled(function () {
    chrome.storage.local.set({
        "moodle_title": "",
        "moodle_desc": "",
        "class_title": "",
        "class_desc": "",
        "exam_title":"",
        "exam_desc": ""
    });
})
