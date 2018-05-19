import * as firebase from 'firebase';

const updateEmail = (email: string) => {
  return new Promise((resolve, reject) => {
    let user = firebase.auth().currentUser;
    if(user) resolve(user.updateEmail(email).then(() => user));
    reject();
  })
};

export default updateEmail;