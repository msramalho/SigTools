function asyncGetMoodle() {
    return new Promise(
        function (resolve, reject) {
            chrome.storage.local.get(null, (obj) => {                
                resolve({
                    title: obj.moodle_title,
                    desc: obj.moodle_desc,
                    isHTML: obj.isHTML
                });
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

function asyncGetIsHTML() {
    return new Promise(
        function (resolve, reject) {
            chrome.storage.local.get(null, (obj) => {                
                resolve(obj.isHTML);
            });
        }
    )
}