// set some initial values for formats
// https://developer.chrome.com/apps/runtime#event-onInstalled

let DEFAULT_OPTIONS = {
    moodle_title: "${name}",
    moodle_desc: "Type:${type}\nLink:${url}",
    class_title: "[${acronym}] - ${type} - ${room.name}",
    class_desc: "Room:${room.name}\nTeacher(s):${teacher.name} (${teacher.acronym})\nClass:${class.name}",
    exam_title: "Exam [${subject.acronym}] - ${location}",
    exam_desc: "Exam: ${subject.name} [${subject.acronym}]\nExam page:${subject.url}\nInformation:${event.info}",
    isHTML: false
};

chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.local.get(null, (obj) => {
        // use default values if none are set
        if (Object.keys(obj).length != DEFAULT_OPTIONS.length)
            chrome.storage.local.set(DEFAULT_OPTIONS);
    });
})