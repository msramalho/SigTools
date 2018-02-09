// set some initial values for formats
chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.local.get(null, (obj) => {                
        if(Object(obj).keys.length == 0) { // set default values
            chrome.storage.local.set({
                "moodle_title": "${name} (${type})",
                "moodle_desc": "Link: ${url}",
                "class_title": "[${acronym}] - ${type} - ${room.name}",
                "class_desc": "Room:${room.name}\nATeacher(s):${teacher.name} (${teacher.acronym})\nClass:${class.name}",
                "exam_title":"[${subject.acronym}] - ${location}",
                "exam_desc": "Exam ${subject.name} [${subject.acronym}]\n\nAExam page:${subject.url}\n${event.info}"
            });
        } 
    });
})
