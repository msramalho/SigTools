"use strict";
//https://developer.chrome.com/extensions/content_scripts#run_at

let template = `
<div class="col-a1 col-b1">
<h1>{{extractor}} format</h1>
<h3>Parameters</h3>
<ul>
    {{#parameters}}
    <li><i>$&#123{{name}}&#123</i> e.g. {{example}}</li>
    {{/parameters}}
</ul>
<h3>Format</h3>
<div class="formatDiv">
    {{#storage.text}}
        <span>{{name}}</span>
        <input class="{{name}}" id="{{extractor}}_{{name}}" type="text" value="{{value}}"/>
    {{/storage.text}}
    {{#storage.textarea}}
        <span>{{name}}</span>
        <textarea class="{{name}}" id="{{extractor}}_{{name}}">{{{value}}}</textarea>
    {{/storage.textarea}}
    {{#storage.boolean}}
        <label><input class="{{name}}" id="{{extractor}}_{{name}}" type="checkbox" value="{{value}}"/>{{name}}</label>
    {{/storage.boolean}}

</div>
</div>`

$(document).ready(function() {
    // generate the extractor options form according to the template
    EXTRACTORS.forEach(ex => {
        console.log(ex.structure);
        $("#settings").append($(Mustache.render(template, ex.structure)))
    });

    // make checkboxes with value="true" be checked
    $("input[type='checkbox'][value='true']").each(function() {
        $(this).prop('checked', true)
    });
});


// read user input into options and save it
function saveChanges() {
    let settings = {}
    EXTRACTORS.forEach(ex => {
        let extractor = ex.structure.extractor;
        settings[extractor] = settings[extractor] ? settings[extractor] : {};
        getProperties(ex.structure.storage).forEach(prop => {
            ex.structure.storage[prop].forEach(option => {
                let input = $(`#${extractor}_${option.name}`) // option input
                let val = input.val() // default is the input value tag

                if (prop == "boolean") // boolean uses checkbox, so val() won't work
                    val = input[0].checked

                // save value
                settings[extractor][option.name] = val
                option.value = settings[extractor][option.name] // save the value in the structure
            });
        });
    });
    // Update chrome.storage
    chrome.storage.local.set(settings);
    chrome.storage.local.get(function(result) {
        console.log(result)
    });

    console.log('Saved!\nPlease, refresh sigarra/moodle pages to apply changes.');
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