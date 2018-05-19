"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var firebase = require("firebase");
var setFirebaseConfig = function (firebaseConfig) {
    if (!firebase.apps.length)
        firebase.initializeApp(firebaseConfig);
};
exports.default = setFirebaseConfig;
//# sourceMappingURL=set_firebase_config.js.map