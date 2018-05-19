import * as firebase from 'firebase';
import sendVerificationEmailToCurrentUser from '../send_verification_email_to_current_user';

const redirectUrl = "some/redirect/url";
let currentUser = firebase.auth().currentUser;

it('correctly resolves to the current user', async () => {
    expect(sendVerificationEmailToCurrentUser(redirectUrl)).resolves.toEqual(currentUser);
});

it('calls the sendEmailVerification method on firebase user with the redirectUrl', async () => {
    sendVerificationEmailToCurrentUser(redirectUrl);
    expect(currentUser.sendEmailVerification).toHaveBeenLastCalledWith({url: redirectUrl});
});