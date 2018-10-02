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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var setFirebaseConfig_1 = require("./helpers/setFirebaseConfig");
var firebase = require("firebase/app");
require("firebase/auth");
var getProvider_1 = require("./helpers/getProvider");
var post_1 = require("./helpers/post");
var FirebaseContext_1 = require("./FirebaseContext");
var appendQuery = require("append-query");
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
        _this.getPendingCredential = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    return [2, JSON.parse(localStorage.getItem(PENDING_CREDENTIAL_KEY))];
                }
                catch (error) {
                    return [2];
                }
                return [2];
            });
        }); };
        _this.setPendingCredential = function (pendingCredential) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                localStorage.setItem(PENDING_CREDENTIAL_KEY, JSON.stringify(pendingCredential));
                return [2];
            });
        }); };
        _this.handleRedirect = function (pendingCredential) {
            if (pendingCredential === void 0) { pendingCredential = null; }
            return __awaiter(_this, void 0, void 0, function () {
                var result, user, idToken, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 9, , 10]);
                            return [4, firebase.auth().getRedirectResult()];
                        case 1:
                            result = _a.sent();
                            user = result.user;
                            if (!(pendingCredential && user)) return [3, 7];
                            if (!(pendingCredential.providerId === "linkedin.com")) return [3, 4];
                            return [4, user.getIdToken()];
                        case 2:
                            idToken = _a.sent();
                            return [4, this.linkWithLinkedIn(pendingCredential, idToken)];
                        case 3:
                            _a.sent();
                            this.removePendingCredential();
                            return [3, 6];
                        case 4: return [4, user.linkAndRetrieveDataWithCredential(pendingCredential)];
                        case 5:
                            _a.sent();
                            this.removePendingCredential();
                            _a.label = 6;
                        case 6: return [3, 8];
                        case 7:
                            this.removePendingCredential();
                            _a.label = 8;
                        case 8: return [3, 10];
                        case 9:
                            error_1 = _a.sent();
                            console.log("handledRedirect error");
                            this.removePendingCredential();
                            if (error_1.code === 'auth/account-exists-with-different-credential') {
                                this.handleExistingAccountError(error_1);
                            }
                            return [3, 10];
                        case 10: return [2];
                    }
                });
            });
        };
        _this.handleExistingAccountError = function (error) { return __awaiter(_this, void 0, void 0, function () {
            var pendingCredential, existingEmail, existingProviders;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pendingCredential = error.credential;
                        existingEmail = error.email;
                        return [4, this.setPendingCredential(pendingCredential)];
                    case 1:
                        _a.sent();
                        return [4, firebase.auth().fetchProvidersForEmail(existingEmail)];
                    case 2:
                        existingProviders = _a.sent();
                        if (existingProviders.length === 0) {
                            existingProviders = ["linkedin.com"];
                        }
                        this.setState({ existingProviders: existingProviders, pendingCredential: pendingCredential, existingEmail: existingEmail });
                        return [2];
                }
            });
        }); };
        _this.login = function (idToken) { return __awaiter(_this, void 0, void 0, function () {
            var onLogin;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        onLogin = this.props.onLogin;
                        return [4, onLogin(idToken)];
                    case 1: return [2, _a.sent()];
                }
            });
        }); };
        _this.getCurrentUser = function () {
            return new Promise(function (resolve, reject) {
                if (firebase.auth().currentUser) {
                    return resolve(firebase.auth().currentUser);
                }
                firebase.auth().onAuthStateChanged(function (user) { return __awaiter(_this, void 0, void 0, function () {
                    var finalUser;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, this.onAuthStateChanged(user)];
                            case 1:
                                finalUser = _a.sent();
                                resolve(finalUser);
                                return [2];
                        }
                    });
                }); }, reject);
            });
        };
        _this.getToken = function (forceRefresh) {
            if (forceRefresh === void 0) { forceRefresh = false; }
            return __awaiter(_this, void 0, void 0, function () {
                var user, firebaseToken;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, this.getCurrentUser()];
                        case 1:
                            user = _a.sent();
                            return [4, user.getIdToken(forceRefresh)];
                        case 2:
                            firebaseToken = _a.sent();
                            return [2, firebaseToken];
                    }
                });
            });
        };
        _this.linkWithLinkedIn = function (pendingCredential, idToken) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, post_1.default(this.props.linkedInLinkPath, { pendingCredential: pendingCredential, idToken: idToken })];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        }); };
        _this.onAuthStateChanged = function (user) { return __awaiter(_this, void 0, void 0, function () {
            var firebaseToken, userCredential;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!user) return [3, 3];
                        return [4, user.getIdToken()];
                    case 1:
                        firebaseToken = _a.sent();
                        return [4, this.login(firebaseToken)];
                    case 2:
                        _a.sent();
                        return [2, user];
                    case 3:
                        if (!this.props.allowAnonymousSignup) return [3, 5];
                        return [4, firebase.auth().signInAnonymously()];
                    case 4:
                        userCredential = _a.sent();
                        return [2, userCredential.user];
                    case 5: return [2];
                }
            });
        }); };
        _this.log = function (message) {
            var optionalParams = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                optionalParams[_i - 1] = arguments[_i];
            }
            return _this.props.debug ? console.log.apply(console, [message].concat(optionalParams)) : null;
        };
        _this.setAuthStateListener = function () {
            return firebase.auth().onAuthStateChanged(_this.onAuthStateChanged);
        };
        _this.getFirebaseToken = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.getToken()];
                    case 1: return [2, _a.sent()];
                }
            });
        }); };
        var firebaseConfig = props.firebaseConfig;
        setFirebaseConfig_1.default(firebaseConfig);
        return _this;
    }
    FirebaseAuthProvider.prototype.componentDidMount = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pendingCredential, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.getPendingCredential()];
                    case 1:
                        pendingCredential = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4, this.handleRedirect(pendingCredential)];
                    case 3:
                        _a.sent();
                        return [3, 5];
                    case 4:
                        error_2 = _a.sent();
                        this.log(error_2);
                        return [3, 5];
                    case 5:
                        this.setAuthStateListener();
                        if (!this.props.user) return [3, 7];
                        return [4, firebase.auth().updateCurrentUser(this.props.user)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [2];
                }
            });
        });
    };
    FirebaseAuthProvider.prototype.removePendingCredential = function () {
        localStorage.removeItem(PENDING_CREDENTIAL_KEY);
    };
    FirebaseAuthProvider.prototype.render = function () {
        var children = this.props.children;
        var existingProviders = this.state.existingProviders;
        var filteredProviders = existingProviders ? this.providers.filter(function (_a) {
            var id = _a.id;
            return existingProviders.includes(id);
        }) : this.providers;
        var hasExistingProviders = existingProviders && filteredProviders && filteredProviders.length > 0;
        var value = {
            auth: firebase.auth(),
            getFirebaseToken: this.getFirebaseToken,
            getCurrentUser: this.getCurrentUser,
            handleExistingAccountError: this.handleExistingAccountError,
            providers: filteredProviders,
            hasExistingProviders: hasExistingProviders
        };
        return (React.createElement(FirebaseContext_1.default.Provider, { value: value }, children));
    };
    return FirebaseAuthProvider;
}(React.Component));
exports.default = FirebaseAuthProvider;
//# sourceMappingURL=FirebaseAuthProvider.js.map