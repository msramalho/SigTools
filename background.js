chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {
		console.log(sender.tab ?
			"from a content script:" + sender.tab.url :
			"from the extension");
		if (request.greeting == "hello")
			sendResponse({
				gapi: gapi
			});
	}
);

/*** Make a XMLHttpRequest to the identity endpoint ***/

function xhrWithAuth(callback) {
	var access_token;
	var retry = true;
	var url = 'https://www.googleapis.com/plus/v1/people/me';
	getToken();

	/*** Get the access token and call the identity API ***/
	function getToken() {
		chrome.identity.getAuthToken({
			interactive: false
		}, function (token) {
			if (chrome.runtime.lastError) {
				callback(chrome.runtime.lastError);
				return;
			}
			access_token = token;

			var xhr = new XMLHttpRequest();
			xhr.open('get', url);
			xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
			xhr.onload = requestComplete;
			xhr.send();
		});
	}

	/*** Clean up and report any errors ***/
	function requestComplete() {
		if (this.status == 401 && retry) {
			retry = false;
			chrome.identity.removeCachedAuthToken({
					token: access_token
				},
				getToken);
		} else {
			callback(null, this.status, this.response);
		}
	}
}

/*** If we got user information, parse out the email address and log it ***/
function onUserInfoFetched(error, status, response) {
	if (!error && status == 200) {
		console.log(response);
		var user_info = JSON.parse(response);
		if (user_info.emails) {
			for (i = 0; i < user_info.emails.length; i++) {
				emails.push(user_info.emails[i].value);
			}
			console.log("Found emails:", emails);
		}
	} else {
		console.log("Error:", error);
	}
}

/*** Return the email addresses when content.js asks for it ***/
chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
	console.log("Sending emails:", emails);
	sendResponse({
		emails: emails
	})
});


/*** Main ***/
var emails = [];
xhrWithAuth(onUserInfoFetched);