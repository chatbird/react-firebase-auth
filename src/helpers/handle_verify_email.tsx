import * as firebase from 'firebase';

const handleVerifyEmail = (actionCode: string) => firebase.auth().applyActionCode(actionCode);

export default handleVerifyEmail;