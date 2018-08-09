import * as React from 'react'
import FirebaseAuthConsumer from './FirebaseAuthConsumer';

type IsAnonymousFnParams = {
  isAnonymous: boolean,
  loading?: boolean
}

type IsAnonymousFn = ({isAnonymous, loading} : IsAnonymousFnParams) => React.ReactNode

interface IIsAnonymousProps{
  children: IsAnonymousFn | React.ReactNode,
  invert?: boolean
}

class IsAnonymous extends React.Component<IIsAnonymousProps>{
  public render(){

    const {children, invert} = this.props;

    if(typeof children === "function"){
      return (
        <FirebaseAuthConsumer>
          {
            ({decodedToken, loading}) => children({isAnonymous: this.isAnonymous(decodedToken), loading})
          }
        </FirebaseAuthConsumer>
      )
    }else{
      return (
        <FirebaseAuthConsumer>
          {
            ({decodedToken}) => {
              const isAnonymous = this.isAnonymous(decodedToken);

              if(isAnonymous && !invert || !isAnonymous && invert){
                return children;
              }
              
              return null;
            }
          }
        </FirebaseAuthConsumer>
      )
    }
  }

  private isAnonymous(decodedToken){
    const isAnonymous = !decodedToken || decodedToken.provider_id === "anonymous";
    return isAnonymous;
  }
}

export default IsAnonymous;