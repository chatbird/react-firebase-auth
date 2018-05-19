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
import localforage from 'localforage';

const FirebaseContext = React.createContext(null);

export type FirebaseAuthProviderProps = {
  firebaseConfig: FirebaseConfigType,
  children?: any,
  postAfterLoginPath?: string,
  linkedInLinkPath?: string,
  linkedInLoginPath?: string,
  customToken?: string,
  debug?: boolean
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

export type ProviderType = {
  id: string,
  signInWithRedirect: () => any,
  signInWithPopup: () => any
}

export const FirebaseAuthConsumer = FirebaseContext.Consumer;

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

  providers : ProviderType[] = [
    {id: "facebook.com", signInWithRedirect: signInWithRedirect("facebook.com"), signInWithPopup: signInWithPopup("facebook.com")},
    {id: "twitter.com", signInWithRedirect: signInWithRedirect("twitter.com"), signInWithPopup: signInWithPopup("twitter.com")},
    {id: "github.com", signInWithRedirect: signInWithRedirect("github.com"), signInWithPopup: signInWithPopup("github.com")},
    {id: "linkedin.com", signInWithRedirect: signInWithLinkedIn, signInWithPopup: signInWithLinkedIn}
  ];

  signInWithLinkedIn = () => window.location.replace(this.props.linkedInLoginPath);

  componentDidMount(){
    const {customToken} = this.props;
    if(customToken){
      firebase.auth().signOut()
        .then(this.setAuthStateListener)
        .then(() => this.signInWithCustomToken(customToken))
        .then(this.handleRedirect)
    }else{
      localforage.getItem('pendingCredential')
        .then(this.handleRedirect)
        .catch(this.handleRedirect)
        .then(this.setAuthStateListener)
    }
  }

  signInWithCustomToken(token){
    this.log("signInWithCustomToken token", token);
    return firebase.auth().signInWithCustomToken(token)
      .then((user) => {
        this.log("signInWithCustomToken user", user);
        return localforage.getItem('pendingCredential')
          .then((pendingCredential) => {
            this.log("signInWithCustomToken pendingCredential", pendingCredential);
            if(pendingCredential){
              return user.linkAndRetrieveDataWithCredential(pendingCredential)
                .then(() => localforage.removeItem('pendingCredential'))
                .then(() => user);
            }else{
              return user;
            }
          });
      }).catch()
      .then(this.updateTokenForCurrentUser)
      .then(this.login);
  };

  handleRedirect(pendingCredential){
    if(pendingCredential) this.log("handleRedirect with pendingCredential", pendingCredential);

    firebase.auth().getRedirectResult().then((result) => {
      if(result.user) this.log("Redirect Result", result);
      if(pendingCredential && result.user){
        if(pendingCredential.providerId === "linkedin.com"){
          this.log("Linking with linkedin.com");
          result.user.getIdToken()
            .then((idToken) => this.linkWithLinkedIn(pendingCredential, idToken))
            .then(this.login)
            .then(() => localforage.removeItem('pendingCredential'))
            .then(() => this.setState({handledRedirect: true}));
        }else{
          this.log("Linking with ", pendingCredential.providerId);
          return result.user
            .linkAndRetrieveDataWithCredential(pendingCredential)
            .then(() => localforage.removeItem('pendingCredential'))
            .then(this.updateTokenForCurrentUser)
            .then(this.login)
            .then(() => this.setState({handledRedirect: true}));
        }
      }else{
        this.setState({handledRedirect: true});
      }
    }).catch((error) => {
      this.setState({handledRedirect: true});
      let errorMessage = error.message;
      this.log("Error after Redirect", errorMessage);
      if (error.code === 'auth/account-exists-with-different-credential') {
        this.handleExistingAccountError(error);
      }
    })
  };

  handleExistingAccountError(error){
    let pendingCredential = error.credential;
    let existingEmail = error.email;

    this.log("handleExistingAccountError", error);
    return localforage.setItem('pendingCredential', pendingCredential)
      .then(() => {
        this.log("fetching providers for existingEmail", existingEmail);
        return firebase.auth().fetchProvidersForEmail(existingEmail);
      })
      .then((existingProviders) => {
        if(existingProviders.length === 0) existingProviders = ["linkedin.com"];
        this.log("fetched existingProviders", existingProviders);
        this.setState({existingProviders, pendingCredential, existingEmail});
      });
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

  linkWithLinkedIn(pendingCredential, idToken){
    return post(this.props.linkedInLinkPath, {pendingCredential, idToken})
      .then(this.updateTokenForCurrentUser);
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

  private log = (message?: any, ...optionalParams: any[]) => 
    this.props.debug ? console.log(message, ...optionalParams) : null;

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

  private setAuthStateListener = () => {
    firebase.auth().onAuthStateChanged(this.onAuthStateChanged);
  };

  render() {
    const {children} = this.props;
    let {firebaseToken, existingProviders, pendingCredential, existingEmail, handledRedirect} = this.state;

    let mappedExistingProviders : ProviderType[] = null;
    if(existingProviders) mappedExistingProviders = this.providers.filter(({id} : ProviderType) => existingProviders.includes(id));
    let redirectResult = {existingProviders, pendingCredential, existingEmail};
    let loading = !firebaseToken || !handledRedirect;

    let value : {firebase: FirebaseApi} = {
      firebase: {
        loading,
        providers: this.providers,
        firebaseToken,
        redirectResult,
        sendVerificationEmailToCurrentUser,
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

    return (
      <FirebaseContext.Provider value={value}>
        {children}
      </FirebaseContext.Provider>
    );
  }
}

