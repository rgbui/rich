import React from "react";
import { Block } from "../../block";
import { SelectorView } from "./render";
export declare class Bar extends React.Component<{
    selectorView: SelectorView;
}> {
    constructor(props: any);
    el: HTMLElement;
    componentDidMount(): void;
    componentWillUnmount(): void;
    get selector(): import("..").Selector;
    private point;
    isDown: Boolean;
    isDrag: boolean;
    private onMousedown;
    private mousemove;
    private mouseup;
    private onMousemove;
    private onMouseup;
    hide(): void;
    dragBlock: Block;
    onStart(dragBlock: Block): void;
    private dragCopyEle;
    private barEle;
    render(): JSX.Element;
}
