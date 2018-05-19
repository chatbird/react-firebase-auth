import * as React from "react";
import { FirebaseConfigType } from "./types";
import { ReactChildren } from "react";
import setFirebaseConfig from "./helpers/set_firebase_config";
import * as firebase from 'firebase';
import getProvider from "./helpers/get_provider";
import sendVerificationEmailToCurrentUser from "./helpers/send_verification_email_to_current_user";
import post from "./helpers/post";
import handleVerifyEmail from "./helpers/handle_verify_email";
import handleRecoverEmail from "./helpers/handle_recover_email";
import updateProfile from "./helpers/update_profile";
import updateEmail from "./helpers/update_email";

const FirebaseContext = React.createContext(null);

export type FirebaseAuthProviderProps = {
  firebaseConfig: FirebaseConfigType,
  children?: any,
  postAfterLoginPath?: string,
  linkedInLinkPath?: string,
  linkedInLoginPath?: string
}

export type FirebaseAuthProviderState = {
  firebaseToken: string,
  handledRedirect: boolean,
  existingProviders: string[],
  existingEmail: string,
  pendingCredential: any
}

export interface FirebaseApi {
  loading?: boolean,
  providers?: any[],
  firebaseToken?: string,
  getFirebaseToken?: Function,
  redirectResult?: any,
  updateProfile?: Function,
  updateEmail?: Function,
  sendVerificationEmailToCurrentUser?: Function,
  handleVerifyEmail?: Function,
  handleRecoverEmail?: Function,
  reauthenticateWithPopup?: Function,
  signInWithCustomToken?: Function,
  updateTokenForCurrentUser?: Function,
  handleExistingAccountError?: Function
}

const signInWithRedirect = (providerId: string) => {
  let provider = getProvider(providerId);
  return () => firebase.auth().signInWithRedirect(provider);
};

const signInWithLinkedIn = () => window.location.replace("/auth/linkedin");

const signInWithPopup = (providerId: string) => {
  let provider = getProvider(providerId);
  return () =>  firebase.auth().signInWithPopup(provider);
};

type ProviderType = {
  id: string,
  signInWithRedirect: () => any,
  signInWithPopup: () => any
}

const providers : ProviderType[] = [
  {id: "facebook.com", signInWithRedirect: signInWithRedirect("facebook.com"), signInWithPopup: signInWithPopup("facebook.com")},
  {id: "twitter.com", signInWithRedirect: signInWithRedirect("twitter.com"), signInWithPopup: signInWithPopup("twitter.com")},
  {id: "github.com", signInWithRedirect: signInWithRedirect("github.com"), signInWithPopup: signInWithPopup("github.com")},
  {id: "linkedin.com", signInWithRedirect: signInWithLinkedIn, signInWithPopup: signInWithLinkedIn}
];

export class FirebaseAuthProvider extends React.Component<FirebaseAuthProviderProps, FirebaseAuthProviderState> {

  constructor(props: FirebaseAuthProviderProps){
    super(props);
    let {firebaseConfig} = props;
    setFirebaseConfig(firebaseConfig);
  }

  state : FirebaseAuthProviderState = {
    firebaseToken: null,
    handledRedirect: false,
    existingProviders: null,
    pendingCredential: null,
    existingEmail: null
  };

  login(idToken : string){
    const {postAfterLoginPath} = this.props;
    return postAfterLoginPath 
      ? post(postAfterLoginPath, {idToken}) 
      : new Promise((resolve) => resolve(false));
  }

  updateToken(user, forceRefresh = false){
    return user.getIdToken(forceRefresh)
    .then((firebaseToken) => {
      this.setState({firebaseToken});
      return firebaseToken;
    });
  }

  reauthenticateWithPopup(providerId){
    firebase.auth()
    .currentUser
    .reauthenticateWithPopup(getProvider(providerId))
    .then(this.updateTokenForCurrentUser);
  }

  onAuthStateChanged(user){
    if (user) {
      // this.log(user);
      this.setState({firebaseToken: null});
      if(user.isAnonymous){
        return this.updateToken(user);
      }else{
        return user.getIdToken(true)
          .then(this.login)
          .then(() => this.updateToken(user));
      }
    } else {
      return firebase.auth().signInAnonymously();
    }
  };

  private updateTokenForCurrentUser = () =>
    this.updateToken(firebase.auth().currentUser, true);
  
  private updateEmail = (email) =>
    updateEmail(email)
      .then(this.updateTokenForCurrentUser);

  private updateProfile = (input) =>
    updateProfile(input)
      .then(this.updateTokenForCurrentUser);

  private handleVerifyEmail = (actionCode) =>
    handleVerifyEmail(actionCode)
      .then(this.updateTokenForCurrentUser);

  private handleRecoverEmail = (actionCode) => 
    handleRecoverEmail(actionCode)
      .then(this.updateTokenForCurrentUser);

  private getFirebaseToken = () => this.state.firebaseToken;

  render() {
    const {children} = this.props;
    let {firebaseToken, existingProviders, pendingCredential, existingEmail, handledRedirect} = this.state;

    let mappedExistingProviders : ProviderType[] = null;
    if(existingProviders) mappedExistingProviders = providers.filter(({id} : ProviderType) => existingProviders.includes(id));
    let redirectResult = {existingProviders, pendingCredential, existingEmail};
    let loading = !firebaseToken || !handledRedirect;

    let value : {firebase: FirebaseApi} = {
      firebase: {
        loading,
        providers,
        firebaseToken,
        redirectResult,
        sendVerificationEmailToCurrentUser,
        getFirebaseToken: this.getFirebaseToken,
        updateProfile: this.updateProfile,
        updateEmail: this.updateEmail,       
        handleVerifyEmail: this.handleVerifyEmail,
        handleRecoverEmail: this.handleRecoverEmail,
        updateTokenForCurrentUser: this.updateTokenForCurrentUser,
        // reauthenticateWithPopup: this.reauthenticateWithPopup,
        // signInWithCustomToken: this.signInWithCustomToken,
        // handleExistingAccountError: this.handleExistingAccountError
      }
    };

    return (
      <FirebaseContext.Provider value={{}}>
        {children}
      </FirebaseContext.Provider>
    );
  }
}

