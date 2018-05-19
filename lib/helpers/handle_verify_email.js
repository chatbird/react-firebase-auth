"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var firebase = require("firebase");
var handleVerifyEmail = function (actionCode) {
    firebase.auth().applyActionCode(actionCode);
};
exports.default = handleVerifyEmail;
//# sourceMappingURL=handle_verify_email.js.map