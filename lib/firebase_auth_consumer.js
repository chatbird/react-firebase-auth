"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var firebase_context_1 = require("./firebase_context");
var FirebaseAuthConsumer = function (_a) {
    var children = _a.children;
    return (React.createElement(firebase_context_1.default.Consumer, null, function (value) { return children(value); }));
};
exports.default = FirebaseAuthConsumer;
//# sourceMappingURL=firebase_auth_consumer.js.map