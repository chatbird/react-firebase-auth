import * as firebase from 'firebase';

const getProvider = (providerId : string) => {  
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