"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var firebase = require("firebase/app");
require("firebase/auth");
var getProvider = function (providerId) {
    if (providerId === "twitter.com") {
        return new firebase.auth.TwitterAuthProvider();
    }
    else if (providerId === "facebook.com") {
        return new firebase.auth.FacebookAuthProvider();
    }
    else if (providerId === "google.com") {
        return new firebase.auth.GoogleAuthProvider();
    }
    else if (providerId === "github.com") {
        return new firebase.auth.GithubAuthProvider();
    }
    else if (providerId === "password") {
        return new firebase.auth.EmailAuthProvider();
    }
};
exports.default = getProvider;
//# sourceMappingURL=getProvider.js.map