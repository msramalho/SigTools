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

function asyncGetExam() {
    return new Promise(
        function (resolve, reject) {
            chrome.storage.local.get(null, (obj) => {
                resolve({
                    title: obj.exam_title,
                    desc: obj.exam_desc,
                    isHTML: obj.isHTML
                });
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