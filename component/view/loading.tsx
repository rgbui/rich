import React, { CSSProperties } from "react";
import { Spin } from "./spin";
export function Loading(props: { children?: React.ReactNode, style?: CSSProperties }) {
    return <Spin></Spin>
}