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
var FirebaseAuthConsumer_1 = require("./FirebaseAuthConsumer");
var IsAnonymous = (function (_super) {
    __extends(IsAnonymous, _super);
    function IsAnonymous() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    IsAnonymous.prototype.render = function () {
        var _this = this;
        var _a = this.props, children = _a.children, invert = _a.invert;
        if (typeof children === "function") {
            return (React.createElement(FirebaseAuthConsumer_1.default, null, function (_a) {
                var decodedToken = _a.decodedToken, loading = _a.loading;
                return children({ isAnonymous: _this.isAnonymous(decodedToken), loading: loading });
            }));
        }
        else {
            return (React.createElement(FirebaseAuthConsumer_1.default, null, function (_a) {
                var decodedToken = _a.decodedToken;
                var isAnonymous = _this.isAnonymous(decodedToken);
                if (isAnonymous && !invert) {
                    return children;
                }
                if (!isAnonymous && invert) {
                    return children;
                }
                return null;
            }));
        }
    };
    IsAnonymous.prototype.isAnonymous = function (decodedToken) {
        return !decodedToken || decodedToken.provider_id === "anonymous";
    };
    return IsAnonymous;
}(React.Component));
exports.default = IsAnonymous;
//# sourceMappingURL=IsAnonymous.js.map