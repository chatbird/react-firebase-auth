import * as React from 'react';
import * as firebase from 'firebase/app';
import 'firebase/auth';
export declare type AuthType = firebase.auth.Auth;
interface IAuthProps {
    children: (auth: AuthType) => React.ReactChild;
}
declare class Auth extends React.Component<IAuthProps> {
    render(): React.ReactChild;
}
export default Auth;
