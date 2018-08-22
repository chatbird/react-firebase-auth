import * as firebase from 'firebase';
import { FirebaseConfigType } from '..';

const setFirebaseConfig = (firebaseConfig: FirebaseConfigType) => {
    if(firebase.apps.length === 0) firebase.initializeApp(firebaseConfig);
  };

export default setFirebaseConfig;