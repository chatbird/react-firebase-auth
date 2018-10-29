import * as React from "react";
import setFirebaseConfig from "./helpers/setFirebaseConfig";
import * as firebase from 'firebase/app';
import 'firebase/auth';
import getProvider, { ProviderIdType } from "./helpers/getProvider";
import post from "./helpers/post";
import FirebaseContext from "./FirebaseContext";
import * as appendQuery from "append-query";

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
  user?: firebase.User | null,
  debug?: boolean,
  allowAnonymousSignup?: boolean
}
  
export type FirebaseAuthProviderState = {
  existingProviders: string[],
  existingEmail: string,
  pendingCredential: any,
  loggedIn: boolean
}
  
export type ExistingAccountError = {
  credential: firebase.auth.AuthCredential,
  email: string
}

export interface IFirebaseContext {
  auth: firebase.auth.Auth,
  getFirebaseToken: (forceRefresh?: boolean) => Promise<string>,
  getCurrentUser: () => Promise<firebase.User>,
  hasExistingProviders: boolean,
  providers: ProviderType[],
  handleExistingAccountError: (error: ExistingAccountError) => Promise<any>,
  pendingCredential: any,
  loggedIn: boolean
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
  signInWithRedirect?: () => any,
  signInWithPopup?: () => any
}
  
class FirebaseAuthProvider extends React.Component<FirebaseAuthProviderProps, FirebaseAuthProviderState> {

  constructor(props: FirebaseAuthProviderProps){
    super(props);
    let {firebaseConfig} = props;
    setFirebaseConfig(firebaseConfig);
  }

  state : FirebaseAuthProviderState = {
    existingProviders: null,
    pendingCredential: null,
    existingEmail: null,
    loggedIn: false
  };

  signInWithLinkedIn = (ref = window.location.href) => {
    const url = appendQuery(this.props.linkedInLoginPath, {ref});
    window.location.replace(url);
  };

  providers : ProviderType[] = [
    // {id: "facebook.com", signInWithRedirect: signInWithRedirect("facebook.com"), signInWithPopup: signInWithPopup("facebook.com")},
    // {id: "twitter.com", signInWithRedirect: signInWithRedirect("twitter.com"), signInWithPopup: signInWithPopup("twitter.com")},
    // {id: "github.com", signInWithRedirect: signInWithRedirect("github.com"), signInWithPopup: signInWithPopup("github.com")},
    {id: "google.com", signInWithRedirect: signInWithRedirect("google.com"), signInWithPopup: signInWithPopup("google.com")},
    {id: "linkedin.com", signInWithRedirect: this.signInWithLinkedIn, signInWithPopup: this.signInWithLinkedIn},
    {id: "password"}
  ];

  async componentDidMount(){
    const pendingCredential = await this.getPendingCredential();
    
    try{
      await this.handleRedirect(pendingCredential)
    }catch(error){
      this.log(error);
    }

    this.setAuthStateListener();

    if(this.props.user){
      await firebase.auth().updateCurrentUser(this.props.user);
    }
  }

  getPendingCredential = async () => {
    try{
      return JSON.parse(localStorage.getItem(PENDING_CREDENTIAL_KEY));
    }catch(error){
      return;
    }
  }

  setPendingCredential = async (pendingCredential) => {
    localStorage.setItem(PENDING_CREDENTIAL_KEY, JSON.stringify(pendingCredential));
  }

  removePendingCredential(){
    localStorage.removeItem(PENDING_CREDENTIAL_KEY);
  }

  handleRedirect = async (pendingCredential = null) => {
    try{ 
      const result = await firebase.auth().getRedirectResult();
      const user = result.user;

      if(pendingCredential && user){
        if(pendingCredential.providerId === "linkedin.com"){
          const idToken = await user.getIdToken();
          await this.linkWithLinkedIn(pendingCredential, idToken);
          this.removePendingCredential();
        }else{
          await user.linkAndRetrieveDataWithCredential(pendingCredential);
          this.removePendingCredential();
        }
      }else{
        this.removePendingCredential();
      }
    }catch(error){
      console.log("handledRedirect error");
      this.removePendingCredential();
      if (error.code === 'auth/account-exists-with-different-credential') {
        this.handleExistingAccountError(error);
      }
    }
  };

  handleExistingAccountError = async (error) => {
    const pendingCredential = error.credential;
    const existingEmail = error.email;

    await this.setPendingCredential(pendingCredential);
    let existingProviders = await firebase.auth().fetchProvidersForEmail(existingEmail);
   
    if(existingProviders.length === 0){
      existingProviders = ["linkedin.com"];
    }

    this.setState({existingProviders, pendingCredential, existingEmail});
  };

  login = async (idToken : string) => {
    const {onLogin} = this.props;
    await onLogin(idToken);
    this.setState({loggedIn: true});
  }

  getCurrentUser = () : Promise<firebase.User> => {
    return new Promise((resolve, reject) => {
      if(firebase.auth().currentUser){
        return resolve(firebase.auth().currentUser);
      }

      firebase.auth().onAuthStateChanged(async user => {
        const finalUser = await this.onAuthStateChanged(user, false)
        resolve(finalUser);
      }, reject);
    });
  }

  getToken = async (forceRefresh = false) => {
    const user = await this.getCurrentUser();
    const firebaseToken = await user.getIdToken(forceRefresh);
    return firebaseToken;
  }

  linkWithLinkedIn = async (pendingCredential, idToken) => {
    await post(this.props.linkedInLinkPath, {pendingCredential, idToken});
  }

  onAuthStateChanged = async (user, login = true) => {
    if(user){
      const firebaseToken = await user.getIdToken(login);
      if(login){
        await this.login(firebaseToken);
      }
      return user;
    }else if(this.props.allowAnonymousSignup){
      const userCredential : firebase.auth.UserCredential  = await firebase.auth().signInAnonymously();
      return userCredential.user;
    }
  }

  private log = (message?: any, ...optionalParams: any[]) => 
    this.props.debug ? console.log(message, ...optionalParams) : null;

  private setAuthStateListener = () => {
    return firebase.auth().onAuthStateChanged(this.onAuthStateChanged);
  };

  render() {
    const {children} = this.props;
    let {existingProviders, pendingCredential, loggedIn} = this.state;
    const filteredProviders = existingProviders ? this.providers.filter(({id} : ProviderType) => existingProviders.includes(id)) : this.providers;
    const hasExistingProviders = existingProviders && filteredProviders && filteredProviders.length > 0;

    const value : IFirebaseContext = {
      auth: firebase.auth(),
      getFirebaseToken: this.getToken,
      getCurrentUser: this.getCurrentUser,
      handleExistingAccountError: this.handleExistingAccountError,
      providers: filteredProviders,
      hasExistingProviders,
      pendingCredential,
      loggedIn
    }
    
    return (
      <FirebaseContext.Provider value={value}>
        {children}
      </FirebaseContext.Provider>
    );
  }
}

export default FirebaseAuthProvider;