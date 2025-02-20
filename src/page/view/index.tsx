import { Component } from "react";
import React from 'react';
import { Page } from "../index";
import { ChildsArea } from "../../block/view/appear";
import ReactDOM from "react-dom";
import { KitView } from "../../kit/view";
import { LinkPageItem, PageLayoutType } from "../declare";
import { BlockUrlConstant } from "../../block/constant";
import { PageLayoutView } from "./layout";
import { channel } from "../../../net/channel";
import { PageCover } from "./cover";
import { Icon } from "../../../component/view/icon";
import {
    AiStartSvg,
    DocCardsSvg,
    PageSvg,
    UploadSvg
} from "../../../component/svgs";
import { PageOutLine } from "../../../blocks/navigation/outline";
import { Block } from "../../block";
import { PageDirective } from "../directive";
import { PageBar } from "./bar";
import { useAIWriteAssistant } from "../../../extensions/ai";
import { lst } from "../../../i18n/store";
import { S } from "../../../i18n/view";
import { util } from "../../../util/util";
import { isMobileOnly } from "react-device-detect";
import { Loading1 } from "../../../component/view/spin";


/**
 * mousedown --> mouseup --> click --> mousedown --> mouseup --> click --> dblclick
 * 对于同时支持这4个事件的浏览器，事件执行顺序为focusin > focus > focusout > blur
 * mousedown -> blur->mouseup->click
 * 
 **/
