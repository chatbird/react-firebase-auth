import * as firebase from 'firebase';

const handleRecoverEmail = (actionCode: string) => {
    let restoredEmail = null;
    return firebase.auth().checkActionCode(actionCode).then((info) => {
      restoredEmail = info['data']['email']
      return firebase.auth().applyActionCode(actionCode);
    });
  };
  
export default handleRecoverEmail;