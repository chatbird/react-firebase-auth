import * as firebase from 'firebase';
import handleRecoverEmail from '../handle_recover_email';

const actionCode = "test";

it('correctly applies the action code', async () => {
    await handleRecoverEmail(actionCode);
    expect(firebase.auth().checkActionCode).toHaveBeenCalledWith(actionCode);
    expect(firebase.auth().applyActionCode).toHaveBeenCalledWith(actionCode);
});