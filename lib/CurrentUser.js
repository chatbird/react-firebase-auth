"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var firebase = require("firebase/app");
require("firebase/auth");
var CurrentUser = (function (_super) {
    __extends(CurrentUser, _super);
    function CurrentUser() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CurrentUser.prototype.render = function () {
        var user = firebase.auth().currentUser;
        return this.props.children(user);
    };
    return CurrentUser;
}(React.Component));
exports.default = CurrentUser;
//# sourceMappingURL=CurrentUser.js.map