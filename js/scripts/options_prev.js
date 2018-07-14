"use strict";
//https://developer.chrome.com/extensions/content_scripts#run_at

let nav_tab_list_template = `
<a class="nav-link" id="nav-tab-{{extractor}}" data-toggle="pill" href="#nav-tab-content-{{extractor}}" role="tab" aria-controls="nav-tab-content-{{extractor}}" aria-selected="false">{{extractor}}</a>
`

let nav_tab_content_template = `
<div class="tab-pane fade" id="nav-tab-content-{{extractor}}" role="tabpanel" aria-labelledby="nav-tab-{{extractor}}">
<p>{{description}}</p>
<h5>Parameters</h5>
<ul>
    {{#parameters}}
    <li><strong class="parameter-code"><code>$&#123{{name}}&#125</code></strong> {{description}}</li>
    {{/parameters}}
</ul>
<h5>Format</h5>
<div class="formatDiv">
    {{#storage.text}}
        <div class="input-group input-group-sm mb-3">
            <div class="input-group-prepend">
                <span class="input-group-text">{{name}}</span>
            </div>
            <input class="form-control {{name}}" id="{{extractor}}_{{name}}" type="text" value="{{value}}">
        </div>
    {{/storage.text}}
    {{#storage.textarea}}
        <div class="input-group input-group-sm mb-3">
            <div class="input-group-prepend">
                <span class="input-group-text">{{name}}</span>
            </div>
            <textarea class="form-control" id="{{extractor}}_{{name}}">{{{value}}}</textarea>
        </div>
    {{/storage.textarea}}
    {{#storage.color}}
        <label><input class="{{name}}" id="{{extractor}}_{{name}}" type="color" value="{{value}}"/>{{name}}</label>
    {{/storage.color}}
    {{#storage.boolean}}
        <div class="custom-control custom-checkbox">
            <input class="custom-control-input {{name}}" id="{{extractor}}_{{name}}" type="checkbox" value="{{value}}">
            <label class="custom-control-label" for="{{extractor}}_{{name}}">{{name}}</label>
        </div>
    {{/storage.boolean}}
</div>
</div>
`

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

    alert('Saved!\nPlease, refresh the corresponding pages to apply the changes.');
}

$(document).ready(function() {
    // generate the extractor options form according to the template
    EXTRACTORS.forEach(ex => {
        // add a tab for each extractor
        $("#nav-tab-list").append($(Mustache.render(nav_tab_list_template, ex.structure)));

        // add tab's content
        $("#nav-tab-content").append($(Mustache.render(nav_tab_content_template, ex.structure)));
    });

    // make checkboxes with value="true" be checked
    $("input[type='checkbox'][value='true']").each(function() {
        $(this).prop('checked', true)
    });

    // add onclick event for 'Save' button
    $("#btn_save").click(saveChanges);

    // intercept ctrl+s to save options
    $(window).bind('keydown', function(event) {
        if ((event.ctrlKey || event.metaKey) && String.fromCharCode(event.which).toLowerCase() == 's') {
            event.preventDefault();
            saveChanges();
        }
    });
});