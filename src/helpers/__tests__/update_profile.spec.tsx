import * as firebase from 'firebase';
import updateEmail from '../update_email';
import updateProfile from '../update_profile';
jest.mock('../update_email');

const displayName = "Max Mustermann";
const photoURL = "some/photo/url";
const email = "test@test.dev"

const currentUser = firebase.auth().currentUser;
currentUser.updateEmail = updateEmail;

it('correctly resolves to the current user', async () => {
    expect(updateProfile({name: displayName, imageUrl: photoURL, email})).resolves.toEqual(currentUser);
});

it('calls the updateEmail method on firebase user with the email', async () => {
    await updateProfile({name: displayName, imageUrl: photoURL, email});
    expect(currentUser.updateEmail).toHaveBeenCalledWith(email);
});

it('calls the updateProfile method on firebase user with the displayName and photoURL', async () => {
    await updateProfile({name: displayName, imageUrl: photoURL, email});
    expect(currentUser.updateProfile).toHaveBeenCalledWith({displayName, photoURL});
});