
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
import { MenuItemType } from "../../../../component/view/menu/declare";
import { useCardBoxStyle } from "../../../../extensions/doc.card/style";
import { Point, Rect } from "../../../common/vector/point";
import { PageLayoutType } from "../../../page/declare";
import { GridMap } from "../../../page/grid";
import { BlockRenderRange } from "../../enum";
import { prop, url, view } from "../../factory/observable";
import { BlockView } from "../../view";
import { ChildsArea } from "../../view/appear";
import "./style.less";
import { ToolTip } from "../../../../component/view/tooltip";
import { BoxFillType, BoxStyle } from "../../../../extensions/doc.card/declare";

@url('/card/box')
export class CardBox extends Block {
    init() {
        this.gridMap = new GridMap(this)
    }
    async openContextmenu(event: React.MouseEvent) {
        var r = await useSelectMenuItem(
            { roundArea: Rect.fromEvent(event) },
            [
                {
                    name: 'copylink',
                    icon: LinkSvg,
                    text: "复制链接"
                },
                {
                    name: 'cloneCard',
                    icon: DuplicateSvg,
                    text: "复制卡片"
                },
                { type: MenuItemType.divide },
                {
                    name: 'background',
                    icon: CardBackgroundFillSvg,
                    text: "更换背景"
                },
                {
                    name: 'style',
                    icon: CardBrushSvg,
                    text: "卡片样式"
                },
                {
                    name: 'merge',
                    disabled: this.prev && this.prev instanceof CardBox ? false : true,
                    icon: ArrowUpSvg,
                    text: "合并内容到上一个"
                },
                { type: MenuItemType.divide },
                {
                    name: 'delete',
                    icon: TrashSvg,
                    text: "删除卡片"
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
    async onAddCardBox(event: React.MouseEvent) {
        this.page.onAction('onAddCardBox', async () => {
            var d = {
                url: '/card/box',
                blocks: {
                    childs: [
                        { url: '/card/box/title' }
                    ]
                }
            };
            var pa = this.parent;
            var nb = await pa.appendBlock(d, this.at + 1, this.parentKey);
            this.page.addUpdateEvent(async () => {
                this.page.kit.anchorCursor.onFocusBlockAnchor(nb, { merge: true, render: true, last: true })
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
    cardFill: BoxFillType = { mode: 'none', color: '' }
    @prop()
    cardStyle: BoxStyle = { color: 'light', transparency: 'frosted' }
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
}
/*** 在一个页面上，从视觉上有多个视图块，
 * 如每个页面都有一个初始的内容视图，不可拖动
 *  但页面可以会有弹层等一些其它的视图
 */
@view('/card/box')
export class ViewComponent extends BlockView<CardBox>{
    contentEl: HTMLElement;
    render() {
        var style: CSSProperties = {};
        if (this.block.page?.pageLayout?.type == PageLayoutType.docCard) {
            style.display = 'block';
            style.width = '100%';
            style.boxSizing = 'border-box';
            if (this.block.cardFill.mode == 'color') {
                style.backgroundColor = this.block.cardFill.color;
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
                        {this.block.isCanEdit() && <ToolTip overlay={'添加卡片'}>
                            <div onMouseDown={e => this.block.onAddCardBox(e)} className="size-30 bg-white shadow flex-center cursor border circle text-1 link-hover"> <Icon size={18} icon={PlusSvg}></Icon></div>
                        </ToolTip>}
                    </div>
                </div>
            </div>
        </div>
    }
}
