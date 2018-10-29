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
  getCurrentUser: () => Promise<firebase.User>,
  loggedIn: boolean
}

interface IIsAnonymousState{
  loading: boolean,
  isAnonymous?: boolean
}

class InnerIsAnonymous extends React.Component<IIsAnonymousProps & IInnerIsAnonymousProps, IIsAnonymousState>{

  public mounted = false; 

  public state = {
    loading: true,
    isAnonymous: undefined
  }

  public componentDidMount(){
    this.mounted = true;
    this.checkState()
  }

  public componentWillUnmount(){
    this.mounted = false;
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

  private checkState = async () => {
    const user = await this.props.getCurrentUser();
    const isAnonymous = !user || user.isAnonymous;
    if(this.mounted){
      this.setState({isAnonymous, loading: false});
    }
  }
}

const IsAnonymous = (props : IIsAnonymousProps) => {
  return (
    <FirebaseAuthConsumer>
      {
        ({getCurrentUser, loggedIn}) => {
          return <InnerIsAnonymous getCurrentUser={getCurrentUser} loggedIn={loggedIn} {...props}/>
        }
      }
    </FirebaseAuthConsumer>
  )
}

export default IsAnonymous;