"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var firebase = require("firebase");
var handleRecoverEmail = function (actionCode) {
    var restoredEmail = null;
    return firebase.auth().checkActionCode(actionCode).then(function (info) {
        restoredEmail = info['data']['email'];
        return firebase.auth().applyActionCode(actionCode);
    });
};
exports.default = handleRecoverEmail;
//# sourceMappingURL=handle_recover_email.js.map