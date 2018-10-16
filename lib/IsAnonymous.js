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
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var FirebaseAuthConsumer_1 = require("./FirebaseAuthConsumer");
var InnerIsAnonymous = (function (_super) {
    __extends(InnerIsAnonymous, _super);
    function InnerIsAnonymous() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.cancelGetCurrentUser = function () { return; };
        _this.getCurrentUser = function () { return new Promise(function (resolve, reject) {
            _this.cancelGetCurrentUser = reject;
            _this.props.getCurrentUser().then(resolve);
        }); };
        _this.state = {
            loading: true,
            isAnonymous: undefined
        };
        return _this;
    }
    InnerIsAnonymous.prototype.componentDidMount = function () {
        var _this = this;
        this.getCurrentUser().then(function (user) {
            var isAnonymous = !user || user.isAnonymous;
            _this.setState({ isAnonymous: isAnonymous, loading: false });
        });
    };
    InnerIsAnonymous.prototype.componentWillUnmount = function () {
        this.cancelGetCurrentUser();
    };
    InnerIsAnonymous.prototype.render = function () {
        var _a = this.props, children = _a.children, invert = _a.invert;
        var _b = this.state, loading = _b.loading, isAnonymous = _b.isAnonymous;
        if (typeof children === "function") {
            return children({ isAnonymous: isAnonymous, loading: loading });
        }
        else {
            if (!loading && (isAnonymous && !invert || !isAnonymous && invert)) {
                return children;
            }
            return null;
        }
    };
    return InnerIsAnonymous;
}(React.Component));
var IsAnonymous = function (props) {
    return (React.createElement(FirebaseAuthConsumer_1.default, null, function (_a) {
        var getCurrentUser = _a.getCurrentUser;
        return React.createElement(InnerIsAnonymous, __assign({ getCurrentUser: getCurrentUser }, props));
    }));
};
exports.default = IsAnonymous;
//# sourceMappingURL=IsAnonymous.js.map