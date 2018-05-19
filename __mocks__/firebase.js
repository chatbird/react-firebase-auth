const firebase = jest.genMockFromModule('firebase');

const funcWithPromiseReturnValue = (param) => jest.fn().mockReturnValue(new Promise((resolve) => resolve(param)))

firebase.apps = [];
firebase.auth = jest.fn().mockReturnValue({
    applyActionCode: jest.fn(),
    checkActionCode: funcWithPromiseReturnValue({data: {email: "ok"}}),
    signInAnonymously: funcWithPromiseReturnValue(),
    currentUser: {
        sendEmailVerification: funcWithPromiseReturnValue(),
        updateEmail: funcWithPromiseReturnValue(),
        updateProfile: funcWithPromiseReturnValue(),
        getIdToken: funcWithPromiseReturnValue(),
        reauthenticateWithPopup: funcWithPromiseReturnValue()
    }
});

firebase.auth.TwitterAuthProvider = class TwitterAuthProvider {};
firebase.auth.FacebookAuthProvider = class FacebookAuthProvider {};
firebase.auth.GithubAuthProvider = class GithubAuthProvider {};
firebase.auth.GoogleAuthProvider = class GoogleAuthProvider {};
firebase.auth.EmailAuthProvider = class EmailAuthProvider {};

module.exports = firebase;