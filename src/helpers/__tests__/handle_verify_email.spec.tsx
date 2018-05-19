import * as firebase from 'firebase';
import handleVerifyEmail from '../handle_verify_email';

const actionCode = "test";

it('correctly applies the action code', () => {
    handleVerifyEmail(actionCode);
    expect(firebase.auth().applyActionCode).toHaveBeenLastCalledWith(actionCode)
});