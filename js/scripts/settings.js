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

function asyncGetClass() {
    return new Promise(
        function (resolve, reject) {
            chrome.storage.local.get(null, (obj) => {                
                resolve({
                    title: obj.class_title,
                    desc: obj.class_desc,
                    isHTML: obj.isHTML
                });
            });
        }
    )
}