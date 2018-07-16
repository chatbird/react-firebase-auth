import * as React from "react";
import FirebaseContext from "./FirebaseContext";

const FirebaseAuthConsumer = ({children}) => (
    <FirebaseContext.Consumer>
      {value => children(value)}
    </FirebaseContext.Consumer>
  ); 
  
export default FirebaseAuthConsumer;