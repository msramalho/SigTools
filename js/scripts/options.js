"use strict";
//https://developer.chrome.com/extensions/content_scripts#run_at

class stringFormats {
    constructor() {

        chrome.storage.local.get(null, (obj) => {
            this.moodle_title = obj.moodle_title;
            this.moodle_desc = obj.moodle_desc;
            this.exam_title = obj.exam_title;
            this.exam_desc = obj.exam_desc;
            this.class_title = obj.class_title;
            this.class_desc = obj.class_desc;
            this.isHTML = obj.isHTML;
            
            // load stuff
            $("#moodle_title").val(this.moodle_title);
            $("#moodle_desc").val(this.moodle_desc);
            $("#exam_title").val(this.exam_title);
            $("#exam_desc").val(this.exam_desc);
            $("#class_title").val(this.class_title);
            $("#class_desc").val(this.class_desc);
            $("#chkbox_html").attr("checked", this.isHTML);
        });
    }

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

    //
    // Getters
    //
    get moodleTitle() {
        return this.moodle_title;
    }

    get moodleDescription() {
        return this.moodle_desc;
    }

    //
    // Setters
    //
    set moodleTitle(title) {
        this.moodle_title = title;
    }

    set moodleDescription(desc) {
        this.moodle_desc = desc;
    }

    set classTitle(title) {
        this.class_title = title;
    }

    set classDescription(desc) {
        this.class_desc = desc;
    }

    set examTitle(title) {
        this.exam_title = title;
    }

    set examDescription(desc) {
        this.exam_desc = desc;
    }
}

var options = new stringFormats();

// add onclick event for 'Save' button
$("#btn_save").click(function() {
    // Load text from HTML elements and store on object
    options.moodleTitle = $("#moodle_title").val();
    options.moodleDescription = $("#moodle_desc").val();
    options.classTitle = $("#class_title").val();
    options.classDescription = $("#class_desc").val();
    options.examTitle = $("#exam_title").val();
    options.examDescription = $("#exam_desc").val();
    options.isHTML = document.querySelector("#chkbox_html").checked;

    // Update chrome.storage
    options.saveFormats();
});