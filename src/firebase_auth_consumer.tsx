import * as React from "react";
import FirebaseContext from "./firebase_context";

const FirebaseAuthConsumer = ({children}) => (
    <FirebaseContext.Consumer>
      {value => children(value)}
    </FirebaseContext.Consumer>
  ); 
  
export default FirebaseAuthConsumer;