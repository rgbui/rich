
import React, { CSSProperties } from "react";
import { Block } from "../..";
import {
    DotsSvg,
    PicSvg,
    PlatteSvg
} from "../../../../component/svgs";

import { Icon, IconValueType } from "../../../../component/view/icon";
import { MenuItem, MenuItemType } from "../../../../component/view/menu/declare";
import { useCardBoxStyle } from "../../../../extensions/theme/card.style";
import { Point, Rect } from "../../../common/vector/point";
import { PageLayoutType, PageThemeStyle } from "../../../page/declare";
import { GridMap } from "../../../page/grid";
import { BlockDirective, BlockRenderRange } from "../../enum";
import { prop, url, view } from "../../factory/observable";
import { BlockView } from "../../view";
import { ChildsArea } from "../../view/appear";
import { ToolTip } from "../../../../component/view/tooltip";
import { DropDirection } from "../../../kit/handle/direction";
import { lst } from "../../../../i18n/store"
import { BlockUrlConstant } from "../../constant";
import { getBgStyle, getCardStyle } from "../../../../extensions/theme/themes";
import { useImagePicker } from "../../../../extensions/image/picker";
import lodash from "lodash";
import { util } from "../../../../util/util";
import { memoryCopyData, memoryReadData } from "../../../page/common/copy";
import { MouseDragger } from "../../../common/dragger";
import { Matrix } from "../../../common/matrix";
import { Tip } from "../../../../component/view/tooltip/tip";
import "./style.less";

