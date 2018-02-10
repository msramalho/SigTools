"use strict";
//https://developer.chrome.com/extensions/content_scripts#run_at

class stringFormats {
    constructor() {

        chrome.storage.local.get(null, (obj) => {
            console.log(obj);
            
            this.moodle_title = obj.moodle_title;
            this.moodle_desc = obj.moodle_desc;
            this.exam_title = obj.exam_title;
            this.exam_desc = obj.exam_desc;
            this.class_title = obj.class_title;
            this.class_desc = obj.class_desc;
            // load stuff
            $("#moodle_title").val(this.moodle_title);
            $("#moodle_desc").val(this.moodle_desc);
            $("#exam_title").val(this.exam_title);
            $("#exam_desc").val(this.exam_desc);
            $("#class_title").val(this.class_title);
            $("#class_desc").val(this.class_desc);
        });
    }

    saveFormats() {   
        console.log(this.moodle_desc);
        var settings = {
            moodle_desc: this.moodle_desc,
            moodle_title: this.moodle_title
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
}

var options = new stringFormats();
// add onclick event for 'Save' button
$("#btn_save").click(function() {
    // Load text from HTML elements
    var m_title = $("#moodle_title").val();
    var m_desc = $("#moodle_desc").val();

    // Update class fields
    options.moodleTitle = m_title;
    options.moodleDescription = m_desc;
    console.log(options);

    // Update chrome.storage
    options.saveFormats();
});