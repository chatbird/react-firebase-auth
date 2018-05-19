import * as firebase from 'firebase';
declare const getProvider: (providerId: string) => firebase.auth.TwitterAuthProvider | firebase.auth.FacebookAuthProvider | firebase.auth.GoogleAuthProvider | firebase.auth.GithubAuthProvider | firebase.auth.EmailAuthProvider;
export default getProvider;
