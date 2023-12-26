import React from 'react';
import Loadable from 'react-loadable';
import { Spin } from '../view/spin';
export function AsyncComponent(imp: any) {
    return Loadable({
        loader: imp,
        loading: () => {
            return <Spin></Spin>
        }
    })
}