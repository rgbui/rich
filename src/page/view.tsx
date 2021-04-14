import { Component } from "react";
import React from 'react';
import { Page } from "./index";
import { PageLayoutView } from "./layout/render";
import { SelectorView } from "../selector/render/render";
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
    componentDidMount() {
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
            lineHeight: this.page.config.lineHeight + 'px',
            letterSpacing: this.page.config.letterSpaceing + 'px',
            fontSize: this.page.config.fontSize + 'px'
        }
        return <div className='sy-page-view' style={pageStyle} tabIndex={1}
            onKeyDown={e => this.page.onKeydown(e.nativeEvent)}
            onFocusCapture={e => this.page.onFocusCapture(e.nativeEvent)}
            onBlurCapture={e => this.page.onBlurCapture(e.nativeEvent)}
        >
            <PageLayoutView pageLayout={this.page.pageLayout}>
                <SelectorView selector={this.page.selector}></SelectorView>
                <div className='sy-page-view-content'
                    onMouseDown={e => this.page.onMousedown(e.nativeEvent)}
                >
                    {this.page.views.map(x => <x.viewComponent key={x.id} block={x} />)}
                </div>
            </PageLayoutView>
        </div>
    }
}