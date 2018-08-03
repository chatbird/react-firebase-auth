import * as React from 'react';
declare type IsAnonymousFnParams = {
    isAnonymous: boolean;
    loading?: boolean;
};
declare type IsAnonymousFn = ({ isAnonymous, loading }: IsAnonymousFnParams) => React.ReactNode;
interface IIsAnonymousProps {
    children: IsAnonymousFn | React.ReactNode;
    invert?: boolean;
}
declare class IsAnonymous extends React.Component<IIsAnonymousProps> {
    render(): JSX.Element;
    private isAnonymous;
}
export default IsAnonymous;
