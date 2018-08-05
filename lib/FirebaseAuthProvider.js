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
var setFirebaseConfig_1 = require("./helpers/setFirebaseConfig");
var firebase = require("firebase/app");
require("firebase/auth");
var getProvider_1 = require("./helpers/getProvider");
var post_1 = require("./helpers/post");
var FirebaseContext_1 = require("./FirebaseContext");
var appendQuery = require("append-query");
var jwtDecode = require("jwt-decode");
var PENDING_CREDENTIAL_KEY = "pendingCredential";
var signInWithRedirect = function (providerId) {
    var provider = getProvider_1.default(providerId);
    return function () { return firebase.auth().signInWithRedirect(provider); };
};
var signInWithPopup = function (providerId) {
    var provider = getProvider_1.default(providerId);
    return function () { return firebase.auth().signInWithPopup(provider); };
};
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
        _this.signInWithLinkedIn = function () {
            var ref = window.location.pathname;
            var url = appendQuery(_this.props.linkedInLoginPath, { ref: ref });
            window.location.replace(url);
        };
        _this.providers = [
            { id: "facebook.com", signInWithRedirect: signInWithRedirect("facebook.com"), signInWithPopup: signInWithPopup("facebook.com") },
            { id: "twitter.com", signInWithRedirect: signInWithRedirect("twitter.com"), signInWithPopup: signInWithPopup("twitter.com") },
            { id: "google.com", signInWithRedirect: signInWithRedirect("google.com"), signInWithPopup: signInWithPopup("google.com") },
            { id: "linkedin.com", signInWithRedirect: _this.signInWithLinkedIn, signInWithPopup: _this.signInWithLinkedIn }
        ];
        _this.handleRedirect = function (pendingCredential) {
            if (pendingCredential === void 0) { pendingCredential = null; }
            if (pendingCredential) {
                _this.log("handleRedirect with pendingCredential");
                _this.log(pendingCredential);
            }
            firebase.auth().getRedirectResult().then(function (result) {
                if (result.user)
                    _this.log("Redirect Result", result);
                if (pendingCredential && result.user) {
                    if (pendingCredential.providerId === "linkedin.com") {
                        _this.log("Linking with linkedin.com");
                        result.user.getIdToken()
                            .then(function (idToken) { return _this.linkWithLinkedIn(pendingCredential, idToken); })
                            .then(_this.removePendingCredential.bind(_this))
                            .then(function () { return _this.setState({ handledRedirect: true }); });
                    }
                    else {
                        _this.log("Linking with ", pendingCredential.providerId);
                        return result.user
                            .linkAndRetrieveDataWithCredential(pendingCredential)
                            .then(_this.removePendingCredential.bind(_this))
                            .then(_this.refreshToken)
                            .then(function () { return _this.setState({ handledRedirect: true }); });
                    }
                }
                else {
                    _this.setState({ handledRedirect: true });
                    _this.removePendingCredential();
                }
            }).catch(function (error) {
                _this.setState({ handledRedirect: true });
                var errorMessage = error.message;
                _this.log("Error after Redirect", errorMessage);
                _this.removePendingCredential();
                _this.log("remove old pending credential");
                if (error.code === 'auth/account-exists-with-different-credential') {
                    _this.handleExistingAccountError(error);
                }
            });
        };
        _this.handleExistingAccountError = function (error) {
            var pendingCredential = error.credential;
            var existingEmail = error.email;
            _this.log("handleExistingAccountError", error);
            return _this.setPendingCredential(pendingCredential)
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
        _this.login = function (idToken) {
            var onLogin = _this.props.onLogin;
            return new Promise(function (resolve) { return resolve(onLogin(idToken)); });
        };
        _this.onAuthStateChanged = function (user) {
            _this.log("onAuthStateChanged", user);
            if (user) {
                return user.getIdToken()
                    .then(function (firebaseToken) {
                    _this.login(firebaseToken).then(function () { return _this.setState({ firebaseToken: firebaseToken }); });
                });
            }
            else if (_this.props.allowAnonymousSignup) {
                _this.log("calling signInAnonymously()");
                return firebase.auth().signInAnonymously();
            }
        };
        _this.log = function (message) {
            var optionalParams = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                optionalParams[_i - 1] = arguments[_i];
            }
            return _this.props.debug ? console.log.apply(console, [message].concat(optionalParams)) : null;
        };
        _this.refreshToken = function () {
            return _this.updateToken(firebase.auth().currentUser, true);
        };
        _this.setAuthStateListener = function () {
            return firebase.auth().onAuthStateChanged(_this.onAuthStateChanged);
        };
        var firebaseConfig = props.firebaseConfig;
        setFirebaseConfig_1.default(firebaseConfig);
        return _this;
    }
    FirebaseAuthProvider.prototype.componentDidMount = function () {
        var _this = this;
        this.getPendingCredential()
            .then(function (pendingCredential) { return _this.handleRedirect(pendingCredential); })
            .catch(function () { return _this.handleRedirect(); })
            .then(this.setAuthStateListener);
    };
    FirebaseAuthProvider.prototype.getPendingCredential = function () {
        return new Promise(function (resolve, reject) {
            try {
                resolve(JSON.parse(localStorage.getItem(PENDING_CREDENTIAL_KEY)));
            }
            catch (error) {
                reject();
            }
        });
    };
    FirebaseAuthProvider.prototype.setPendingCredential = function (pendingCredential) {
        return new Promise(function (resolve) {
            localStorage.setItem(PENDING_CREDENTIAL_KEY, JSON.stringify(pendingCredential));
            resolve();
        });
    };
    FirebaseAuthProvider.prototype.removePendingCredential = function () {
        localStorage.removeItem(PENDING_CREDENTIAL_KEY);
    };
    FirebaseAuthProvider.prototype.updateToken = function (user, forceRefresh) {
        var _this = this;
        if (forceRefresh === void 0) { forceRefresh = false; }
        this.log("updateToken called");
        return user.getIdToken(forceRefresh)
            .then(function (firebaseToken) {
            _this.setState({ firebaseToken: firebaseToken });
            return firebaseToken;
        });
    };
    FirebaseAuthProvider.prototype.linkWithLinkedIn = function (pendingCredential, idToken) {
        return post_1.default(this.props.linkedInLinkPath, { pendingCredential: pendingCredential, idToken: idToken })
            .then(this.refreshToken);
    };
    FirebaseAuthProvider.prototype.render = function () {
        var children = this.props.children;
        var _a = this.state, firebaseToken = _a.firebaseToken, existingProviders = _a.existingProviders, handledRedirect = _a.handledRedirect;
        var filteredProviders = existingProviders ? this.providers.filter(function (_a) {
            var id = _a.id;
            return existingProviders.includes(id);
        }) : this.providers;
        var hasExistingProviders = existingProviders && filteredProviders && filteredProviders.length > 0;
        var loading = !firebaseToken || !handledRedirect;
        var decodedToken = firebaseToken ? jwtDecode(firebaseToken) : {};
        var value = {
            auth: firebase.auth(),
            loading: loading,
            firebaseToken: firebaseToken,
            decodedToken: decodedToken,
            handleExistingAccountError: this.handleExistingAccountError,
            refreshToken: this.refreshToken,
            providers: filteredProviders,
            hasExistingProviders: hasExistingProviders
        };
        return (React.createElement(FirebaseContext_1.default.Provider, { value: value }, children));
    };
    return FirebaseAuthProvider;
}(React.Component));
exports.default = FirebaseAuthProvider;
//# sourceMappingURL=FirebaseAuthProvider.js.map