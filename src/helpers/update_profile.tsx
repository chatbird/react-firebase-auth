import * as firebase from 'firebase';
import updateEmail from './update_email';

type FirebaseProfileFields = {
  displayName: string,
  photoURL: string
};

type ProfileFields = Partial<{
  name: string,
  imageUrl: string,
  email: string
}>;

const updateProfile = ({name: displayName, imageUrl: photoURL, email} : ProfileFields) => {
  return new Promise((resolve, reject) => {
    let user = firebase.auth().currentUser;
    if(user){
      let promise = new Promise((resolve) => resolve());
      if(email) promise = promise.then(() => updateEmail(email));
      let profileFields: FirebaseProfileFields = {displayName: null, photoURL: null};
      if(displayName) profileFields.displayName = displayName;
      if(photoURL) profileFields.photoURL = photoURL;
      promise.then(() => user.updateProfile(profileFields)).then(() => resolve(user));
    }else{
      reject();
    }
  })
};

export default updateProfile;