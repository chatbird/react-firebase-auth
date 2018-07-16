import * as React from 'react';
import * as firebase from 'firebase/app';
import 'firebase/auth';

interface ICurrentUserProps{
  children: (user : firebase.User) => React.ReactNode | React.ReactNodeArray;
}

class CurrentUser extends React.Component<ICurrentUserProps>{

  public render(){
    const user = firebase.auth().currentUser;
    return this.props.children(user);
  }

}

export default CurrentUser;