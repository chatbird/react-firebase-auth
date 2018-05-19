import * as firebase from 'firebase';
import getProvider from '../get_provider';

describe('when called with "twitter.com"', () => {
    it('correctly returns a twitter provider instance', () => {
        expect(getProvider("twitter.com")).toBeInstanceOf(firebase.auth.TwitterAuthProvider);
    });
});

describe('when called with "facebook.com"', () => {
    it('correctly returns a facebook provider instance', () => {
        expect(getProvider("facebook.com")).toBeInstanceOf(firebase.auth.FacebookAuthProvider);
    });
});

describe('when called with "github.com"', () => {
    it('correctly returns a github provider instance', () => {
        expect(getProvider("github.com")).toBeInstanceOf(firebase.auth.GithubAuthProvider);
    });
});

describe('when called with "google.com"', () => {
    it('correctly returns a google provider instance', () => {
        expect(getProvider("google.com")).toBeInstanceOf(firebase.auth.GoogleAuthProvider);
    });
});

describe('when called with "password"', () => {
    it('correctly returns a email auth provider instance', () => {
        expect(getProvider("password")).toBeInstanceOf(firebase.auth.EmailAuthProvider);
    });
});