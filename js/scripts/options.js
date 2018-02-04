"use strict";
//https://developer.chrome.com/extensions/content_scripts#run_at

function loadFormats() {

    chrome.storage.local.get("moodle_title", function(obj) {
        console.log(obj);
        if(obj != undefined) {
            document.getElementById("moodle_title").value = obj.moodle_title;
        }
    });

    chrome.storage.local.get("moodle_desc", function(obj) {
        console.log(obj);
        if(obj != undefined) {
            document.getElementById("moodle_desc").value = obj.moodle_desc;
        }
    });
    
    
}

function saveFormats() {
    console.log("wuuuuuuut");
    var moodle_desc = document.getElementById("moodle_desc").value;
    var moodle_title = document.getElementById("moodle_title").value;

    chrome.storage.local.set({'moodle_desc': moodle_desc});
    chrome.storage.local.set({'moodle_title': moodle_title});
}

// add onclick event for button
document.getElementById("btn_save").addEventListener("onclick", saveFormats);

// load formats
loadFormats();