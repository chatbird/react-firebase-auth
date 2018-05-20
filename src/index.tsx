import * as React from "react";
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

export type FirebaseConfigType = {
  apiKey: string,
  authDomain: string,
  databaseURL: string,
  projectId: string,
  storageBucket: string,
  messagingSenderId: string
}

export type FirebaseAuthProviderProps = {
  firebaseConfig: FirebaseConfigType,
  children?: any,
  onLogin?: (idToken: string) => any,
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
  auth: (any) => any,
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

const PENDING_CREDENTIAL_KEY = "pendingCredential";

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

    if(customToken) this.log("customToken", customToken);

    if(customToken){
      this.signInWithCustomToken(this.props.customToken)
      .then(this.updateTokenForCurrentUser)
      .then(() => this.setState({handledRedirect: true}));
    }else{
      this.getPendingCredential()
        .then(this.handleRedirect.bind(this))
        .catch(this.handleRedirect.bind(this))
        .then(this.setAuthStateListener.bind(this))
    }
  }

  getPendingCredential(){
    return new Promise((resolve) => {
      resolve(localStorage.getItem(PENDING_CREDENTIAL_KEY));
    });
  }

  setPendingCredential(pendingCredential){
    return new Promise((resolve) => {
      localStorage.setItem(PENDING_CREDENTIAL_KEY, pendingCredential);
      resolve();
    });
  }

  removePendingCredential(){
    localStorage.removeItem(PENDING_CREDENTIAL_KEY);
  }

  signInWithCustomToken(token){
    this.log("signInWithCustomToken token", token);
    return firebase.auth().signInWithCustomToken(token)
      .then((user) => {
        this.log("signInWithCustomToken user", user);
        return this.getPendingCredential()
          .then((pendingCredential) => {
            this.log("signInWithCustomToken pendingCredential", pendingCredential);
            if(pendingCredential){
              return user.linkAndRetrieveDataWithCredential(pendingCredential)
                .then(this.removePendingCredential.bind(this))
                .then(() => user);
            }else{
              return user;
            }
          });
      }).catch(console.warn)
      .then(this.updateTokenForCurrentUser.bind(this))
      .then(this.login.bind(this));
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
            .then(this.login.bind(this))
            .then(this.removePendingCredential.bind(this))
            .then(() => this.setState({handledRedirect: true}));
        }else{
          this.log("Linking with ", pendingCredential.providerId);
          return result.user
            .linkAndRetrieveDataWithCredential(pendingCredential)
            .then(this.removePendingCredential.bind(this))
            .then(this.updateTokenForCurrentUser.bind(this))
            .then(this.login.bind(this))
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
    return this.setPendingCredential(pendingCredential)
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
    const {onLogin} = this.props;
    return new Promise((resolve) => resolve(onLogin(idToken)))
    // return postAfterLoginPath 
    //   ? post(postAfterLoginPath, {idToken}) 
    //   : new Promise((resolve) => resolve(false));
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
      .then(this.updateTokenForCurrentUser.bind(this));
  }

  reauthenticateWithPopup(providerId){
    firebase.auth()
    .currentUser
    .reauthenticateWithPopup(getProvider(providerId))
    .then(this.updateTokenForCurrentUser.bind(this));
  }

  onAuthStateChanged(user){
    if (user) {
      // this.log(user);
      this.setState({firebaseToken: null});
      if(user.isAnonymous){
        return this.updateToken(user);
      }else{
        return user.getIdToken(true)
          .then(this.login.bind(this))
          .then(() => this.updateToken(user));
      }
    } else if(this.props.customToken){
      return this.signInWithCustomToken(this.props.customToken);
    } else {
      this.log("calling signInAnonymously()");
      return firebase.auth().signInAnonymously();
    }
  };

  private log = (message?: any, ...optionalParams: any[]) => 
    this.props.debug ? console.log(message, ...optionalParams) : null;

  private updateTokenForCurrentUser = () =>
    this.updateToken(firebase.auth().currentUser, true);
  
  private updateEmail = (email) =>
    updateEmail(email)
      .then(this.updateTokenForCurrentUser.bind(this));

  private updateProfile = (input) =>
    updateProfile(input)
    .then(this.updateTokenForCurrentUser.bind(this));

  private handleVerifyEmail = (actionCode) =>
    handleVerifyEmail(actionCode)
      .then(this.updateTokenForCurrentUser.bind(this));

  private handleRecoverEmail = (actionCode) => 
    handleRecoverEmail(actionCode)
      .then(this.updateTokenForCurrentUser.bind(this));

  private getFirebaseToken = () => {
    // this.log("firebaseToken", this.state.firebaseToken);
    return this.state.firebaseToken;
  };

  private setAuthStateListener = () => {
    return firebase.auth().onAuthStateChanged(this.onAuthStateChanged.bind(this));
  };

  render() {
    const {children} = this.props;
    let {firebaseToken, existingProviders, pendingCredential, existingEmail, handledRedirect} = this.state;

    let mappedExistingProviders : ProviderType[] = this.providers;
    if(existingProviders) mappedExistingProviders = this.providers.filter(({id} : ProviderType) => existingProviders.includes(id));
    let redirectResult = {existingProviders, pendingCredential, existingEmail};
    let loading = !firebaseToken || !handledRedirect;
    
    let value : {firebase: FirebaseApi} = {
      firebase: {
        auth: firebase.auth,
        loading,
        providers: mappedExistingProviders,
        firebaseToken,
        redirectResult,
        sendVerificationEmailToCurrentUser,
        getFirebaseToken: this.getFirebaseToken.bind(this),
        updateProfile: this.updateProfile.bind(this),
        updateEmail: this.updateEmail.bind(this),       
        handleVerifyEmail: this.handleVerifyEmail.bind(this),
        handleRecoverEmail: this.handleRecoverEmail.bind(this),
        updateTokenForCurrentUser: this.updateTokenForCurrentUser.bind(this),
        reauthenticateWithPopup: this.reauthenticateWithPopup.bind(this),
        signInWithCustomToken: this.signInWithCustomToken.bind(this),
        handleExistingAccountError: this.handleExistingAccountError.bind(this)
      }
    };

    return (
      <FirebaseContext.Provider value={value}>
        {children}
      </FirebaseContext.Provider>
    );
  }
}

