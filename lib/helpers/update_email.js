"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var firebase = require("firebase");
var updateEmail = function (email) {
    return new Promise(function (resolve, reject) {
        var user = firebase.auth().currentUser;
        if (user)
            resolve(user.updateEmail(email).then(function () { return user; }));
        reject();
    });
};
exports.default = updateEmail;
//# sourceMappingURL=update_email.js.map