@url('/card/box')
export class CardBox extends Block {
    init() {
        this.gridMap = new GridMap(this)
    }
    get childsOffsetMatrix() {
        var matrix = new Matrix();
        if (this.el) {
            var p = this.page.getDocRelativePoint(this, this.getVisibleContentBound().leftTop);
            matrix.translate(p.x, p.y);
        }
        // matrix.append(this.boardOffsetMatrix);
        return matrix;
    }
    async onAddCardBox(event: React.MouseEvent) {
        this.page.onAction('onAddCardBox', async () => {
            var d = {
                url: BlockUrlConstant.CardBox,
                blocks: {
                    childs: [
                        { url: BlockUrlConstant.Head }
                    ]
                }
            };
            var pa = this.parent;
            var nb = await pa.appendBlock(d, this.at + 1, this.parentKey);
            this.page.addUpdateEvent(async () => {
                await util.delay(100);
                var head = nb.find(g => g.url == BlockUrlConstant.Head)
                this.page.kit.anchorCursor.onFocusBlockAnchor(head, { merge: true, render: true, last: true })
            })
        });
    }
    async onAddBoardCardBox(event: React.MouseEvent) {
        this.page.onAction('onAddBoardCardBox', async () => {
            var d = {
                url: BlockUrlConstant.CardBox,
                board: true,
                blocks: {
                    childs: [
                        // { url: BlockUrlConstant.Head }
                    ]
                }
            };
            var pa = this.parent;
            var nb = await pa.appendBlock(d, this.at + 1, this.parentKey);
            this.page.addUpdateEvent(async () => {
                // await util.delay(100);
                // var head = nb.find(g => g.url == BlockUrlConstant.Head)
                // this.page.kit.anchorCursor.onFocusBlockAnchor(head, { merge: true, render: true, last: true })
            })
        });
    }
    async onOpenCardStyle(event?: React.MouseEvent) {
        var el = this.el.querySelector('.sy-block-view-card-ops') as HTMLElement;
        el.style.visibility = 'visible';
        try {
            var rect = Rect.fromEle(el);
            await useCardBoxStyle({ roundArea: rect }, this);
        }
        catch (ex) {

        }
        finally {
            el.style.visibility = '';
        }
    }
    @prop()
    board: boolean = false;
    @prop()
    boardHeight: number = 300;
    @prop()
    cardCoverHeight = 120;
    @prop()
    cardCoverWidth = 33.3;
    @prop()
    cardThemeStyle: PageThemeStyle = {
        bgStyle: {
            mode: 'none',
            color: '#fff'
        },
        coverStyle: {
            display: 'none',
            bgStyle: {
                mode: 'none',
                color: '#fff'
            }
        },
        contentStyle: {
            color: 'light',
            transparency: 'frosted'
        }
    }
    getVisibleHandleCursorPoint() {
        if ((this.view as any).contentEl) {
            var c = (this.view as any).contentEl as HTMLElement;
            var bound = Rect.fromEle(c);
            if (bound) {
                var pos = Point.from(bound);
                pos = pos.move(0, 10);
                return pos;
            }
        }
    }
    get isAllowDrop(): boolean {
        return true;
    }
    isAllowDrops(dragBlocks: Block[]) {
        if (dragBlocks.length == 1) {
            var dg = dragBlocks[0];
            if (dg instanceof CardBox) {
                if (dg === this) return false;
                return true;
            }
        }
        return false;
    }
    isCanDropHere(dropBlock: Block) {
        if (dropBlock instanceof CardBox) {
            return true;
        }
        return false
    }
    canDropDirections() {
        return [
            DropDirection.top,
            DropDirection.bottom
        ]
    }
    async onGetContextMenus() {
        var items = await super.onGetContextMenus();
        var at = items.findIndex(g => g.name == BlockDirective.copy);
        var d = memoryReadData('cardBox.cardThemeStyle');
        items.splice(at + 2, 0, ...[
            { type: MenuItemType.divide },
            {
                name: 'style',
                icon: PlatteSvg,
                text: lst("卡片样式")
            },
            {
                text: lst('卡片操作'),
                icon: { name: 'byte', code: 'write' } as any,
                childs: [
                    {
                        name: 'merge',
                        disabled: this.prev && this.prev instanceof CardBox ? false : true,
                        icon: { name: 'byte', code: 'sum' } as IconValueType,
                        text: lst("合并内容到上一个")
                    },
                    // { type: MenuItemType.divide },
                    {
                        name: 'up',
                        icon: { name: 'byte', code: 'arrow-up' } as IconValueType,
                        text: lst("上移"),
                        disabled: this.prev ? false : true
                    },
                    {
                        name: 'down',
                        icon: { name: 'byte', code: 'arrow-down' } as IconValueType,
                        text: lst("下移"),
                        disabled: this.next ? false : true
                    },
                    // { type: MenuItemType.divide },
                    {
                        name: 'copyStyle',
                        icon: { name: 'byte', code: 'format-brush' } as IconValueType,
                        text: lst("复制卡片样式")
                    },
                    {
                        name: 'pasteStyle',
                        icon: { name: 'byte', code: 'magic-wand' } as IconValueType,
                        value: lodash.cloneDeep(d),
                        disabled: d ? false : true,
                        text: lst("粘贴卡片样式")
                    }
                ]
            }
        ])
        var at = items.findIndex(g => g.name == 'color');
        items.splice(at, 2);
        var dat = items.findIndex(g => g.name == BlockDirective.delete);
        items.splice(dat + 1, 0, {
            type: MenuItemType.divide
        },
            {
                type: MenuItemType.help,
                text: lst('了解如何使用PPT卡片'),
                url: window.shyConfig?.isUS ? "https://help.shy.live/page/1868#crndmtofuMqgvadrzwmjvy" : "https://help.shy.live/page/1868#crndmtofuMqgvadrzwmjvy"
            }
        )
        return items;
    }
    async onClickContextMenu(item: MenuItem<string | BlockDirective>, event: MouseEvent): Promise<void> {
        if (item.name == 'cloneCard') {
            this.onClone()
            return;
        } else if (item.name == 'style') {
            this.onOpenCardStyle()
            return;
        } else if (item.name == 'merge') {
            var prev = this.prev as CardBox;
            if (prev instanceof CardBox) {
                var cs = this.childs;
                await this.page.onAction('onCardMerge', async () => {
                    await prev.appendArray(cs, prev.childs.length, prev.parentKey);
                    await this.delete()
                })
            }
            return;
        }
        else if (item.name == 'down') {
            await this.page.onAction('onCardMove', async () => {
                await this.move(this.at + 1);
            });
        }
        else if (item.name == 'up') {
            await this.page.onAction('onCardMove', async () => {
                await this.move(this.at - 1);
            });
        }
        else if (item.name == 'copyStyle') {
            memoryCopyData('cardBox.cardThemeStyle', lodash.cloneDeep(this.cardThemeStyle))
        }
        else if (item.name == 'pasteStyle') {
            var value = item.value;
            await this.onUpdateProps({
                cardThemeStyle: value
            }, {
                range: BlockRenderRange.self
            })
        }
        else
            return await super.onClickContextMenu(item, event);
    }
    getVisiblePanelBound(): Rect {
        var r = Rect.fromEle(this.contentEl);
        return r;
    }
    get contentEl() {
        return (this.view as any)?.contentEl as HTMLElement;
    }
    getScrollDiv() {
        var p = this.parentPanel;
        if (p) return p.getScrollDiv()
        else return this.page.getScrollDiv();
    }
    async openSetBg(event: React.MouseEvent) {
        event.stopPropagation();
        var r = await useImagePicker({ roundArea: Rect.fromEle(event.currentTarget as HTMLElement) });
        if (r) {
            var t = lodash.cloneDeep(this.cardThemeStyle);
            t.coverStyle.bgStyle.mode = 'uploadImage';
            t.coverStyle.bgStyle.src = r.url;
            await this.onUpdateProps({
                cardThemeStyle: t
            }, { range: BlockRenderRange.self })
        }
    }
}

