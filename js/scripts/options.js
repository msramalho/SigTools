"use strict";
//https://developer.chrome.com/extensions/content_scripts#run_at

let nav_tab_list_template = `
<a class="nav-link rounded-0" id="nav-tab-{{extractor}}" data-toggle="pill" href="#nav-tab-content-{{extractor}}" role="tab" aria-controls="nav-tab-content-{{extractor}}" aria-selected="false">{{extractor}}</a>
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
<div>
    {{#storage.text}}
        <div class="input-group input-group-sm mb-3">
            <div class="input-group-prepend"><span class="input-group-text">{{name}}</span></div>
            <input class="form-control {{name}}" id="{{extractor}}_{{name}}" type="text" value="{{value}}">
            <div class="input-group-append"><button class="btn btn-outline-secondary" type="button" data-extractor="{{extractor}}" data-name="{{name}}" data-default-btn>↺</button></div>
        </div>
    {{/storage.text}}
    {{#storage.textarea}}
        <div class="input-group input-group-sm mb-3">
            <div class="input-group-prepend">
                <span class="input-group-text">{{name}}</span>
            </div>
            <textarea class="form-control" id="{{extractor}}_{{name}}">{{{value}}}</textarea>
            <div class="input-group-append"><button class="btn btn-outline-secondary" type="button" data-extractor="{{extractor}}" data-name="{{name}}" data-default-btn>↺</button></div>
        </div>
    {{/storage.textarea}}
    {{#storage.color}}
        <label>
            <input class="{{name}}" id="{{extractor}}_{{name}}" type="color" value="{{value}}"/>
            {{name}}
            <button class="btn btn-outline-secondary btn-sm" type="button" data-extractor="{{extractor}}" data-name="{{name}}" data-default-btn>↺</button>
        </label>
    {{/storage.color}}
    {{#storage.boolean}}
        <div class="custom-control custom-checkbox">
            <input class="custom-control-input {{name}}" id="{{extractor}}_{{name}}" type="checkbox" value="{{value}}">
            <label class="custom-control-label" for="{{extractor}}_{{name}}">{{name}}</label>
            <button class="btn btn-outline-secondary btn-sm" type="button" data-extractor="{{extractor}}" data-name="{{name}}" data-default-btn>↺</button>
        </div>
    {{/storage.boolean}}
</div>
</div>
`
let haveSettingsChanged = false;
let previousFocusedInput;

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

    // Disable button and reset flag
    haveSettingsChanged = false;
    $('#btn_save').prop('disabled', true);

    // Show confirmation
    alert('Saved!\nPlease, refresh the corresponding pages to apply the changes.');
}

/**
 * Click event handler for default buttons inline with input elements
 * @param {*} event An instance of Event interface
 */
function setDefaultOption(event) {
    var extractor = event.target.getAttribute("data-extractor");
    var name = event.target.getAttribute("data-name");

    EXTRACTORS.forEach(ex => {
        if (ex.structure.extractor === extractor) {
            // found extractor
            getProperties(ex.structure.storage).forEach(prop => {
                ex.structure.storage[prop].forEach(option => {
                    if (option.name === name) {
                        // found the storage option to set to default

                        // update input value
                        var id = '#' + extractor + '_' + name;
                        if (prop === "boolean")
                            // for checkbox and radiobuttons
                            $(id).prop('checked', option.default);
                        else
                            // for other elements
                            $(id).prop('value', option.default);

                        // enable save button
                        haveSettingsChanged = true;
                        $("#btn_save").prop('disabled', false);

                        // break iteration
                        return;
                    }
                });
            });
        }
    });
}

$(document).ready(function () {
    // generate the extractor options form according to the template
    EXTRACTORS.forEach(ex => {
        // add a tab for each extractor
        $('#nav-tab-list').append($(Mustache.render(nav_tab_list_template, ex.structure)));

        // add tab's content
        $('#nav-tab-content').append($(Mustache.render(nav_tab_content_template, ex.structure)));
    });

    // Add event listeners to all input controls upon input change
    $('#nav-tab-content :input').on("input", function (event) {
        if (!haveSettingsChanged) {
            haveSettingsChanged = true;
            $("#btn_save").prop('disabled', false);
        }
    });

    // Add focus event handler for text inputs. 
    // The goal is to keep track of the focused element
    // This is needed for clickable parameters feature
    $('#nav-tab-content textarea').focus(function(event) {
        previousFocusedInput = $(event.target).attr('id');
    });

    $('#nav-tab-content [type=text]').focus(function(event) {
        previousFocusedInput = $(event.target).attr('id');
    });

    // Add event listeners to default buttons embedded on inputs
    $('#nav-tab-content').find('[data-default-btn]').click(setDefaultOption);

    // make checkboxes with value="true" be checked
    $("input[type='checkbox'][value='true']").each(function () {
        $(this).prop('checked', true)
    });

    // add onclick event for 'Save' button
    $('#btn_save').click(saveChanges);

    // intercept ctrl+s to save options
    $(window).bind('keydown', function (event) {
        if ((event.ctrlKey || event.metaKey) && String.fromCharCode(event.which).toLowerCase() == 's') {
            event.preventDefault();
            saveChanges();
        }
    });

    // Make all textareas auto resizable (height)
    $('#nav-tab-content').find('textarea').on("change input focus", function (event) {
        // first set height to zero to compute the scroll height, the new height
        $(event.target).height(0).height(event.target.scrollHeight);
    });

    // Make parameters be clickable
    $('.parameter-code code').click( function (event) {

        if(previousFocusedInput === undefined)
            return;

        // the clicked parameter DOM
        var el = event.target;

        // The previous focused text input. Focus it
        var $txtEl = $('#' + previousFocusedInput);
        $txtEl.focus();
        
        // insert text
        var caretPos = $txtEl.prop('selectionStart');
        var selectionLength = $txtEl.prop('selectionEnd') - caretPos;
        var currVal = $txtEl.val();
        
        if(selectionLength === 0) {
            // no selected text, insert value at caret position
            $txtEl.val(currVal.slice(0, caretPos) + el.innerText + currVal.slice(caretPos));
        } else {
            // replace selected text with new text
            $txtEl.val(currVal.slice(0, caretPos) + el.innerText + currVal.slice(caretPos + selectionLength));
        }

        $txtEl.prop('selectionEnd', caretPos + el.innerText.length);
        $txtEl.trigger('input');
    });

    window.addEventListener("beforeunload", function (event) {
        if (haveSettingsChanged)
            event.returnValue = "Are you sure you want to leave? You have unsaved settings";
    });

    // set the first tab as active
    $('#nav-tab-' + EXTRACTORS[0].structure.extractor).tab('show');
});