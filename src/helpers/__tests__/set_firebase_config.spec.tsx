import * as firebase from 'firebase';
import { FirebaseConfigType } from '../../types';
import setFirebaseConfig from '../set_firebase_config';

const demoConfig : FirebaseConfigType = {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    messagingSenderId: "",
    projectId: "",
    storageBucket: ""
  };

beforeEach(() => {
    (firebase.initializeApp as any).mockClear();
});

describe("when firebase has no apps", () => {
    it('calls initializeApp', () => {
        Object.defineProperty(firebase, 'apps', {get: () => []});
        setFirebaseConfig(demoConfig);
        expect(firebase.initializeApp).toHaveBeenCalledWith(demoConfig);
    });
});

describe("when firebase has apps", () => {
    it('does not call initializeApp', () => {
        Object.defineProperty(firebase, 'apps', {get: () => ["has app"] });
        setFirebaseConfig(demoConfig);
        expect(firebase.initializeApp).not.toHaveBeenCalled();
    });
});