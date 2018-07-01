// README: DO NOT "use strict"; because the eval used in parseStrFormat must use the `var` to have a scope out of the for-loop so that the eval inside the try-catch can access the variables without appending event.X to the str (which would limit the code inside ${} not to use ${})

/**
 * Parses a string that represents a format for event's title and description
 * @param {object} event this variable is used in eval so DO NOT remove because of unused warning
 * @param {String} str The string to be parsed
 * @param {bool} isHTML used for conversions like "\n" -> "<br/>"
 */
function parseStrFormat(event, str, isHTML) {
    let p = getProperties(event);
    for (let i = 0; i < p.length; i++) {
        eval(`var ${p[i]} = event.${p[i]};`)

    }

    // let res = "`" + str.replace(/\${(.[\w\.]*?)}/gm, "${event.$1}") + "`";
    let res = "`" + str + "`";

    if (isHTML) res = res.replace('\n', "<br/>");

    try {
        res = eval(res).replace("undefined", "n/a");
    } catch (error) {
        alert(`There was an error parsing the event format for:\n${res}\n\nPlease check the options page for SigToCa to check if you have a typo in your format options`);
    }

    return res;
}

/**
 * execute a command and return a default value if an exception is thrown
 * @param {callback} command to execute, which can fail
 * @param {*} defaultValue to return on catch
 */
function jTry(command, defaultValue) {
    try {
        let tempRes = command();
        if (tempRes.length == 0) return defaultValue;
        return tempRes;
    } catch (error) {
        return defaultValue;
    }
}

/**
 * Receives a title, a url and a url text and tries to construct an html 'Title <a href="url">text</a>' but if any is undefined, simpler versions are returned
 * @param {*} title the title before the anchor
 * @param {*} href the url
 * @param {*} text the url text description
 */
function getAnchor(title, href, text) {
    if (href != undefined && !href.includes("undefined") && !text.includes("undefined")) return `${title} <a href="${href}">${text}</a><br/>`;
    else if (text != undefined && !text.includes("undefined")) return `${title} ${text}<br/>`;
    return "";
}

/**
 * Extends jquery to return text of element without the text of any nested elements
 */
jQuery.fn.selfText = function() {
    return this
        .clone() //clone the element
        .children() //select all the children
        .remove() //remove all the children
        .end() //again go back to selected element
        .text();
};

/**
 * Return a list of names of the objects properties
 */
function getProperties(obj) {
    let props = []
    for (let property in obj)
        if (obj.hasOwnProperty(property))
            props.push(property);
    return props;
}

/**
 * Export a string to a file and download it
 */
function download(contents, filename) {
    saveAs(new Blob([contents], {
        type: "text/plain;charset=utf-8"
    }), filename)
}

/**
 * Convert JSON object to CSV string
 */
function jsonToCsv(objArray) {
    let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = '';

    for (let i = 0; i < array.length; i++) {
        let line = '';
        for (let index in array[i]) {
            if (line != '') line += ','
            line += array[i][index];
        }
        str += line + '\r\n';
    }

    return str;
}