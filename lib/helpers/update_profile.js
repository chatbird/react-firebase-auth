"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var firebase = require("firebase");
var update_email_1 = require("./update_email");
var updateProfile = function (_a) {
    var displayName = _a.name, photoURL = _a.imageUrl, email = _a.email;
    return new Promise(function (resolve, reject) {
        var user = firebase.auth().currentUser;
        if (user) {
            var promise = new Promise(function (resolve) { return resolve(); });
            if (email)
                promise = promise.then(function () { return update_email_1.default(email); });
            var profileFields_1 = { displayName: null, photoURL: null };
            if (displayName)
                profileFields_1.displayName = displayName;
            if (photoURL)
                profileFields_1.photoURL = photoURL;
            promise.then(function () { return user.updateProfile(profileFields_1); }).then(function () { return resolve(user); });
        }
        else {
            reject();
        }
    });
};
exports.default = updateProfile;
//# sourceMappingURL=update_profile.js.map