"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var firebase = require("firebase");
var sendVerificationEmailToCurrentUser = function (url) {
    return new Promise(function (resolve, reject) {
        var user = firebase.auth().currentUser;
        if (user)
            resolve(user.sendEmailVerification({ url: url }).then(function () { return user; }));
        reject();
    });
};
exports.default = sendVerificationEmailToCurrentUser;
//# sourceMappingURL=send_verification_email_to_current_user.js.map