/*** 在一个页面上，从视觉上有多个视图块，
 * 如每个页面都有一个初始的内容视图，不可拖动
 *  但页面可以会有弹层等一些其它的视图
 */
@view('/card/box')
export class ViewComponent extends BlockView<CardBox> {
    contentEl: HTMLElement;
    dragSize(arrow: 'top' | 'left' | 'right', event: React.MouseEvent) {
        event.stopPropagation();
        var h = this.block.cardCoverHeight;
        var self = this;
        if (arrow == 'top') {
            MouseDragger({
                event,
                moving(ev, data, isEnd, isMove) {
                    if (isMove) {
                        var dx = ev.clientX - event.clientX;
                        var dy = ev.clientY - event.clientY;
                        var nh = h;
                        nh += dy;
                        nh = Math.max(60, nh);
                        self.block.cardCoverHeight = nh;
                        if (isEnd) {
                            self.block.onManualUpdateProps({
                                cardCoverHeight: h
                            }, {
                                cardCoverHeight: nh
                            }, { range: BlockRenderRange.self })
                        }
                        else self.forceUpdate();
                    }
                }
            })
        }
        else {
            var t = event.currentTarget as HTMLElement;
            var div = t.parentNode as HTMLElement;
            var p = div.parentNode as HTMLElement;
            var pr = Rect.fromEle(p);
            var dr = Rect.fromEle(div);
            var ow = this.block.cardCoverWidth;
            MouseDragger({
                event,
                moving(ev, data, isEnd, isMove) {
                    if (isMove) {
                        var dx = ev.clientX - event.clientX;
                        var nw = dr.width;
                        if (arrow == 'left') {
                            nw += dx;
                        }
                        else if (arrow == 'right') {
                            nw -= dx;
                        }
                        nw = Math.max(30, nw);
                        nw = Math.min(pr.width - 100, nw);
                        if (isEnd) {
                            self.block.onManualUpdateProps({
                                cardCoverWidth: ow
                            }, {
                                cardCoverWidth: nw / pr.width * 100
                            }, { range: BlockRenderRange.self })
                        }
                        else {
                            div.style.width = nw + 'px';
                        }
                    }
                },
            })
        }
    }
    onResize(event: React.MouseEvent) {
        event.stopPropagation();
        var height = this.block.boardHeight
        MouseDragger({
            event,
            moving: (e, d, end) => {
                var dy = e.clientY - event.clientY;
                var h = height + dy;
                if (h < 60) h = 60;
                this.block.boardHeight = h;
                if (end) {
                    this.block.onManualUpdateProps(
                        { boardHeight: height },
                        { boardHeight: h }
                    );
                }
                else this.forceUpdate()
            }
        })
    }
    renderBoard() {
        if (this.block.board) {
            return <><div style={{
                height: this.block.boardHeight,
                'position': 'relative',
                transformOrigin: '0% 0%',
                overflow: 'hidden'
            }}>
                <ChildsArea childs={this.block.childs}></ChildsArea>
            </div>
                {this.block.isCanEdit() && <Tip text={'拖动调整高度'}><div className="sy-board-resize visible" onMouseDown={e => this.onResize(e)}></div></Tip>}
            </>
        }
        else return <></>
    }
    renderView() {
        var style: CSSProperties = {};
        var bg = this.block.cardThemeStyle.bgStyle;
        var self = this;
        if (this.block.page?.pageLayout?.type == PageLayoutType.ppt) {
            style.display = 'block';
            style.width = '100%';
            style.boxSizing = 'border-box';
            Object.assign(style, getBgStyle(bg))
            if (bg?.mode == 'none') {
                style.backgroundColor = 'transparent';
                style.backgroundImage = 'none';
                style.background = 'none'
            }
        }
        var screenStyle = this.block.page.getScreenStyle();
        var hasPic = this.block.cardThemeStyle.bgStyle.mode == 'image' || this.block.cardThemeStyle.bgStyle.mode == 'uploadImage';
        var gapStyle: CSSProperties = {
            paddingTop: '4rem',
            paddingBottom: '4rem'
        }
        if (hasPic) {
            gapStyle.paddingTop = '8rem';
            gapStyle.paddingBottom = '8rem';
        }

        function renderContent() {
            var cs = self.block.cardThemeStyle.coverStyle
            var coverStyle = getBgStyle(cs?.bgStyle);
            var hasCover = true;
            if (cs?.bgStyle?.mode == 'none') {
                coverStyle.background = '#ddd';
                coverStyle.display = 'flex';
                coverStyle.justifyContent = 'center';
                coverStyle.alignItems = 'center';
                hasCover = false;
            }
            if (cs?.display == 'inside-cover') {
                var cStyle: CSSProperties = {};
                if (self.block.board) {
                    cStyle.position = 'absolute'
                    cStyle.top = 0;
                    cStyle.left = 0;
                    cStyle.right = 0;
                    cStyle.zIndex = '-1'
                }
                else cStyle.position = 'relative';
                return <div
                    style={cStyle}
                >
                    <div className="h-120" style={{
                        borderRadius: '16px 16px 0px 0px',
                        ...coverStyle,
                        height: self.block.cardCoverHeight
                    }}>
                        {hasCover == false && <Icon onMousedown={e => {
                            self.block.openSetBg(e);
                        }} className={'cursor remark'} size={24} icon={PicSvg}></Icon>}
                    </div>
                    {self.block.isCanEdit() && <div className="item-hover-define" onMouseDown={e => {
                        self.dragSize('top', e);
                    }} style={{
                        position: 'absolute',
                        top: self.block.cardCoverHeight - 3,
                        left: self.block.board  ? -30 : 0,
                        height: 6,
                        right: self.block.board  ? -30 : 0,
                        cursor: 'row-resize',
                        color: 'rgba(55, 53, 47, 0.16)',
                    }}></div>}
                    {self.block.board == false && <div className="gap-w-50 gap-h-30">
                        <ChildsArea childs={self.block.childs}></ChildsArea>
                    </div>}
                </div>
            }
            else if (cs?.display == 'inside') {
                return self.block.board == false && <div className="padding-w-50 padding-h-30" >
                    <div ><ChildsArea childs={self.block.childs}></ChildsArea></div>
                </div>
            }
            else if (cs?.display == 'inside-cover-left') {
                var cStyle: CSSProperties = {};
                if (self.block.board) {
                    cStyle.position = 'absolute'
                    cStyle.top = 0;
                    cStyle.left = 0;
                    cStyle.right = 0;
                    cStyle.zIndex = '-1';
                    cStyle.bottom = 0;
                }
                return <div style={cStyle} className="flex flex-full">
                    <div className="min-h-60 flex-fixed relative" style={{
                        borderRadius: '16px 0px 0px 16px ',
                        width: (self.block.cardCoverWidth) + '%',
                        ...coverStyle
                    }}>
                        {hasCover == false && <Icon onMousedown={e => {
                            self.block.openSetBg(e);
                        }} className={'cursor remark'} size={24} icon={PicSvg}></Icon>}
                        {self.block.isCanEdit() && <div
                            className="item-hover-define"
                            onMouseDown={e => {
                                self.dragSize('left', e);
                            }}
                            style={{
                                position: 'absolute',
                                top: self.block.board ? -30 : 0,
                                bottom: self.block.board ? -30 : 0,
                                right: -3,
                                width: 6,
                                cursor: 'col-resize',
                                borderRadius: 3,
                                color: 'rgba(55, 53, 47, 0.16)',
                            }}
                        ></div>}
                    </div>
                    <div className="flex-auto gap-w-50 gap-h-30"> {self.block.board == false && <ChildsArea childs={self.block.childs}></ChildsArea>}</div>
                </div>
            }
            else if (cs?.display == 'inside-cover-right') {
                var cStyle: CSSProperties = {};
                if (self.block.board) {
                    cStyle.position = 'absolute'
                    cStyle.top = 0;
                    cStyle.left = 0;
                    cStyle.right = 0;
                    cStyle.zIndex = '-1'
                    cStyle.bottom = 0;
                }
                return <div style={cStyle} className="flex flex-full">
                    <div className="flex-auto gap-w-50 gap-h-30">
                        {self.block.board == false && <ChildsArea childs={self.block.childs}></ChildsArea>}
                    </div>
                    <div className="min-h-60 flex-fixed relative" style={{
                        borderRadius: '0px 16px 16px 0px ',
                        width: self.block.cardCoverWidth + "%",
                        ...coverStyle
                    }}>
                        {hasCover == false && <Icon onMousedown={e => {
                            self.block.openSetBg(e);
                        }} className={'cursor remark'} size={24} icon={PicSvg}></Icon>}
                        {self.block.isCanEdit() && <div
                            className="item-hover-define"
                            onMouseDown={e => {
                                self.dragSize('right', e);
                            }}
                            style={{
                                position: 'absolute',
                                top: self.block.board  ? -30 : 0,
                                bottom: self.block.board  ? -30 : 0,
                                left: -3,
                                width: 6,
                                cursor: 'col-resize',
                                borderRadius: 3,
                                color: 'rgba(55, 53, 47, 0.16)'
                            }}
                        ></div>}
                    </div>
                </div>
            }
            return self.block.board == false && <div className="gap-w-50 padding-h-30"><ChildsArea childs={self.block.childs}></ChildsArea></div>
        }

        var cs = self.block.cardThemeStyle.coverStyle
        var coverStyle = getBgStyle(cs?.bgStyle);
        var { contentStyle } = getCardStyle(self.block.cardThemeStyle);
        if (self.block.cardThemeStyle?.contentStyle?.transparency == 'noborder') {
            // contentStyle.border = 'none';
            delete contentStyle.border;
            delete contentStyle.boxShadow;
            delete contentStyle.backgroundColor;
            // contentStyle.boxShadow = 'none';
            // contentStyle.backgroundColor = 'transparent';
        }
        if (self.block.board) {
            contentStyle.height = self.block.boardHeight;
        }
        return <div style={style}>
            <div className={"sy-block-view-card" + (this.block.isCanEdit() ? " allow-hover" : "")} style={screenStyle}>
                <div style={gapStyle}>
                    <div
                        ref={e => this.contentEl = e}
                        className={"relative"}>
                        {this.block.isCanEdit() && <div style={{ zIndex: 12, top: -40 }} className="flex sy-block-view-card-ops bg-white shadow-s round pos-top-right  gap-t-10 remark">
                            <span className={"flex-center cursor round  size-24 item-hover "} onMouseDown={e => {
                                e.stopPropagation();
                                this.block.onOpenCardStyle(e);
                            }}><Icon size={18} icon={PlatteSvg}></Icon></span>
                            <span className={"flex-center cursor round  size-24 item-hover "} onMouseDown={async e => {
                                e.stopPropagation();
                                var el = (e.currentTarget as HTMLElement).closest('.sy-block-view-card-ops') as HTMLElement;
                                try {
                                    el.style.visibility = 'visible';
                                    await this.block.onContextmenu(e.nativeEvent)
                                }
                                catch (ex) {

                                }
                                finally {
                                    el.style.visibility = '';
                                }
                            }}><Icon size={18} icon={DotsSvg}></Icon></span>
                        </div>}
                        {cs?.display == 'inside' && <div className="round-16" style={{
                            ...coverStyle
                        }}>
                            <div style={{ ...contentStyle }} className={"round-16 sy-block-card-box" + (" sy-block-card-box-" + this.block.cardThemeStyle.contentStyle?.color) + (" sy-block-card-box-" + this.block.cardThemeStyle?.contentStyle?.transparency)}>
                                {renderContent()}
                                {this.renderBoard()}
                            </div>
                        </div>}
                        {cs?.display !== 'inside' && <div style={{ ...contentStyle }} className={"relative round-16 sy-block-card-box" + (" sy-block-card-box-" + this.block.cardThemeStyle.contentStyle?.color) + (" sy-block-card-box-" + this.block.cardThemeStyle?.contentStyle?.transparency)}>
                            {renderContent()}
                            {this.renderBoard()}
                        </div>}
                    </div>
                    <div className="sy-block-view-card-ops flex-center gap-h-10 gap-w-50 ">
                        {this.block.isCanEdit() && <>
                            <ToolTip overlay={lst('添加文档卡片')}>
                                <div onMouseDown={e => this.block.onAddCardBox(e)} className="size-30 bg-white shadow-s flex-center cursor border circle text-1 link-hover gap-r-20"><Icon size={18} icon={{ name: "byte", code: 'add' }}></Icon></div>
                            </ToolTip>
                            <ToolTip overlay={lst('添加白板卡片')}>
                                <div onMouseDown={e => this.block.onAddBoardCardBox(e)} className="size-30 bg-white shadow-s flex-center cursor border circle text-1 link-hover"> <Icon size={18} icon={{ name: 'byte', code: 'add-one' }}></Icon></div>
                            </ToolTip>
                        </>}
                    </div>
                </div>
            </div>
        </div>
    }
}
