$(".version").toArray().forEach(s => s.innerHTML = `V ${chrome.runtime.getManifest().version}`)

if (+(new Date()) > +(new Date("2018-12-25"))) $("#christmas_message").remove()