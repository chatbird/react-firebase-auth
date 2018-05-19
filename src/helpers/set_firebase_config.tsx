import * as firebase from 'firebase';
import { FirebaseConfigType } from "../types";

const setFirebaseConfig = (firebaseConfig: FirebaseConfigType) => {
    console.log(firebaseConfig);
    console.log(firebase.apps.length);
    if(firebase.apps.length === 0) firebase.initializeApp(firebaseConfig);
  };

export default setFirebaseConfig;