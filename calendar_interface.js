class CalendarApi {
    constructor(clientId, apiKey, discoveryDocs, scope) {
        console.log(gapi);
        this.clientId = clientId;
        this.apiKey = apiKey;
        // Array of API discovery doc URLs for APIs used by the quickstart
        this.discoveryDocs = discoveryDocs || ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

        // Authorization scopes required by the API; multiple scopes can be included, separated by spaces.
        this.scope = scope || "https://www.googleapis.com/auth/calendar.readonly";
    }

    // updateSigninStatus is the callback that receives a boolean when the sign in status changes: isSignedIn
    init(updateSigninStatus) {
        this.updateSigninStatus = updateSigninStatus || ((isSignedIn) => {
            console.log(`signed in: ${isSignedIn}`);
        });
        console.dir(gapi);
        gapi.load('client:auth2', this.initClient);
    }

    initClient() {
        gapi.client.init({
            apiKey: this.apiKey,
            clientId: this.clientId,
            discoveryDocs: this.discoveryDocs,
            scope: this.scope
        }).then(function () {
            // Listen for sign-in state changes.
            gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSigninStatus);

            // Handle the initial sign-in state.
            updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
            // authorizeButton.onclick = handleAuthClick;
            // signoutButton.onclick = handleSignoutClick;
        });
    }

}