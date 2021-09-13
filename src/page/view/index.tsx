import { Component } from "react";
import React from 'react';
import { Page } from "../index";
import { PageLayoutView } from "../../layout/view";
import { ChildsArea } from "../../block/view/appear";
import { TextTool } from "../../../extensions/text.tool/text.tool";
import ReactDOM from "react-dom";
import { KitView } from "../../kit/view";
/**
 * mousedown --> mouseup --> click --> mousedown --> mouseup --> click --> dblclick
 * 对于同时支持这4个事件的浏览器，事件执行顺序为focusin > focus > focusout > blur
 * mousedown -> blur -> mouseup -> click
 **/
export class PageView extends Component<{ page: Page }>{
    constructor(props) {
        super(props);
        this.page.view = this;
    }
    get page() {
        return this.props.page;
    }
    private _mousedown;
    private _mousemove;
    private _mouseup;
    private _keyup;
    el: HTMLElement;
    componentDidMount() {
        this.el = ReactDOM.findDOMNode(this) as HTMLElement;
        document.addEventListener('mousedown', this._mousedown = this.page.onGlobalMousedown.bind(this));
        document.addEventListener('mousemove', (this._mousemove = this.page.onMousemove.bind(this.page)));
        document.addEventListener('mouseup', (this._mouseup = this.page.onMouseup.bind(this.page)));
        document.addEventListener('keyup', (this._keyup = this.page.onKeyup.bind(this.page)), true);
    }
    componentWillUnmount() {
        document.removeEventListener('mousedown', this._mousedown);
        document.removeEventListener('mouseup', this._mouseup);
        document.removeEventListener('mousemove', this._mousemove);
        document.removeEventListener('keyup', this._keyup, true);
    }
    render() {
        var pageStyle: Record<string, any> = {
            lineHeight: this.page.cfm.fontCss.lineHeight + 'px',
            letterSpacing: this.page.cfm.fontCss.letterSpacing + 'px',
            fontSize: this.page.cfm.fontCss.fontSize + 'px'
        }
        return <div className='shy-page-view' style={pageStyle} tabIndex={1}
            onKeyDownCapture={e => this.page.onKeydown(e.nativeEvent)}
            onFocusCapture={e => this.page.onFocusCapture(e.nativeEvent)}
            onBlurCapture={e => this.page.onBlurCapture(e.nativeEvent)}
        >
            <div className='shy-page-view-box' onMouseDown={e => this.page.onMousedown(e.nativeEvent)}>
                <PageLayoutView pageLayout={this.page.pageLayout}>
                    <div className='shy-page-view-content' ref={e => this.page.contentEl = e}
                    ><ChildsArea childs={this.page.views}></ChildsArea>
                    </div>
                </PageLayoutView>
            </div>
            <div className='shy-page-plugs'>
                <TextTool ref={e => this.page.registerExtension(e)}></TextTool>
            </div>
            <KitView kit={this.page.kit}></KitView>
        </div>
    }
}