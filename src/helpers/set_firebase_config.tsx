import * as firebase from 'firebase';
import { FirebaseConfigType } from "../types";

const setFirebaseConfig = (firebaseConfig: FirebaseConfigType) => {
    if(!firebase.apps.length) firebase.initializeApp(firebaseConfig);
  };

export default setFirebaseConfig;