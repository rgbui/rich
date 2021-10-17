import React from 'react';
import Loadable from 'react-loadable';
export function AsyncComponent(imp: any) {
    return Loadable({
        loader: imp,
        loading: () => {
            return <div></div>
        }
    })
}