import * as firebase from 'firebase';
declare const getProvider: (providerId: string) => firebase.auth.EmailAuthProvider | firebase.auth.FacebookAuthProvider | firebase.auth.GithubAuthProvider | firebase.auth.GoogleAuthProvider | firebase.auth.TwitterAuthProvider;
export default getProvider;
