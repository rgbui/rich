import React, { Suspense } from 'react';
import { Spin } from '../view/spin';

/**
 * 动态加载组件
 * @param props 
 * @returns 
 */
export function ACC(props: { C: React.LazyExoticComponent<(new (...args: any[]) => any)>, props?: Record<string, any> }) {
    return <Suspense fallback={<div><Spin block></Spin></div>}>
        <props.C {...(props.props || {})}></props.C>
    </Suspense>
}

