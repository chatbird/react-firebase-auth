import * as firebase from 'firebase/app';
import 'firebase/auth';
export declare type ProviderIdType = "twitter.com" | "facebook.com" | "google.com" | "linkedin.com" | "github.com" | "password";
declare const getProvider: (providerId: Pick<ProviderIdType, number | "toString" | "charAt" | "charCodeAt" | "concat" | "indexOf" | "lastIndexOf" | "localeCompare" | "match" | "replace" | "search" | "slice" | "split" | "substring" | "toLowerCase" | "toLocaleLowerCase" | "toUpperCase" | "toLocaleUpperCase" | "trim" | "length" | "substr" | "valueOf" | "codePointAt" | "includes" | "endsWith" | "normalize" | "repeat" | "startsWith" | "anchor" | "big" | "blink" | "bold" | "fixed" | "fontcolor" | "fontsize" | "italics" | "link" | "small" | "strike" | "sub" | "sup" | "trimLeft" | "trimRight">) => firebase.auth.TwitterAuthProvider | firebase.auth.FacebookAuthProvider | firebase.auth.GoogleAuthProvider | firebase.auth.GithubAuthProvider | firebase.auth.EmailAuthProvider;
export default getProvider;
