import { Component } from "react";
import React from 'react';
import { Page } from "./index";
import { PageLayoutView } from "./layout/render";
import { SelectorView } from "../selector/render/render";
import { ChildsArea } from "../block/base/appear";
import { BlockSelector } from "../plug/block.selector";
import { ReferenceSelector } from "../plug/reference.selector";
import { SelectorMenu } from "../plug/block.menu/menu";
import { TextTool } from "../plug/text.menu/text.tool";
import ReactDOM from "react-dom";
/**
 * mousedown --> mouseup --> click --> mousedown --> mouseup --> click --> dblclick
 * 对于同时支持这4个事件的浏览器，事件执行顺序为focusin > focus > focusout > blur
 * mousedown -> blur -> mouseup -> click
 **/
export class PageView extends Component<{ page: Page }>{
    constructor(props) {
        super(props);
        this.page.viewRender = this;
    }
    get page() {
        return this.props.page;
    }
    private _mousemove;
    private _mouseup;
    private _keyup;
    el: HTMLElement;
    componentDidMount() {
        this.el = ReactDOM.findDOMNode(this) as HTMLElement;
        document.addEventListener('mousemove', (this._mousemove = this.page.onMousemove.bind(this.page)));
        document.addEventListener('mouseup', (this._mouseup = this.page.onMouseup.bind(this.page)));
        document.addEventListener('keyup', (this._keyup = this.page.onKeyup.bind(this.page)));
    }
    componentWillUnmount() {
        document.removeEventListener('mouseup', this._mouseup);
        document.removeEventListener('mousemove', this._mousemove);
        document.removeEventListener('keyup', this._keyup);
    }
    render() {
        var pageStyle: Record<string, any> = {
            lineHeight: this.page.cfm.fontCss.lineHeight + 'px',
            letterSpacing: this.page.cfm.fontCss.letterSpacing + 'px',
            fontSize: this.page.cfm.fontCss.fontSize + 'px'
        }
        return <div className='sy-page-view' style={pageStyle} tabIndex={1}
            onKeyDown={e => this.page.onKeydown(e.nativeEvent)}
            onFocusCapture={e => this.page.onFocusCapture(e.nativeEvent)}
            onBlurCapture={e => this.page.onBlurCapture(e.nativeEvent)}
        ><SelectorView selector={this.page.selector}></SelectorView>
            <PageLayoutView pageLayout={this.page.pageLayout}>
                <div className='sy-page-view-content'
                    onMouseDown={e => this.page.onMousedown(e.nativeEvent)}
                ><ChildsArea childs={this.page.views}></ChildsArea>
                </div>
            </PageLayoutView>
            <div className='sy-page-plugs'>
                <BlockSelector ref={e => this.page.blockSelector = e} page={this.page}></BlockSelector>
                <ReferenceSelector ref={e => this.page.referenceSelector = e} ></ReferenceSelector>
                <SelectorMenu ref={e => this.page.selectorMenu = e} page={this.page}></SelectorMenu>
                <TextTool ref={e => this.page.textTool = e} page={this.page}></TextTool>
            </div>
        </div>
    }
}