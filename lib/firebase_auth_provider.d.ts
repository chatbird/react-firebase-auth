/// <reference types="react" />
import * as React from "react";
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
export interface FirebaseApi {
    auth: (any) => any;
    loading?: boolean;
    providers?: any[];
    firebaseToken?: string;
    getFirebaseToken?: Function;
    redirectResult?: any;
    updateProfile?: Function;
    updateEmail?: Function;
    sendVerificationEmailToCurrentUser?: Function;
    handleVerifyEmail?: Function;
    handleRecoverEmail?: Function;
    reauthenticateWithPopup?: Function;
    signInWithCustomToken?: Function;
    updateTokenForCurrentUser?: Function;
    handleExistingAccountError?: Function;
}
export declare type ProviderType = {
    id: string;
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
    signInWithCustomToken(token: any): Promise<any>;
    handleRedirect(pendingCredential: any): void;
    handleExistingAccountError(error: any): Promise<void>;
    login(idToken: string): Promise<{}>;
    updateToken(user: any, forceRefresh?: boolean): any;
    linkWithLinkedIn(pendingCredential: any, idToken: any): Promise<Response>;
    reauthenticateWithPopup(providerId: any): void;
    onAuthStateChanged(user: any): any;
    private log;
    private updateTokenForCurrentUser;
    private updateEmail;
    private updateProfile;
    private handleVerifyEmail;
    private handleRecoverEmail;
    private getFirebaseToken;
    private setAuthStateListener;
    render(): JSX.Element;
}
export default FirebaseAuthProvider;
