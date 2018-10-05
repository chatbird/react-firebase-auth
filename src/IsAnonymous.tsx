import * as React from 'react'
import FirebaseAuthConsumer from './FirebaseAuthConsumer';

type IsAnonymousFnParams = {
  isAnonymous: boolean,
  loading: boolean
}

type IsAnonymousFn = ({isAnonymous} : IsAnonymousFnParams) => React.ReactNode

interface IIsAnonymousProps{
  children: IsAnonymousFn | React.ReactNode,
  invert?: boolean
}

interface IInnerIsAnonymousProps{
  getCurrentUser: () => Promise<firebase.User>
}

interface IIsAnonymousState{
  loading: boolean,
  isAnonymous?: boolean
}

class InnerIsAnonymous extends React.Component<IIsAnonymousProps & IInnerIsAnonymousProps, IIsAnonymousState>{

  public cancelGetCurrentUser = () => {return};

  public getCurrentUser = () => new Promise<firebase.User>((resolve, reject) => {
    this.cancelGetCurrentUser = reject;
    this.props.getCurrentUser().then(resolve);
  });

  public state = {
    loading: true,
    isAnonymous: undefined
  }

  public componentDidMount(){
    this.getCurrentUser().then((user) => {
      const isAnonymous = !user || user.isAnonymous || user.providerData.length === 0;
      this.setState({isAnonymous, loading: false});
    });
  }

  public componentWillUnmount(){
    this.cancelGetCurrentUser();
  }

  public render(){
    const {children, invert} = this.props;
    const {loading, isAnonymous} = this.state;

    if(typeof children === "function"){
      return children({isAnonymous, loading});
    }else{
      if(!loading && (isAnonymous && !invert || !isAnonymous && invert)){
        return children;
      }
      
      return null;
    }
  }
}

const IsAnonymous = (props : IIsAnonymousProps) => {
  return (
    <FirebaseAuthConsumer>
      {
        ({getCurrentUser}) => {
          return <InnerIsAnonymous getCurrentUser={getCurrentUser} {...props}/>
        }
      }
    </FirebaseAuthConsumer>
  )
}

export default IsAnonymous;