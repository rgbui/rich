import React from "react";
import { Block } from "../../block/base";
import { SelectorView } from "./render";
export declare class Bar extends React.Component<{
    selectorView: SelectorView;
}> {
    constructor(props: any);
    el: HTMLElement;
    componentDidMount(): void;
    componentWillUnmount(): void;
    get selector(): import("..").Selector;
    private x;
    private y;
    private isDown;
    onMousedown(event: MouseEvent): void;
    private mousemove;
    private mouseup;
    onMousemove(event: MouseEvent): void;
    onMouseup(event: MouseEvent): Promise<void>;
    hide(): void;
    dragBlock: Block;
    onStart(dragBlock: Block): void;
    dragCopyEle: HTMLElement;
    barEle: HTMLElement;
    render(): JSX.Element;
}
