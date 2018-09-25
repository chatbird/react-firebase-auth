import * as React from 'react';
declare type IsAnonymousFnParams = {
    isAnonymous: boolean;
    loading: boolean;
};
declare type IsAnonymousFn = ({ isAnonymous }: IsAnonymousFnParams) => React.ReactNode;
interface IIsAnonymousProps {
    children: IsAnonymousFn | React.ReactNode;
    invert?: boolean;
}
declare const IsAnonymous: (props: IIsAnonymousProps) => JSX.Element;
export default IsAnonymous;
