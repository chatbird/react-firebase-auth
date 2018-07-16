import * as React from 'react';
import * as firebase from 'firebase/app';
import 'firebase/auth';
interface ICurrentUserProps {
    children: (user: firebase.User) => React.ReactNode | React.ReactNodeArray;
}
declare class CurrentUser extends React.Component<ICurrentUserProps> {
    render(): React.ReactNode;
}
export default CurrentUser;
