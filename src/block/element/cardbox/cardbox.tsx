
import React, { CSSProperties } from "react";
import { Block } from "../..";
import {
    ArrowUpSvg,
    DotsSvg,
    DuplicateSvg,
    LinkSvg,
    PicSvg,
    PlatteSvg,
    PlusSvg,
    TrashSvg
} from "../../../../component/svgs";
import { Icon } from "../../../../component/view/icon";
import { useSelectMenuItem } from "../../../../component/view/menu";
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
import { getBgStyle } from "../../../../extensions/theme/themes";
import { useImagePicker } from "../../../../extensions/image/picker";
import lodash from "lodash";
import "./style.less";
import { util } from "../../../../util/util";

@url('/card/box')
export class CardBox extends Block {
    init() {
        this.gridMap = new GridMap(this)
    }
    async openContextmenu(event: React.MouseEvent) {
        var el = event.currentTarget?.parentNode as HTMLElement;
        el.classList.remove('visible');
        try {
            var r = await useSelectMenuItem(
                { roundArea: Rect.fromEvent(event) },
                [
                    {
                        name: 'copylink',
                        icon: LinkSvg,
                        text: lst("复制链接")
                    },
                    {
                        name: 'cloneCard',
                        icon: DuplicateSvg,
                        text: lst("复制卡片")
                    },
                    { type: MenuItemType.divide },
                    {
                        name: 'style',
                        icon: PlatteSvg,
                        text: lst("卡片样式")
                    },
                    {
                        name: 'merge',
                        disabled: this.prev && this.prev instanceof CardBox ? false : true,
                        icon: ArrowUpSvg,
                        text: lst("合并内容到上一个")
                    },
                    { type: MenuItemType.divide },
                    {
                        name: 'delete',
                        icon: TrashSvg,
                        text: lst("删除卡片")
                    }
                ]
            );
            if (r?.item) {
                if (r.item.name == 'copylink') {
                    this.onCopyLink();
                }
                else if (r.item.name == 'cloneCard') {
                    this.onClone()
                } else if (r.item.name == 'style') {
                    this.onOpenCardStyle()
                } else if (r.item.name == 'merge') {
                    var prev = this.prev as CardBox;
                    if (prev instanceof CardBox) {
                        var cs = this.childs;
                        this.page.onAction('onCardMerge', async () => {
                            await prev.appendArray(cs, prev.childs.length, prev.parentKey);
                            await this.delete()
                        })
                    }
                }
                else if (r.item.name == 'delete') {
                    this.onDelete()
                }
            }
        }
        catch (ex) {
            console.error(ex)
        }
        finally {
            el.classList.add('visible');
        }
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
    async onOpenCardStyle(event?: React.MouseEvent) {
        var rect = Rect.fromEle(this.contentEl);
        rect = rect.rightTop.move(-20, -20).toRect(20, 20);
        await useCardBoxStyle({ roundArea: rect }, this);
    }
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
                pos = pos.move(0, 5);
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
        items.splice(at + 2, 0, ...[
            { type: MenuItemType.divide },
            {
                name: 'cloneCard',
                icon: DuplicateSvg,
                text: lst("复制卡片")
            },
            { type: MenuItemType.divide },
            {
                name: 'style',
                icon: PlatteSvg,
                text: lst("卡片样式")
            },
            {
                name: 'merge',
                disabled: this.prev && this.prev instanceof CardBox ? false : true,
                icon: ArrowUpSvg,
                text: lst("合并内容到上一个")
            }])
        var at = items.findIndex(g => g.name == 'color');
        items.splice(at, 2);
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
        return await super.onClickContextMenu(item, event);
    }
    getVisiblePanelBound(): Rect {
        var r = Rect.fromEle(this.contentEl);
        return r;
    }
    get contentEl() {
        return (this.view as any)?.contentEl as HTMLElement;
    }
    getScrollDiv(): HTMLElement {
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
            this.onUpdateProps({
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
export class ViewComponent extends BlockView<CardBox>{
    contentEl: HTMLElement;
    renderView() {
        var style: CSSProperties = {};
        var bg = this.block.cardThemeStyle.bgStyle;
        var self = this;
        if (this.block.page?.pageLayout?.type == PageLayoutType.docCard) {
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
            paddingTop: '2rem',
            paddingBottom: '2rem'
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
                return <div>
                    <div className="h-120" style={{ borderRadius: '16px 16px 0px 0px', ...coverStyle }}>
                        {hasCover == false && <Icon onMousedown={e => {
                            self.block.openSetBg(e);
                        }} className={'cursor remark'} size={24} icon={PicSvg}></Icon>}
                    </div>
                    <div className="gap-w-50 gap-h-30"><ChildsArea childs={self.block.childs}></ChildsArea></div>
                </div>
            }
            else if (cs?.display == 'inside') {
                return <div className="padding-w-50 padding-h-30" >
                    <div ><ChildsArea childs={self.block.childs}></ChildsArea></div>
                </div>
            }
            else if (cs?.display == 'inside-cover-left') {
                return <div className="flex flex-full">
                    <div className="min-h-60 flex-fixed" style={{ borderRadius: '16px 0px 0px 16px ', width: '33.3%', ...coverStyle }}>
                        {hasCover == false && <Icon onMousedown={e => {
                            self.block.openSetBg(e);
                        }} className={'cursor remark'} size={24} icon={PicSvg}></Icon>}
                    </div>
                    <div className="flex-auto gap-w-50 gap-h-30"><ChildsArea childs={self.block.childs}></ChildsArea></div>
                </div>
            }
            else if (cs?.display == 'inside-cover-right') {
                return <div className="flex flex-full">
                    <div className="flex-auto gap-w-50 gap-h-30"><ChildsArea childs={self.block.childs}></ChildsArea></div>
                    <div className="min-h-60 flex-fixed" style={{ borderRadius: '0px 16px 16px 0px ', width: '33.3%', ...coverStyle }}>
                        {hasCover == false && <Icon onMousedown={e => {
                            self.block.openSetBg(e);
                        }} className={'cursor remark'} size={24} icon={PicSvg}></Icon>}
                    </div>
                </div>
            }
            return <div className="gap-w-50 gap-h-30"><ChildsArea childs={self.block.childs}></ChildsArea></div>
        }

        var cs = self.block.cardThemeStyle.coverStyle
        var coverStyle = getBgStyle(cs?.bgStyle);

        return <div style={style}>
            <div className={"visible-hover sy-block-view-card" + (this.block.isCanEdit() ? " allow-hover" : "")} style={screenStyle}>
                <div style={gapStyle}>
                    <div
                        ref={e => this.contentEl = e}
                        className={"relative"}>
                        {this.block.isCanEdit() &&<div style={{ zIndex: 12 }} className="flex sy-block-view-card-ops pos-top-right gap-r-10 gap-t-10 r-gap-r-10">
                            <span className={"flex-center cursor round  size-24 bg-hover"} onMouseDown={e => { e.stopPropagation(); this.block.onOpenCardStyle(e) }}><Icon size={18} icon={PlatteSvg}></Icon></span>
                            <span className={"flex-center cursor round  size-24 bg-hover"} onMouseDown={e => { e.stopPropagation(); this.block.openContextmenu(e) }}><Icon size={18} icon={DotsSvg}></Icon></span>
                        </div>}
                        {cs?.display == 'inside' && <div className="round-16" style={{
                            ...coverStyle
                        }}>
                            <div className={"round-16 sy-block-card-box" + (" sy-block-card-box-" + this.block.cardThemeStyle.contentStyle?.color) + (" sy-block-card-box-" + this.block.cardThemeStyle?.contentStyle?.transparency)}>
                                {renderContent()}
                            </div>
                        </div>}
                        {cs?.display !== 'inside' && <div className={"round-16 sy-block-card-box" + (" sy-block-card-box-" + this.block.cardThemeStyle.contentStyle?.color) + (" sy-block-card-box-" + this.block.cardThemeStyle?.contentStyle?.transparency)}>
                            {renderContent()}
                        </div>}
                    </div>
                    <div className="sy-block-view-card-ops flex-center gap-t-20 gap-w-50 gap-b-30">
                        {this.block.isCanEdit() && <ToolTip overlay={lst('添加卡片')}>
                            <div onMouseDown={e => this.block.onAddCardBox(e)} className="size-30 bg-white shadow-s flex-center cursor border circle text-1 link-hover"> <Icon size={18} icon={PlusSvg}></Icon></div>
                        </ToolTip>}
                    </div>
                </div>
            </div>
        </div>
    }
}
