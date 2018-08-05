import * as React from "react";
import setFirebaseConfig from "./helpers/setFirebaseConfig";
import * as firebase from 'firebase/app';
import 'firebase/auth';
import getProvider, { ProviderIdType } from "./helpers/getProvider";
import post from "./helpers/post";
import FirebaseContext from "./FirebaseContext";
import * as appendQuery from "append-query";
import * as jwtDecode from 'jwt-decode';

const PENDING_CREDENTIAL_KEY = "pendingCredential";

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
  debug?: boolean,
  allowAnonymousSignup?: boolean
}
  
export type FirebaseAuthProviderState = {
  firebaseToken: string,
  handledRedirect: boolean,
  existingProviders: string[],
  existingEmail: string,
  pendingCredential: any
}
  
export type ExistingAccountError = {
  credential: firebase.auth.AuthCredential,
  email: string
}

export interface IFirebaseContext {
  auth: firebase.auth.Auth,
  loading: boolean,
  firebaseToken: string,
  decodedToken: any,
  hasExistingProviders: boolean,
  providers: ProviderType[],
  handleExistingAccountError: (error: ExistingAccountError) => Promise<any>,
  refreshToken: () => Promise<any>
}
  
const signInWithRedirect = (providerId: ProviderIdType) => {
  let provider = getProvider(providerId);
  return () => firebase.auth().signInWithRedirect(provider);
};

const signInWithPopup = (providerId: ProviderIdType) => {
  let provider = getProvider(providerId);
  return () =>  firebase.auth().signInWithPopup(provider);
};
  
export type ProviderType = {
  id: ProviderIdType,
  signInWithRedirect: () => any,
  signInWithPopup: () => any
}
  
class FirebaseAuthProvider extends React.Component<FirebaseAuthProviderProps, FirebaseAuthProviderState> {

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

  signInWithLinkedIn = () => {
    const ref = window.location.pathname;
    const url = appendQuery(this.props.linkedInLoginPath, {ref});
    window.location.replace(url);
  };

  providers : ProviderType[] = [
    {id: "facebook.com", signInWithRedirect: signInWithRedirect("facebook.com"), signInWithPopup: signInWithPopup("facebook.com")},
    {id: "twitter.com", signInWithRedirect: signInWithRedirect("twitter.com"), signInWithPopup: signInWithPopup("twitter.com")},
    // {id: "github.com", signInWithRedirect: signInWithRedirect("github.com"), signInWithPopup: signInWithPopup("github.com")},
    {id: "google.com", signInWithRedirect: signInWithRedirect("google.com"), signInWithPopup: signInWithPopup("google.com")},
    {id: "linkedin.com", signInWithRedirect: this.signInWithLinkedIn, signInWithPopup: this.signInWithLinkedIn}
  ];

  componentDidMount(){
    this.getPendingCredential()
      .then((pendingCredential) => this.handleRedirect(pendingCredential))
      .catch(() => this.handleRedirect())
      .then(this.setAuthStateListener);
  }

  getPendingCredential(){
    return new Promise((resolve, reject) => {
      try{
        resolve(JSON.parse(localStorage.getItem(PENDING_CREDENTIAL_KEY)));
      }catch(error){
        reject();
      }
    });
  }

  setPendingCredential(pendingCredential){
    return new Promise((resolve) => {
      localStorage.setItem(PENDING_CREDENTIAL_KEY, JSON.stringify(pendingCredential));
      resolve();
    });
  }

  removePendingCredential(){
    localStorage.removeItem(PENDING_CREDENTIAL_KEY);
  }

  handleRedirect = (pendingCredential = null) => {
    if(pendingCredential) {
      this.log("handleRedirect with pendingCredential");
      this.log(pendingCredential);
    }

    firebase.auth().getRedirectResult().then((result) => {
      if(result.user) this.log("Redirect Result", result);
      if(pendingCredential && result.user){
        if(pendingCredential.providerId === "linkedin.com"){
          this.log("Linking with linkedin.com");
          result.user.getIdToken()
            .then((idToken) => this.linkWithLinkedIn(pendingCredential, idToken))
            .then(this.removePendingCredential.bind(this))
            .then(() => this.setState({handledRedirect: true}));
        }else{
          this.log("Linking with ", pendingCredential.providerId);
          return result.user
            .linkAndRetrieveDataWithCredential(pendingCredential)
            .then(this.removePendingCredential.bind(this))
            .then(this.refreshToken)
            .then(() => this.setState({handledRedirect: true}));
        }
      }else{
        this.setState({handledRedirect: true});
        this.removePendingCredential();
      }
    }).catch((error) => {
      this.setState({handledRedirect: true});
      let errorMessage = error.message;
      this.log("Error after Redirect", errorMessage);
      this.removePendingCredential();
      this.log("remove old pending credential");
      if (error.code === 'auth/account-exists-with-different-credential') {
        this.handleExistingAccountError(error);
      }
    })
  };

  handleExistingAccountError = (error) => {
    const pendingCredential = error.credential;
    const existingEmail = error.email;

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

  login = (idToken : string) => {
    const {onLogin} = this.props;
    return new Promise((resolve) => resolve(onLogin(idToken)))
  }

  updateToken(user, forceRefresh = false){
    this.log("updateToken called");
    return user.getIdToken(forceRefresh)
    .then((firebaseToken) => {
      this.setState({firebaseToken});
      return firebaseToken;
    });
  }

  linkWithLinkedIn(pendingCredential, idToken){
    return post(this.props.linkedInLinkPath, {pendingCredential, idToken})
      .then(this.refreshToken);
  }

  onAuthStateChanged = (user) => {
    this.log("onAuthStateChanged", user);
    
    if(user){
     return user.getIdToken()
      .then((firebaseToken) => {
        return this.login(firebaseToken).then(() => this.setState({firebaseToken}));
      });
    }else if(this.props.allowAnonymousSignup){
      this.log("calling signInAnonymously()");
      return firebase.auth().signInAnonymously();
    }
  }

  private log = (message?: any, ...optionalParams: any[]) => 
    this.props.debug ? console.log(message, ...optionalParams) : null;

  private refreshToken = () =>
    this.updateToken(firebase.auth().currentUser, true);

  private setAuthStateListener = () => {
    return firebase.auth().onAuthStateChanged(this.onAuthStateChanged);
  };

  render() {
    const {children} = this.props;
    let {firebaseToken, existingProviders, handledRedirect} = this.state;
    const filteredProviders = existingProviders ? this.providers.filter(({id} : ProviderType) => existingProviders.includes(id)) : this.providers;
    const hasExistingProviders = existingProviders && filteredProviders && filteredProviders.length > 0;
    const loading = !firebaseToken || !handledRedirect;
    const decodedToken = firebaseToken ? jwtDecode(firebaseToken) : {};

    const value : IFirebaseContext = {
      auth: firebase.auth(),
      loading,
      firebaseToken,
      decodedToken,
      handleExistingAccountError: this.handleExistingAccountError,
      refreshToken: this.refreshToken,
      providers: filteredProviders,
      hasExistingProviders
    }
    
    return (
      <FirebaseContext.Provider value={value}>
        {children}
      </FirebaseContext.Provider>
    );
  }
}

export default FirebaseAuthProvider;