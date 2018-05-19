/// <reference types="react" />
import * as React from "react";
import { FirebaseConfigType } from "./types";
export declare type FirebaseAuthProviderProps = {
    firebaseConfig: FirebaseConfigType;
    children?: any;
    postAfterLoginPath?: string;
    linkedInLinkPath?: string;
    linkedInLoginPath?: string;
    customToken?: string;
    debug?: boolean;
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
export declare const FirebaseAuthConsumer: React.ComponentType<React.ConsumerProps<any>>;
export declare class FirebaseAuthProvider extends React.Component<FirebaseAuthProviderProps, FirebaseAuthProviderState> {
    state: FirebaseAuthProviderState;
    providers: ProviderType[];
    signInWithLinkedIn: () => void;
    componentDidMount(): void;
    signInWithCustomToken(token: any): Promise<any>;
    handleRedirect(pendingCredential: any): void;
    handleExistingAccountError(error: any): any;
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
