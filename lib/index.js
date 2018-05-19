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
var post_1 = require("./helpers/post");
var handle_verify_email_1 = require("./helpers/handle_verify_email");
var handle_recover_email_1 = require("./helpers/handle_recover_email");
var update_profile_1 = require("./helpers/update_profile");
var update_email_1 = require("./helpers/update_email");
var localforage_1 = require("localforage");
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
exports.FirebaseAuthConsumer = FirebaseContext.Consumer;
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
        _this.providers = [
            { id: "facebook.com", signInWithRedirect: signInWithRedirect("facebook.com"), signInWithPopup: signInWithPopup("facebook.com") },
            { id: "twitter.com", signInWithRedirect: signInWithRedirect("twitter.com"), signInWithPopup: signInWithPopup("twitter.com") },
            { id: "github.com", signInWithRedirect: signInWithRedirect("github.com"), signInWithPopup: signInWithPopup("github.com") },
            { id: "linkedin.com", signInWithRedirect: signInWithLinkedIn, signInWithPopup: signInWithLinkedIn }
        ];
        _this.signInWithLinkedIn = function () { return window.location.replace(_this.props.linkedInLoginPath); };
        _this.log = function (message) {
            var optionalParams = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                optionalParams[_i - 1] = arguments[_i];
            }
            return _this.props.debug ? console.log.apply(console, [message].concat(optionalParams)) : null;
        };
        _this.updateTokenForCurrentUser = function () {
            return _this.updateToken(firebase.auth().currentUser, true);
        };
        _this.updateEmail = function (email) {
            return update_email_1.default(email)
                .then(_this.updateTokenForCurrentUser);
        };
        _this.updateProfile = function (input) {
            return update_profile_1.default(input)
                .then(_this.updateTokenForCurrentUser);
        };
        _this.handleVerifyEmail = function (actionCode) {
            return handle_verify_email_1.default(actionCode)
                .then(_this.updateTokenForCurrentUser);
        };
        _this.handleRecoverEmail = function (actionCode) {
            return handle_recover_email_1.default(actionCode)
                .then(_this.updateTokenForCurrentUser);
        };
        _this.getFirebaseToken = function () { return _this.state.firebaseToken; };
        _this.setAuthStateListener = function () {
            firebase.auth().onAuthStateChanged(_this.onAuthStateChanged);
        };
        var firebaseConfig = props.firebaseConfig;
        set_firebase_config_1.default(firebaseConfig);
        return _this;
    }
    FirebaseAuthProvider.prototype.componentDidMount = function () {
        var _this = this;
        var customToken = this.props.customToken;
        if (customToken) {
            firebase.auth().signOut()
                .then(this.setAuthStateListener)
                .then(function () { return _this.signInWithCustomToken(customToken); })
                .then(this.handleRedirect);
        }
        else {
            localforage_1.default.getItem('pendingCredential')
                .then(this.handleRedirect)
                .catch(this.handleRedirect)
                .then(this.setAuthStateListener);
        }
    };
    FirebaseAuthProvider.prototype.signInWithCustomToken = function (token) {
        var _this = this;
        this.log("signInWithCustomToken token", token);
        return firebase.auth().signInWithCustomToken(token)
            .then(function (user) {
            _this.log("signInWithCustomToken user", user);
            return localforage_1.default.getItem('pendingCredential')
                .then(function (pendingCredential) {
                _this.log("signInWithCustomToken pendingCredential", pendingCredential);
                if (pendingCredential) {
                    return user.linkAndRetrieveDataWithCredential(pendingCredential)
                        .then(function () { return localforage_1.default.removeItem('pendingCredential'); })
                        .then(function () { return user; });
                }
                else {
                    return user;
                }
            });
        }).catch()
            .then(this.updateTokenForCurrentUser)
            .then(this.login);
    };
    ;
    FirebaseAuthProvider.prototype.handleRedirect = function (pendingCredential) {
        var _this = this;
        if (pendingCredential)
            this.log("handleRedirect with pendingCredential", pendingCredential);
        firebase.auth().getRedirectResult().then(function (result) {
            if (result.user)
                _this.log("Redirect Result", result);
            if (pendingCredential && result.user) {
                if (pendingCredential.providerId === "linkedin.com") {
                    _this.log("Linking with linkedin.com");
                    result.user.getIdToken()
                        .then(function (idToken) { return _this.linkWithLinkedIn(pendingCredential, idToken); })
                        .then(_this.login)
                        .then(function () { return localforage_1.default.removeItem('pendingCredential'); })
                        .then(function () { return _this.setState({ handledRedirect: true }); });
                }
                else {
                    _this.log("Linking with ", pendingCredential.providerId);
                    return result.user
                        .linkAndRetrieveDataWithCredential(pendingCredential)
                        .then(function () { return localforage_1.default.removeItem('pendingCredential'); })
                        .then(_this.updateTokenForCurrentUser)
                        .then(_this.login)
                        .then(function () { return _this.setState({ handledRedirect: true }); });
                }
            }
            else {
                _this.setState({ handledRedirect: true });
            }
        }).catch(function (error) {
            _this.setState({ handledRedirect: true });
            var errorMessage = error.message;
            _this.log("Error after Redirect", errorMessage);
            if (error.code === 'auth/account-exists-with-different-credential') {
                _this.handleExistingAccountError(error);
            }
        });
    };
    ;
    FirebaseAuthProvider.prototype.handleExistingAccountError = function (error) {
        var _this = this;
        var pendingCredential = error.credential;
        var existingEmail = error.email;
        this.log("handleExistingAccountError", error);
        return localforage_1.default.setItem('pendingCredential', pendingCredential)
            .then(function () {
            _this.log("fetching providers for existingEmail", existingEmail);
            return firebase.auth().fetchProvidersForEmail(existingEmail);
        })
            .then(function (existingProviders) {
            if (existingProviders.length === 0)
                existingProviders = ["linkedin.com"];
            _this.log("fetched existingProviders", existingProviders);
            _this.setState({ existingProviders: existingProviders, pendingCredential: pendingCredential, existingEmail: existingEmail });
        });
    };
    ;
    FirebaseAuthProvider.prototype.login = function (idToken) {
        var postAfterLoginPath = this.props.postAfterLoginPath;
        return postAfterLoginPath
            ? post_1.default(postAfterLoginPath, { idToken: idToken })
            : new Promise(function (resolve) { return resolve(false); });
    };
    FirebaseAuthProvider.prototype.updateToken = function (user, forceRefresh) {
        var _this = this;
        if (forceRefresh === void 0) { forceRefresh = false; }
        return user.getIdToken(forceRefresh)
            .then(function (firebaseToken) {
            _this.setState({ firebaseToken: firebaseToken });
            return firebaseToken;
        });
    };
    FirebaseAuthProvider.prototype.linkWithLinkedIn = function (pendingCredential, idToken) {
        return post_1.default(this.props.linkedInLinkPath, { pendingCredential: pendingCredential, idToken: idToken })
            .then(this.updateTokenForCurrentUser);
    };
    FirebaseAuthProvider.prototype.reauthenticateWithPopup = function (providerId) {
        firebase.auth()
            .currentUser
            .reauthenticateWithPopup(get_provider_1.default(providerId))
            .then(this.updateTokenForCurrentUser);
    };
    FirebaseAuthProvider.prototype.onAuthStateChanged = function (user) {
        var _this = this;
        if (user) {
            this.setState({ firebaseToken: null });
            if (user.isAnonymous) {
                return this.updateToken(user);
            }
            else {
                return user.getIdToken(true)
                    .then(this.login)
                    .then(function () { return _this.updateToken(user); });
            }
        }
        else {
            return firebase.auth().signInAnonymously();
        }
    };
    ;
    FirebaseAuthProvider.prototype.render = function () {
        var children = this.props.children;
        var _a = this.state, firebaseToken = _a.firebaseToken, existingProviders = _a.existingProviders, pendingCredential = _a.pendingCredential, existingEmail = _a.existingEmail, handledRedirect = _a.handledRedirect;
        var mappedExistingProviders = null;
        if (existingProviders)
            mappedExistingProviders = this.providers.filter(function (_a) {
                var id = _a.id;
                return existingProviders.includes(id);
            });
        var redirectResult = { existingProviders: existingProviders, pendingCredential: pendingCredential, existingEmail: existingEmail };
        var loading = !firebaseToken || !handledRedirect;
        var value = {
            firebase: {
                loading: loading,
                providers: this.providers,
                firebaseToken: firebaseToken,
                redirectResult: redirectResult,
                sendVerificationEmailToCurrentUser: send_verification_email_to_current_user_1.default,
                getFirebaseToken: this.getFirebaseToken,
                updateProfile: this.updateProfile,
                updateEmail: this.updateEmail,
                handleVerifyEmail: this.handleVerifyEmail,
                handleRecoverEmail: this.handleRecoverEmail,
                updateTokenForCurrentUser: this.updateTokenForCurrentUser,
                reauthenticateWithPopup: this.reauthenticateWithPopup,
                signInWithCustomToken: this.signInWithCustomToken,
                handleExistingAccountError: this.handleExistingAccountError
            }
        };
        return (React.createElement(FirebaseContext.Provider, { value: value }, children));
    };
    return FirebaseAuthProvider;
}(React.Component));
exports.FirebaseAuthProvider = FirebaseAuthProvider;
//# sourceMappingURL=index.js.map