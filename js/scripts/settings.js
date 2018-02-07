function asyncGetMoodleTitle() {
    return new Promise(
        function (resolve, reject) {
            chrome.storage.local.get(null, (obj) => {                
                resolve(obj.moodle_title === undefined ? "%name% (%type%)" : obj.moodle_title);
            });
        }
    )
}

function asyncGetMoodleDescription() {
    return new Promise(
        function (resolve, reject) {
            chrome.storage.local.get(null, (obj) => {                
                resolve(obj.moodle_desc === undefined ? "%name% (%type%)" : obj.moodle_desc);
            });
        }
    )
}

function asyncGetExamsTitle() {
    return new Promise(
        function (resolve, reject) {
            chrome.storage.local.get(null, (obj) => {                
                resolve(obj.exam_title === undefined ? "%name% (%type%)" : obj.exam_title);
            });
        }
    )
}

function asyncGetExamsDescription() {
    return new Promise(
        function (resolve, reject) {
            chrome.storage.local.get(null, (obj) => {                
                resolve(obj.exam_desc === undefined ? "%name% (%type%)" : obj.exam_desc);
            });
        }
    )
}

function asyncGetClassTitle() {
    return new Promise(
        function (resolve, reject) {
            chrome.storage.local.get(null, (obj) => {                
                resolve(obj.class_title === undefined ? "%name% (%type%)" : obj.class_title);
            });
        }
    )
}

function asyncGetClassDescription() {
    return new Promise(
        function (resolve, reject) {
            chrome.storage.local.get(null, (obj) => {                
                resolve(obj.class_desc === undefined ? "%name% (%type%)" : obj.class_desc);
            });
        }
    )
}