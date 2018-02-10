// set some initial values for formats
// https://developer.chrome.com/apps/runtime#event-onInstalled
chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.local.get(null, (obj) => {             
        if(Object.keys(obj).length != 6) { // set default values
            chrome.storage.local.set({
                moodle_title: "${name}",
                moodle_desc: "Type:${type}\nLink:${url}",
                class_title: "[${acronym}] - ${type} - ${room.name}",
                class_desc: "Room:${room.name}\nTeacher(s):${teacher.name} (${teacher.acronym})\nClass:${class.name}",
                exam_title:"Exam [${subject.acronym}] - ${location}",
                exam_desc: "Exam: ${subject.name} [${subject.acronym}]\nExam page:${subject.url}\nInformation:${event.info}"
            });
        } 
    });
})
