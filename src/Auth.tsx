import * as React from 'react';
import * as firebase from 'firebase/app';
import 'firebase/auth';

export type AuthType = firebase.auth.Auth;

interface IAuthProps{
  children: (auth : AuthType) => React.ReactChild;
}

class Auth extends React.Component<IAuthProps>{

  public render(){
    return this.props.children(firebase.auth());
  }
}

export default Auth;