export class PageView extends Component<{ page: Page }> {
    constructor(props) {
        super(props);
        this.page.view = this;
    }
    state: Readonly<{ seq: number }> = { seq: 0 };
    forceManualUpdate(cb?: () => void) {
        this.setState({ seq: this.state.seq + 1 }, () => {
            if (typeof cb == 'function')
                cb()
        });
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
    async loadWxShare() {
        if (isMobileOnly) {
            var pd = this.page.getPageDataInfo();
            channel.act('/shy/share', {
                type: 'updateTimelineShareData',
                title: pd.text,
                description: (typeof pd.description == 'string' ? pd.description : pd.description?.text) || '',
                url: this.page.pageUrl
            })
        }
    }
    async didMounted() {
        this.el = ReactDOM.findDOMNode(this) as HTMLElement;
        this.observeScroll();
        this.observeOutsideDrop();
        document.addEventListener('keydown', (this._keydown = e => this.page.onKeydown(e)), true);
        this.el.addEventListener('wheel', this._wheel = e => this.page.onWheel(e), {
            passive: false
        });
        document.addEventListener('mousedown', this._mousedown = this.page.onGlobalMousedown.bind(this));
        document.addEventListener('mousemove', (this._mousemove = this.page.onMousemove.bind(this.page)));
        document.addEventListener('mouseup', (this._mouseup = this.page.onMouseup.bind(this.page)));
        document.addEventListener('keyup', (this._keyup = this.page.onKeyup.bind(this.page)), true);
        document.addEventListener('paste', this._paste = e => this.page.onPaste(e))
        this.page.emit(PageDirective.mounted)
        await this.page.AutomaticHandle();
        this.loadWxShare();
        if (this.page.viewEl) {
            this.page.viewEl.focus();
            if (this.props.page.pageLayout?.type == PageLayoutType.board) {
                this.page.kit.borardGrid.draw(true);
                var url = window.location.href;
                if (url.split('?')[0]?.startsWith('/pc')) {
                    this.page.onFitZoom();
                }
            }
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
                    case 'createBlock':
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
                            var ds = util.covertToArray(data);
                            await self.page.onBatchDragCreateBlocks(ds.map(d => {
                                return {
                                    url: BlockUrlConstant.Link,
                                    icon: d.icon,
                                    pageId: d.id,
                                    sn: d.sn,
                                    text: d.text
                                }
                            }), handle.dropBlock, handle.dropDirection)
                            handle.onDropEnd();
                        }
                        break;
                    case 'createBlock':
                        if (handle.dropBlock) {
                            var ds = util.covertToArray(data);
                            await self.page.onBatchDragCreateBlocks(ds, handle.dropBlock, handle.dropDirection)
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
        this.scrollDiv = this.page.getScrollDiv();
        if (this.scrollDiv) {
            this.scrollDiv.removeEventListener('scroll', this.scroll)
            this.scrollDiv.addEventListener('scroll', this.scroll);
            if (typeof this.scrollTop == 'number')
                setTimeout(() => {
                    this.scrollDiv.scrollTop = this.scrollTop
                }, 300);
        }
    }
    scroll = (e) => {
        var outLineBlock = this.page.find(g => g.url == BlockUrlConstant.Outline);
        if (outLineBlock) {
            (outLineBlock as PageOutLine).updateOutlinesHover()
        }
        this.scrollTop = this.scrollDiv.scrollTop;
    }
    scrollDiv: HTMLElement;
    scrollTop: number;
    componentWillUnmount() {
        document.removeEventListener('keydown', this._keydown, true);
        document.removeEventListener('keyup', this._keyup, true);
        document.removeEventListener('mousedown', this._mousedown);
        document.removeEventListener('mouseup', this._mouseup);
        document.removeEventListener('mousemove', this._mousemove);
        this.el.removeEventListener('wheel', this._wheel);
        document.removeEventListener('paste', this._paste);
        delete this.el.shy_drop_move;
        delete this.el.shy_drop_over;
        delete this.el.shy_end;
        if (this.scrollDiv) this.scrollDiv.removeEventListener('scroll', this.scroll);
    }
    turnLayoutLoading: boolean = false;
    async onPageTurnLayout(type: PageLayoutType, config?: { useAi?: boolean }) {
        try {
            if (this.turnLayoutLoading) return;
            this.turnLayoutLoading = true;
            this.forceUpdate();
            var actions;
            if (type == PageLayoutType.doc)
                actions = async () => {
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
                        var title = this.page.getPageDataInfo()?.text;
                        if (config?.useAi)
                            useAIWriteAssistant({
                                block: newBlock,
                                isRun: true,
                                ask: title ? lst('以{title}为主题写一份不少于1000字文档', { title }) : lst('写一份文档不少于1000字')
                            })
                    })
                }
            await this.page.onPageTurnLayout(type, actions);
        }
        catch (ex) {

        }
        finally {
            this.turnLayoutLoading = false;
            this.forceUpdate();
        }
    }
    renderPageTemplate() {
        return <div className="shy-page-view-template-picker" style={this.page.getScreenStyle()}>
            {this.turnLayoutLoading && <div className="flex"><Loading1></Loading1><S>创建页面中...</S></div>}
            {!this.turnLayoutLoading && <>
                <div className="remark f-16"><S text='回车开始编辑'>回车开始编辑，或者从下方选择创建</S></div>
                <div className="shy-page-view-template-picker-items b-500 remark" onMouseDown={e => { e.stopPropagation() }}>

                    <a onMouseDown={e => this.onPageTurnLayout(PageLayoutType.doc)}><Icon size={18} icon={PageSvg} ></Icon><span><S>页面</S></span></a>
                    <a onMouseDown={e => this.onPageTurnLayout(PageLayoutType.db)}><Icon size={18} icon={{ name: 'byte', code: 'table' }} ></Icon><span><S>数据表</S></span></a>
                    <a onMouseDown={e => this.onPageTurnLayout(PageLayoutType.ppt)}><Icon size={18} icon={DocCardsSvg} ></Icon><span>PPT</span></a>
                    <a onMouseDown={e => this.onPageTurnLayout(PageLayoutType.board)}><Icon size={18} icon={{ name: 'bytedance-icon', code: 'enter-the-keyboard' }}></Icon><span><S>白板</S></span></a>
                    <a onMouseDown={e => this.onPageTurnLayout(PageLayoutType.textChannel)}><Icon size={18} icon={{ name: 'byte', code: 'pound' }}></Icon><span><S text='频道'>频道</S></span></a>

                </div>
                <div className="shy-page-view-template-picker-items gap-t-20 b-500  remark" onMouseDown={e => { e.stopPropagation() }}>
                    <div className="remark f-12 bold"><S>选择模板、AI创作或导入</S></div>
                    <a onMouseDown={e => this.page.onOpenTemplate()}><Icon size={17} icon={{ name: 'bytedance-icon', code: 'page-template' }}></Icon><span><S >选择模板创建...</S></span></a>
                    {!(this.page.ws.aiConfig?.disabled == true) && <>
                        <a onMouseDown={e => this.onPageTurnLayout(PageLayoutType.doc, { useAi: true })}><Icon size={18} icon={AiStartSvg}></Icon><span><S>用AI开始创作...</S></span></a>
                        {/* <a onMouseDown={e => this.onPageTurnLayout(PageLayoutType.docCard, { useAi: true })}><Icon size={20} icon={MagicSvg}></Icon><span><S>用AI开始生成PPT...</S></span></a> */}
                    </>}

                    <a onMouseDown={e => this.page.onOpenImport()}><Icon size={18} icon={UploadSvg}></Icon><span><S>导入...</S></span></a>
                </div>
            </>}
        </div>
    }
    renderNavs() {
        var isFirstDocTitle = this.page.views[0].childs[0].url == BlockUrlConstant.Title;
        var isFull = this.page.isFullWidth;
        if (this.page.ws.isPubSite) isFull = this.page.ws?.publishConfig.isFullWidth;
        return <div className={"shy-page-view-content-nav" + (isFull ? "" : " shy-page-view-content-nav-center")}>
            <div className="shy-page-view-content-nav-left" style={{ position: 'relative', zIndex: 3 }}>
                <ChildsArea childs={[this.page.views[0]]}></ChildsArea>
            </div>
            <div className="shy-page-view-content-nav-right" style={{ zIndex: 1, top: 0, marginTop: isFirstDocTitle ? 70 : 0 }}>
                <ChildsArea childs={[this.page.views[1]]}></ChildsArea>
            </div>
        </div>
    }
    pageBar: PageBar;
    render() {
        var pageStyle: Record<string, any> = {
            lineHeight: this.page.lineHeight,
            fontSize: this.page.fontSize
        }
        if (this.props.page.bar === false) {
            pageStyle.top = 0;
        }
        if (this.page.pageLayout?.type == PageLayoutType.textChannel) {
            pageStyle.overflowY = 'visible';
            pageStyle.overflowX = 'visible';
            pageStyle.overflow = 'visible';
        }
        if (this.page.pageLayout?.type == PageLayoutType.board) {
            pageStyle.overflowY = 'hidden';
            pageStyle.overflowX = 'hidden';
            pageStyle.overflow = 'hidden';
            pageStyle.backgroundColor = '#fff';
            // pageStyle.overflowY = 'visible';
            // pageStyle.overflowX = 'visible';
            // pageStyle.overflow = 'visible';
        }
        var gap = 60;
        if ([PageLayoutType.doc, PageLayoutType.db].includes(this.props.page?.pageLayout?.type)) {
            gap = 60
        }
        else if ([PageLayoutType.ppt, PageLayoutType.textChannel, PageLayoutType.board].includes(this.props.page?.pageLayout?.type)) {
            gap = 0
        }
        if (this.page.hideDocTitle == true) {
            gap = 0;
        }

        var pd = this.props.page.getPageDataInfo();
        return <div className="shy-page" >
            <PageBar ref={e => { this.pageBar = e; }} page={this.page}></PageBar>
            <div className={'shy-page-view' + (this.page.readonly ? " shy-page-view-readonly" : "")}
                style={pageStyle}
                ref={e => this.page.viewEl = e}
                tabIndex={this.page.isCanEdit ? 1 : undefined}
                onFocusCapture={e => this.page.onFocusCapture(e.nativeEvent)}
                onBlurCapture={e => this.page.onBlurCapture(e.nativeEvent)}
                onMouseEnter={e => this.page.onMouseenter(e)}
                onMouseLeave={e => this.page.onMouseleave(e)}
                onMouseDownCapture={e => this.page.onMouseDownCapture(e)}
                onContextMenu={e => this.page.onContextMenu(e)}
                onMouseDown={e => this.page.onMousedown(e)}
                onDoubleClick={e => this.page.onDoubleClick(e)}
                onScroll={e => {
                    if (this.page.pageLayout?.type == PageLayoutType.board) {
                        e.preventDefault();
                        var ele = e.currentTarget as HTMLElement;
                        ele.scrollTop = 0;
                        ele.scrollLeft = 0;
                    }
                }}
            >
                <div className={'shy-page-view-box'}
                >
                    <PageLayoutView page={this.page}>
                        <div className={'shy-page-view-content '} ref={e => this.page.contentEl = e}>
                            {!(this.page?.pageTheme?.coverStyle?.display == 'inside-cover') && <PageCover page={this.page}></PageCover>}
                            {!pd?.cover?.abled && gap > 0 && <div className={'h-' + gap}></div>}
                            {this.renderPageContent()}
                        </div>
                    </PageLayoutView>
                </div>
                <KitView kit={this.page.kit}></KitView>
            </div>
        </div>
    }
    renderPageContent() {
        return <>
            {this.page.isCanOutline && this.renderNavs()}
            {!this.page.isCanOutline && <ChildsArea childs={this.page.views}></ChildsArea>}
            {this.page.requireSelectLayout && this.page.isCanEdit && this.renderPageTemplate()}
        </>
    }
    onSelect(item: LinkPageItem) {
        channel.act('/page/open', { item: { id: item.id } })
    }

}