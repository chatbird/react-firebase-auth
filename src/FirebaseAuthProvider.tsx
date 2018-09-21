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
  user?: firebase.User | null,
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
  getFirebaseToken: () => Promise<String | null>,
  tokenExpired: boolean,
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
          this.setState({handledRedirect: true});
        }else{
          await user.linkAndRetrieveDataWithCredential(pendingCredential);
          this.removePendingCredential();
          this.refreshToken();
          this.setState({handledRedirect: true});
        }
      }else{
        this.removePendingCredential();
        this.setState({handledRedirect: true});
      }
    }catch(error){
      this.setState({handledRedirect: true});
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
    return await onLogin(idToken);
  }

  updateToken = async (user, forceRefresh = false) => {
    const firebaseToken = await user.getIdToken(forceRefresh);
    this.setState({firebaseToken});
    return firebaseToken;
  }

  linkWithLinkedIn = async (pendingCredential, idToken) => {
    await post(this.props.linkedInLinkPath, {pendingCredential, idToken});
    this.refreshToken();
  }

  onAuthStateChanged = async (user) => {
    if(user){
      const firebaseToken = await user.getIdToken();
      await this.login(firebaseToken);
      return this.setState({firebaseToken});
    }else if(this.props.allowAnonymousSignup){
      return firebase.auth().signInAnonymously();
    }
  }

  private log = (message?: any, ...optionalParams: any[]) => 
    this.props.debug ? console.log(message, ...optionalParams) : null;

  private refreshToken = () => this.updateToken(firebase.auth().currentUser, true);

  private setAuthStateListener = () => {
    return firebase.auth().onAuthStateChanged(this.onAuthStateChanged);
  };

  private getFirebaseToken = async () : Promise<String | null> => {
    if(this.isTokenExpired()){
      return await this.refreshToken();
    }
    return this.state.firebaseToken;
  }

  private getDecodedToken = () => {
    const {firebaseToken} = this.state;
    return firebaseToken ? jwtDecode(firebaseToken) : {};
  }

  private isTokenExpired = () => {
    const decodedToken = this.getDecodedToken();
    const current_time = new Date().getTime() / 1000;
    return decodedToken.exp ? current_time > decodedToken.exp : true;
  }

  render() {
    const {children} = this.props;
    let {firebaseToken, existingProviders, handledRedirect} = this.state;
    const filteredProviders = existingProviders ? this.providers.filter(({id} : ProviderType) => existingProviders.includes(id)) : this.providers;
    const hasExistingProviders = existingProviders && filteredProviders && filteredProviders.length > 0;
    const loading = !firebaseToken || !handledRedirect;
    const decodedToken = this.getDecodedToken();

    const value : IFirebaseContext = {
      auth: firebase.auth(),
      loading,
      firebaseToken,
      getFirebaseToken: this.getFirebaseToken,
      tokenExpired: this.isTokenExpired(),
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