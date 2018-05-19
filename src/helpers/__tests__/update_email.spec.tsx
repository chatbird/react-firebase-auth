import * as firebase from 'firebase';
import updateEmail from '../update_email';

const email = "test@email.dev";
let currentUser = firebase.auth().currentUser;

it('correctly resolves to the current user', async () => {
    expect(updateEmail(email)).resolves.toEqual(currentUser);
});

it('calls the updateEmail method on firebase user with the email', async () => {
    expect(currentUser.updateEmail).toHaveBeenLastCalledWith(email);
});