import { Component } from "react";
import React from 'react';
import { Page } from "../index";
import { ChildsArea } from "../../block/view/appear";
import ReactDOM from "react-dom";
import { KitView } from "../../kit/view";
import { PageLayoutType } from "../declare";
import { BlockChildKey, BlockUrlConstant } from "../../block/constant";
import { PageLayoutView } from "./layout";
import { channel } from "../../../net/channel";
import { LinkPageItem } from "../../../extensions/at/declare";
import { PageCover } from "./cover";
import { Icon } from "../../../component/view/icon";
import {
    BoardIconSvg,
    BoardToolFrameSvg,
    CollectTableSvg,
    DocCardsSvg,
    PageSvg
} from "../../../component/svgs";
import { dom } from "../../common/dom";
import { PageOutLine } from "../../../blocks/page/outline";
import { ActionDirective } from "../../history/declare";
import { Block } from "../../block";
import { PageDirective } from "../directive";
import { PageBar } from "./bar";

/**
 * mousedown --> mouseup --> click --> mousedown --> mouseup --> click --> dblclick
 * 对于同时支持这4个事件的浏览器，事件执行顺序为focusin > focus > focusout > blur
 * mousedown -> blur->mouseup->click
 * 
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
    private _paste;
    el: HTMLElement;
    componentDidMount() {
        this.didMounted();
    }
    async didMounted() {
        this.el = ReactDOM.findDOMNode(this) as HTMLElement;
        channel.sync('/page/update/info', this.updatePageInfo);
        this.observeScroll();
        this.observeOutsideDrop();
        this.el.addEventListener('keydown', (this._keydown = e => this.page.onKeydown(e)), true);
        this.el.addEventListener('wheel', this._wheel = e => this.page.onWheel(e), {
            passive: false
        });
        document.addEventListener('mousedown', this._mousedown = this.page.onGlobalMousedown.bind(this));
        document.addEventListener('mousemove', (this._mousemove = this.page.onMousemove.bind(this.page)));
        document.addEventListener('mouseup', (this._mouseup = this.page.onMouseup.bind(this.page)));
        document.addEventListener('keyup', (this._keyup = this.page.onKeyup.bind(this.page)), true);
        document.addEventListener('paste', this._paste = e => this.page.onPaste(e))
        await this.AutomaticHandle();
        this.page.emit(PageDirective.mounted)
    }
    updatePageInfo = (r: { id: string, elementUrl: string, pageInfo: LinkPageItem }) => {
        if (r.elementUrl && this.page.elementUrl === r.elementUrl || r.id && r.id == r.pageInfo.id) {
            if (this.page.onceStopRenderByPageInfo == true) {
                this.page.onceStopRenderByPageInfo = false;
                return;
            }
            this.forceUpdate();
        }
    }
    observeOutsideDrop() {
        var isMove: boolean = false;
        var self = this;
        var handle = self.page.kit.handle;
        this.el.shy_drop_move = function (type, data, ev) {
            if (!isMove) {
                switch (type) {
                    case 'pageItem':
                        handle.isDown = true;
                        handle.isDrag = true;
                        break;
                }
                isMove = true;
            }
            else {
                handle.onDropOverBlock(handle.kit.page.getBlockByMouseOrPoint(ev), ev);
            }
        }
        this.el.shy_drop_over = async function (type, data, ev) {
            if (isMove) {
                switch (type) {
                    case 'pageItem':
                        if (handle.dropBlock) {
                            var ds = Array.isArray(data) ? data : [data];
                            await self.page.onBatchDragCreateBlocks(ds.map(d => {
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
    observeScroll() {
        var predict = x => { return dom(x as HTMLElement).style('overflowY') == 'auto' }
        this.scrollDiv = dom(this.el).closest(predict) as any;
        if (this.scrollDiv) this.scrollDiv.addEventListener('scroll', this.scroll);
    }
    scroll = (e) => {
        var outLineBlock = this.page.find(g => g.url == BlockUrlConstant.Outline);
        if (outLineBlock) {
            (outLineBlock as PageOutLine).updateOutlinesHover()
        }
    }
    scrollDiv: HTMLElement;
    componentWillUnmount() {
        channel.off('/page/update/info', this.updatePageInfo);
        this.el.removeEventListener('keydown', this._keydown, true);
        document.removeEventListener('mousedown', this._mousedown);
        document.removeEventListener('mouseup', this._mouseup);
        document.removeEventListener('mousemove', this._mousemove);
        document.removeEventListener('keyup', this._keyup, true);
        document.removeEventListener('wheel', this._wheel);
        document.removeEventListener('paste', this._paste);
        delete this.el.shy_drop_move;
        delete this.el.shy_drop_over;
        delete this.el.shy_end;
        if (this.scrollDiv) this.scrollDiv.removeEventListener('scroll', this.scroll);
    }
    async onPageTurnLayout(type: PageLayoutType) {
        if (type == PageLayoutType.doc) {
            await this.page.onPageTurnLayout(type, async () => {
                var lastBlock = this.page.findReverse(g => g.isBlock);
                var newBlock: Block;
                if (lastBlock && lastBlock.parent == this.page.views.last()) {
                    newBlock = await this.page.createBlock(BlockUrlConstant.TextSpan, {}, lastBlock.parent, lastBlock.at + 1);
                }
                else {
                    newBlock = await this.page.createBlock(BlockUrlConstant.TextSpan, {}, this.page.views.last());
                }
                newBlock.mounted(() => {
                    this.page.kit.anchorCursor.onFocusBlockAnchor(newBlock, { last: true, render: true, merge: true });
                })
            });
        }
        else await this.page.onPageTurnLayout(type);
        this.page.emit(PageDirective.save);
    }
    renderPageTemplate() {
        return <div className="shy-page-view-template-picker" style={this.page.getScreenStyle()}>
            <div className="shy-page-view-template-picker-tip">回车开始编辑，或者从下方选择</div>
            <div className="shy-page-view-template-picker-items">
                <a onMouseDown={e => this.onPageTurnLayout(PageLayoutType.doc)}><Icon size={16} icon={PageSvg} ></Icon><span>页面</span></a>
                <a onMouseDown={e => this.onPageTurnLayout(PageLayoutType.db)}><Icon size={16} icon={CollectTableSvg} ></Icon><span>表格</span></a>
                <a onMouseDown={e => this.onPageTurnLayout(PageLayoutType.docCard)}><Icon size={16} icon={DocCardsSvg} ></Icon><span>宣传页</span></a>
                <a onMouseDown={e => this.onPageTurnLayout(PageLayoutType.board)}><Icon size={16} icon={BoardIconSvg}></Icon><span>白板</span></a>
                <a onMouseDown={e => this.onPageTurnLayout(PageLayoutType.textChannel)}><Icon size={16} icon={BoardToolFrameSvg}></Icon><span>频道</span></a>
            </div>
        </div>
    }
    renderNavs() {
        var isFirstDocTitle = this.page.views[0].childs[0].url == BlockUrlConstant.Title;
        return <div className={"shy-page-view-content-nav" + (this.page.isFullWidth ? "" : " shy-page-view-content-nav-center")}>
            <div className="shy-page-view-content-nav-left">
                <ChildsArea childs={[this.page.views[0]]}></ChildsArea>
            </div>
            <div className="shy-page-view-content-nav-right" style={{ top: 0, marginTop: isFirstDocTitle ? 70 : 0 }}>
                <ChildsArea childs={[this.page.views[1]]}></ChildsArea>
            </div>
        </div>
    }
    renderBar() {

        return <div className="shy-page-bar"></div>
    }
    render() {
        var pageStyle: Record<string, any> = {
            lineHeight: this.page.lineHeight + 'px',
            fontSize: this.page.fontSize + 'px'
        }
        return <div className="shy-page">
            <PageBar page={this.page}></PageBar>
            <div className={'shy-page-view' + (this.page.readonly ? " shy-page-view-readonly" : "")}
                style={pageStyle}
                ref={e => this.page.viewEl = e}
                tabIndex={this.page.isCanEdit ? 1 : undefined}
                onFocusCapture={e => this.page.onFocusCapture(e.nativeEvent)}
                onBlurCapture={e => this.page.onBlurCapture(e.nativeEvent)}
                onMouseEnter={e => this.page.onMouseenter(e)}
                onMouseLeave={e => this.page.onMouseleave(e)}
                onMouseDownCapture={e => this.page.onMouseDownCapture(e)}
            // onPaste={e => this.page.onPaste(e.nativeEvent)}
            // onCopy={e =>this.page.onCopy(e)}
            // onCut={e =>this.page.onCut(e)}
            >
                <div className='shy-page-view-box'
                    onContextMenu={e => this.page.onContextmenu(e)}
                    onMouseDown={e => this.page.onMousedown(e)}>
                    <PageLayoutView page={this.page}>
                        <div className='shy-page-view-content' ref={e => this.page.contentEl = e}>
                            <PageCover page={this.page}></PageCover>
                            {this.page.nav && this.renderNavs()}
                            {!this.page.nav && <ChildsArea childs={this.page.views}></ChildsArea>}
                            {this.page.requireSelectLayout && this.page.isCanEdit && this.renderPageTemplate()}
                        </div>
                    </PageLayoutView>
                </div>
                <KitView kit={this.page.kit}></KitView>
            </div>
        </div>
    }
    async AutomaticHandle() {
        await this.page.onAction(ActionDirective.AutomaticHandle, async () => {
            var isForceUpdate: boolean = false;
            if (this.page.pageLayout?.type == PageLayoutType.doc && this.page.requireSelectLayout == false) {
                if (this.page.autoRefPages == true) {
                    if (!this.page.exists(g => g.url == BlockUrlConstant.RefLinks)) {
                        var view = this.page.views[0];
                        await this.page.createBlock(BlockUrlConstant.RefLinks, {}, view, view.blocks.childs.length, BlockChildKey.childs)
                        isForceUpdate = true;
                    }
                }
                if (this.page.autoRefSubPages == true) {
                    var oldSubPages = this.page.addedSubPages.map(c => c)
                    var items = await this.page.pageInfo.getSubItems();
                    this.page.addedSubPages = items.map(it => it.id);
                    var view = this.page.views[0];
                    oldSubPages.removeAll(c => items.exists(t => t.id == c));
                    items.removeAll(r => view.exists(c => c.url == BlockUrlConstant.Link && (c as any).pageId == r.id))
                    await items.eachAsync(async item => {
                        await this.page.createBlock(BlockUrlConstant.Link, { pageId: item.id }, view, view.blocks.childs.length, BlockChildKey.childs);
                        isForceUpdate = true;
                    });
                    if (oldSubPages.length > 0) {
                        var willRemoveItems = view.findAll(c => c.url == BlockUrlConstant.Link && oldSubPages.includes((c as any).pageId));
                        if (willRemoveItems.length > 0) {
                            //这些链接需要自动清理掉
                            await willRemoveItems.eachAsync(async r => {
                                await r.delete()
                            })
                        }
                    }
                }
            }
            if (this.page.requireSelectLayout == true) {
                var items = await this.page.pageInfo.getSubItems();
                if (items.length > 0) {
                    this.page.updateProps({
                        requireSelectLayout: false,
                        type: PageLayoutType.doc
                    })
                    var view = this.page.views[0];
                    items.removeAll(r => view.exists(c => c.url == BlockUrlConstant.Link && (c as any).pageId == r.id))
                    await items.eachAsync(async item => {
                        await this.page.createBlock(BlockUrlConstant.Link, { pageId: item.id }, view, view.blocks.childs.length, BlockChildKey.childs);
                    })
                    isForceUpdate = true;
                }
            }
            if (isForceUpdate == true) {
                this.forceUpdate()
            }
        })

    }
}