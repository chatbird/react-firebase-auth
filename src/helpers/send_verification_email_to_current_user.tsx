import * as firebase from 'firebase';

const sendVerificationEmailToCurrentUser = (url: string) => {
  return new Promise((resolve, reject) => {
    let user = firebase.auth().currentUser;
    if(user) resolve(user.sendEmailVerification({url}).then(() => user));
    reject();
  })
};

export default sendVerificationEmailToCurrentUser;