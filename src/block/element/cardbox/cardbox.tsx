
import React, { CSSProperties } from "react";
import { Block } from "../..";
import {
    ArrowUpSvg,
    CardBackgroundFillSvg,
    CardBrushSvg,
    DotsSvg,
    DuplicateSvg,
    LinkSvg,
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
import "./style.less";
import { ToolTip } from "../../../../component/view/tooltip";
import { DropDirection } from "../../../kit/handle/direction";
import { lst } from "../../../../i18n/store"
import { BlockUrlConstant } from "../../constant";

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
                        name: 'background',
                        icon: CardBackgroundFillSvg,
                        text: lst("更换背景")
                    },
                    {
                        name: 'style',
                        icon: CardBrushSvg,
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
                } else if (r.item.name == 'background') {
                    this.onOpenCardStyle(r.item.name)
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
                var head = nb.find(g => g.url == BlockUrlConstant.Head)
                this.page.kit.anchorCursor.onFocusBlockAnchor(head, { merge: true, render: true, last: true })
            })
        });
    }
    async onOpenCardStyle(name = 'background') {
        var g = await useCardBoxStyle({
            open: name as any,
            fill: this.cardFill,
            cardStyle: this.cardStyle
        }, (g) => {
            this.onLazyUpdateProps({
                cardFill: g.fill,
                cardStyle: g.cardStyle
            }, { range: BlockRenderRange.self })
        });
        if (g) {
            this.onUpdateProps({
                cardFill: g.fill,
                cardStyle: g.cardStyle
            }, { range: BlockRenderRange.self })
        }
    }
    @prop()
    cardFill: PageThemeStyle['bgStyle'] = { mode: 'none', color: '' }
    @prop()
    cardStyle: PageThemeStyle['contentStyle'] = { color: 'light', transparency: 'frosted' }
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
                name: 'background',
                icon: CardBackgroundFillSvg,
                text: lst("更换背景")
            },
            {
                name: 'style',
                icon: CardBrushSvg,
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
        } else if (item.name == 'background') {
            this.onOpenCardStyle(item.name)
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
        if (this.block.page?.pageLayout?.type == PageLayoutType.docCard) {
            style.display = 'block';
            style.width = '100%';
            style.boxSizing = 'border-box';
            if (this.block.cardFill.mode == 'color') {
                style.backgroundColor = this.block.cardFill.color;
            }
            else if (this.block.cardFill.mode == 'grad') {
                style.backgroundImage = this.block.cardFill.grad.bg;
            }
            else if (this.block.cardFill.mode == 'image' || this.block.cardFill.mode == 'uploadImage') {
                style.backgroundImage = `url(${this.block.cardFill.src})`;
                style.backgroundSize = 'cover';
                style.backgroundRepeat = 'no-repeat';
                style.backgroundPosition = 'center center';
            }
        }
        var screenStyle = this.block.page.getScreenStyle();
        var hasPic = this.block.cardFill.mode == 'image' || this.block.cardFill.mode == 'uploadImage';
        var gapStyle: CSSProperties = {
            paddingTop: '2rem',
            paddingBottom: '2rem'
        }
        if (hasPic) {
            gapStyle.paddingTop = '8rem';
            gapStyle.paddingBottom = '8rem';
        }
        return <div style={style}>
            <div className="visible-hover" style={screenStyle}>
                <div style={gapStyle}>
                    <div ref={e => this.contentEl = e} className={"relative padding-h-30 padding-w-50 round-16 sy-block-card-box" + (" sy-block-card-box-" + this.block.cardStyle.color) + (" sy-block-card-box-" + this.block.cardStyle.transparency)}>
                        {this.block.isCanEdit() && <div className="flex visible pos-top-right gap-r-10 gap-t-10">
                            <span className={"sy-block-card-box-property flex-center cursor round  size-24" + (this.block.cardStyle.transparency == 'noborder' || this.block.cardStyle.color == 'dark' ? " bg-white link-hover" : "item-hover")} onMouseDown={e => this.block.openContextmenu(e)}> <Icon size={18} icon={DotsSvg}></Icon></span>
                        </div>}
                        <div><ChildsArea childs={this.block.childs}></ChildsArea></div>
                    </div>
                    <div className="visible flex-center gap-t-20">
                        {this.block.isCanEdit() && <ToolTip overlay={lst('添加卡片')}>
                            <div onMouseDown={e => this.block.onAddCardBox(e)} className="size-30 bg-white shadow flex-center cursor border circle text-1 link-hover"> <Icon size={18} icon={PlusSvg}></Icon></div>
                        </ToolTip>}
                    </div>
                </div>
            </div>
        </div>
    }
}
