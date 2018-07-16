import * as firebase from 'firebase/app';
import 'firebase/auth';
export declare type ProviderIdType = "twitter.com" | "facebook.com" | "google.com" | "linkedin.com" | "github.com" | "password";
declare const getProvider: (providerId: Pick<ProviderIdType, number | "big" | "link" | "small" | "strike" | "sub" | "sup" | "fixed" | "repeat" | "slice" | "bold" | "blink" | "replace" | "toString" | "charAt" | "charCodeAt" | "concat" | "indexOf" | "lastIndexOf" | "localeCompare" | "match" | "search" | "split" | "substring" | "toLowerCase" | "toLocaleLowerCase" | "toUpperCase" | "toLocaleUpperCase" | "trim" | "length" | "substr" | "valueOf" | "codePointAt" | "includes" | "endsWith" | "normalize" | "startsWith" | "anchor" | "fontcolor" | "fontsize" | "italics" | "trimLeft" | "trimRight">) => firebase.auth.EmailAuthProvider | firebase.auth.FacebookAuthProvider | firebase.auth.GithubAuthProvider | firebase.auth.GoogleAuthProvider | firebase.auth.TwitterAuthProvider;
export default getProvider;
