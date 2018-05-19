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
var set_firebase_config_1 = require("./helpers/set_firebase_config");
var firebase = require("firebase");
var get_provider_1 = require("./helpers/get_provider");
var send_verification_email_to_current_user_1 = require("./helpers/send_verification_email_to_current_user");
var FirebaseContext = React.createContext(null);
var signInWithRedirect = function (providerId) {
    var provider = get_provider_1.default(providerId);
    return function () { return firebase.auth().signInWithRedirect(provider); };
};
var signInWithLinkedIn = function () { return window.location.replace("/auth/linkedin"); };
var signInWithPopup = function (providerId) {
    var provider = get_provider_1.default(providerId);
    return function () { return firebase.auth().signInWithPopup(provider); };
};
var providers = [
    { id: "facebook.com", signInWithRedirect: signInWithRedirect("facebook.com"), signInWithPopup: signInWithPopup("facebook.com") },
    { id: "twitter.com", signInWithRedirect: signInWithRedirect("twitter.com"), signInWithPopup: signInWithPopup("twitter.com") },
    { id: "github.com", signInWithRedirect: signInWithRedirect("github.com"), signInWithPopup: signInWithPopup("github.com") },
    { id: "linkedin.com", signInWithRedirect: signInWithLinkedIn, signInWithPopup: signInWithLinkedIn }
];
var FirebaseAuthProvider = (function (_super) {
    __extends(FirebaseAuthProvider, _super);
    function FirebaseAuthProvider(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            firebaseToken: null,
            handledRedirect: false,
            existingProviders: null,
            pendingCredential: null,
            existingEmail: null
        };
        var firebaseConfig = props.firebaseConfig;
        set_firebase_config_1.default(firebaseConfig);
        return _this;
    }
    FirebaseAuthProvider.prototype.render = function () {
        var children = this.props.children;
        var _a = this.state, firebaseToken = _a.firebaseToken, existingProviders = _a.existingProviders, pendingCredential = _a.pendingCredential, existingEmail = _a.existingEmail, handledRedirect = _a.handledRedirect;
        var mappedExistingProviders = null;
        if (existingProviders)
            mappedExistingProviders = providers.filter(function (_a) {
                var id = _a.id;
                return existingProviders.includes(id);
            });
        var redirectResult = { existingProviders: existingProviders, pendingCredential: pendingCredential, existingEmail: existingEmail };
        var loading = !firebaseToken || !handledRedirect;
        var value = {
            firebase: {
                loading: loading,
                providers: providers,
                firebaseToken: firebaseToken,
                redirectResult: redirectResult,
                sendVerificationEmailToCurrentUser: send_verification_email_to_current_user_1.default,
            }
        };
        return (React.createElement(FirebaseContext.Provider, { value: {} }, children));
    };
    return FirebaseAuthProvider;
}(React.Component));
exports.FirebaseAuthProvider = FirebaseAuthProvider;
//# sourceMappingURL=index.js.map