import { Component } from "react";
import { Page } from "./index";
/**
 * mousedown --> mouseup --> click --> mousedown --> mouseup --> click --> dblclick
 * 对于同时支持这4个事件的浏览器，事件执行顺序为focusin > focus > focusout > blur
 * mousedown -> blur -> mouseup -> click
 **/
export declare class PageView extends Component<{
    page: Page;
}> {
    constructor(props: any);
    get page(): Page;
    private _mousemove;
    private _mouseup;
    private _keyup;
    el: HTMLElement;
    componentDidMount(): void;
    componentWillUnmount(): void;
    render(): JSX.Element;
}
