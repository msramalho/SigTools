"use strict";
//https://developer.chrome.com/extensions/content_scripts#run_at

/**
 * Class to hold the user settings regarding the output format
 */
class stringFormats {
    constructor() {
        // read from the local storage
        chrome.storage.local.get(null, (obj) => {
            this.moodle_title = obj.moodle_title;
            this.moodle_desc = obj.moodle_desc;
            this.exam_title = obj.exam_title;
            this.exam_desc = obj.exam_desc;
            this.class_title = obj.class_title;
            this.class_desc = obj.class_desc;
            this.isHTML = obj.isHTML;

            // load variables into current object
            $("#moodle_title").val(this.moodle_title);
            $("#moodle_desc").val(this.moodle_desc);
            $("#exam_title").val(this.exam_title);
            $("#exam_desc").val(this.exam_desc);
            $("#class_title").val(this.class_title);
            $("#class_desc").val(this.class_desc);
            $("#checkbox_html").attr("checked", this.isHTML);
        });
    }

    // commit the changes into local storage
    saveFormats() {
        var settings = {
            moodle_desc: this.moodle_desc,
            moodle_title: this.moodle_title,
            exam_title: this.exam_title,
            exam_desc: this.exam_desc,
            class_title: this.class_title,
            class_desc: this.class_desc,
            isHTML: this.isHTML
        }
        chrome.storage.local.set(settings);
    }
}

var options = new stringFormats();

// read user input into options and save it
function saveChanges() {
    // Load text from HTML elements and store on object
    options.moodle_title = $("#moodle_title").val();
    options.moodle_desc = $("#moodle_desc").val();
    options.class_title = $("#class_title").val();
    options.class_desc = $("#class_desc").val();
    options.exam_title = $("#exam_title").val();
    options.exam_desc = $("#exam_desc").val();
    options.isHTML = document.querySelector("#checkbox_html").checked;

    // Update chrome.storage
    options.saveFormats();
    alert('Saved!\nPlease, refresh sigarra/moodle pages to apply changes.');
}
// add onclick event for 'Save' button
$("#btn_save").click(saveChanges);

// intercept ctrl+s to save options
$(window).bind('keydown', function(event) {
    if ((event.ctrlKey || event.metaKey) && String.fromCharCode(event.which).toLowerCase() == 's') {
        event.preventDefault();
        saveChanges();
    }
});