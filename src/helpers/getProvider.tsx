import * as firebase from 'firebase/app';
import 'firebase/auth';
export type ProviderIdType = "twitter.com" | "facebook.com" | "google.com" | "linkedin.com" | "github.com" | "password";

const getProvider = (providerId : Omit<ProviderIdType, "linkedin.com">) => {  
  if (providerId === "twitter.com"){
    return new firebase.auth.TwitterAuthProvider();
  } else if (providerId === "facebook.com"){
    return new firebase.auth.FacebookAuthProvider();
  } else if (providerId === "google.com") {
    return new firebase.auth.GoogleAuthProvider();
  } else if (providerId === "github.com"){
    return new firebase.auth.GithubAuthProvider();
  } else if (providerId === "password"){
    return new firebase.auth.EmailAuthProvider();
  }
};

export default getProvider;