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
    user?: firebase.User | null;
    debug?: boolean;
    allowAnonymousSignup?: boolean;
};
export declare type FirebaseAuthProviderState = {
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
    getFirebaseToken: () => Promise<string>;
    getCurrentUser: () => Promise<firebase.User>;
    hasExistingProviders: boolean;
    providers: ProviderType[];
    handleExistingAccountError: (error: ExistingAccountError) => Promise<any>;
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
    componentDidMount(): Promise<void>;
    getPendingCredential: () => Promise<any>;
    setPendingCredential: (pendingCredential: any) => Promise<void>;
    removePendingCredential(): void;
    handleRedirect: (pendingCredential?: any) => Promise<void>;
    handleExistingAccountError: (error: any) => Promise<void>;
    login: (idToken: string) => Promise<any>;
    getCurrentUser: () => Promise<firebase.User>;
    getToken: (forceRefresh?: boolean) => Promise<string>;
    linkWithLinkedIn: (pendingCredential: any, idToken: any) => Promise<void>;
    onAuthStateChanged: (user: any) => Promise<firebase.auth.UserCredential>;
    private log;
    private setAuthStateListener;
    private getFirebaseToken;
    render(): JSX.Element;
}
export default FirebaseAuthProvider;
