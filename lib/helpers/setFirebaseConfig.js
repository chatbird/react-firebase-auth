"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var firebase = require("firebase");
var setFirebaseConfig = function (firebaseConfig) {
    if (firebase.apps.length === 0)
        firebase.initializeApp(firebaseConfig);
};
exports.default = setFirebaseConfig;
//# sourceMappingURL=setFirebaseConfig.js.map