"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var FirebaseContext_1 = require("./FirebaseContext");
var FirebaseAuthConsumer = function (_a) {
    var children = _a.children;
    return (React.createElement(FirebaseContext_1.default.Consumer, null, function (value) { return children(value); }));
};
exports.default = FirebaseAuthConsumer;
//# sourceMappingURL=FirebaseAuthConsumer.js.map