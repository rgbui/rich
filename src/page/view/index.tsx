import { Component } from "react";
import React from 'react';
import { Page } from "../index";
import { PageLayoutView } from "../../layout/view";
import { ChildsArea } from "../../block/view/appear";
import ReactDOM from "react-dom";
import { KitView } from "../../kit/view";
import { PageLayoutType } from "../../layout/declare";
import { getBoardTool } from "../../../extensions/board.tool";
import { Point } from "../../common/point";
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
    private _keydown;
    private _wheel;
    el: HTMLElement;
    componentDidMount() {
        this.el = ReactDOM.findDOMNode(this) as HTMLElement;
        this.observeOutsideDrop();
        this.el.addEventListener('keydown', (this._keydown = e => this.page.onKeydown(e)), true);
        this.el.addEventListener('wheel', this._wheel = e => this.page.onWheel(e), { passive: true });
        document.addEventListener('mousedown', this._mousedown = this.page.onGlobalMousedown.bind(this));
        document.addEventListener('mousemove', (this._mousemove = this.page.onMousemove.bind(this.page)));
        document.addEventListener('mouseup', (this._mouseup = this.page.onMouseup.bind(this.page)));
        document.addEventListener('keyup', (this._keyup = this.page.onKeyup.bind(this.page)), true);
        this.observeToolBoard();
    }
    async observeToolBoard() {
        if (this.page.pageLayout.type == PageLayoutType.board) {
            var toolBoard = await getBoardTool();
            toolBoard.open(Point.from(this.el.getBoundingClientRect()));
        }
        else {
            var toolBoard = await getBoardTool();
            toolBoard.close();
        }
    }
    observeOutsideDrop() {
        var isMove: boolean = false;
        var self = this;
        var handle = self.page.kit.handle;
        this.el.shy_drop_move = function (type, data) {
            if (!isMove) {
                switch (type) {
                    case 'pageItem':
                        handle.isDown = true;
                        handle.isDrag = true;
                        break;
                }
                isMove = true;
            }
        }
        this.el.shy_drop_over = async function (type, data) {
            if (isMove) {
                switch (type) {
                    case 'pageItem':
                        if (handle.dropBlock) {
                            var ds = Array.isArray(data) ? data : [data];
                            await self.page.onBatchDargCreateBlocks(ds.map(d => {
                                return {
                                    url: '/link',
                                    icon: d.icon,
                                    pageId: d.id,
                                    sn: d.sn,
                                    text: d.text
                                }
                            }), handle.dropBlock, handle.dropDirection)
                            handle.onDropEnd();
                        }
                        break;
                }
            }
        }
        this.el.shy_end = function () {
            isMove = false;
            handle.onDropEnd();
        }
    }
    componentWillUnmount() {
        this.el.removeEventListener('keydown', this._keydown, true);
        document.removeEventListener('mousedown', this._mousedown);
        document.removeEventListener('mouseup', this._mouseup);
        document.removeEventListener('mousemove', this._mousemove);
        document.removeEventListener('keyup', this._keyup, true);
        document.removeEventListener('wheel', this._wheel)
        delete this.el.shy_drop_move;
        delete this.el.shy_drop_over;
        delete this.el.shy_end;
    }
    firstCreatedRender() {
        return <div className="shy-page-view-first">
            <div onMouseDown={e => this.page.onPageTurnLayout(PageLayoutType.doc)}><span>页面</span></div>
            <div onMouseDown={e => this.page.onPageTurnLayout(PageLayoutType.db)}><span>表格</span></div>
            <div onMouseDown={e => this.page.onPageTurnLayout(PageLayoutType.board)}><span>白板</span></div>
        </div>
    }
    render() {
        var pageStyle: Record<string, any> = {
            lineHeight: this.page.cfm.fontCss.lineHeight + 'px',
            letterSpacing: this.page.cfm.fontCss.letterSpacing + 'px',
            fontSize: this.page.cfm.fontCss.fontSize + 'px'
        }
        return <div className={'shy-page-view' + (this.page.readonly ? " shy-page-view-readonly" : "")} style={pageStyle} tabIndex={1}
            onFocusCapture={e => this.page.onFocusCapture(e.nativeEvent)}
            onBlurCapture={e => this.page.onBlurCapture(e.nativeEvent)}
        ><div className='shy-page-view-box' onMouseDown={e => this.page.onMousedown(e.nativeEvent)}>
                <PageLayoutView pageLayout={this.page.pageLayout}>
                    <div className='shy-page-view-content' ref={e => this.page.contentEl = e}>
                        <ChildsArea childs={this.page.views}></ChildsArea>
                        {this.page.firstCreated && this.firstCreatedRender()}
                    </div>
                </PageLayoutView>
            </div>
            <KitView kit={this.page.kit}></KitView>
        </div>
    }
}