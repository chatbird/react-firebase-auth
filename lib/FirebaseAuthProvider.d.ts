import * as React from "react";
import * as firebase from 'firebase/app';
import 'firebase/auth';
import { ProviderIdType } from "./helpers/getProvider";
export declare type FirebaseConfigType = {
    apiKey: string;
    authDomain: string;
    databaseURL: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
};
export declare type FirebaseAuthProviderProps = {
    firebaseConfig: FirebaseConfigType;
    children?: any;
    onLogin?: (idToken: string) => any;
    linkedInLinkPath?: string;
    linkedInLoginPath?: string;
    customToken?: string;
    debug?: boolean;
    allowAnonymousSignup?: boolean;
};
export declare type FirebaseAuthProviderState = {
    firebaseToken: string;
    handledRedirect: boolean;
    existingProviders: string[];
    existingEmail: string;
    pendingCredential: any;
};
export declare type ExistingAccountError = {
    credential: firebase.auth.AuthCredential;
    email: string;
};
export interface IFirebaseContext {
    auth: firebase.auth.Auth;
    loading: boolean;
    firebaseToken: string;
    decodedToken: any;
    hasExistingProviders: boolean;
    providers: ProviderType[];
    handleExistingAccountError: (error: ExistingAccountError) => Promise<any>;
    refreshToken: () => Promise<any>;
}
export declare type ProviderType = {
    id: ProviderIdType;
    signInWithRedirect: () => any;
    signInWithPopup: () => any;
};
declare class FirebaseAuthProvider extends React.Component<FirebaseAuthProviderProps, FirebaseAuthProviderState> {
    constructor(props: FirebaseAuthProviderProps);
    state: FirebaseAuthProviderState;
    signInWithLinkedIn: () => void;
    providers: ProviderType[];
    componentDidMount(): void;
    getPendingCredential(): Promise<{}>;
    setPendingCredential(pendingCredential: any): Promise<{}>;
    removePendingCredential(): void;
    handleRedirect: (pendingCredential?: any) => void;
    handleExistingAccountError: (error: any) => Promise<void>;
    login: (idToken: string) => Promise<{}>;
    updateToken(user: any, forceRefresh?: boolean): any;
    linkWithLinkedIn(pendingCredential: any, idToken: any): Promise<any>;
    onAuthStateChanged: (user: any) => any;
    private log;
    private refreshToken;
    private setAuthStateListener;
    render(): JSX.Element;
}
export default FirebaseAuthProvider;
