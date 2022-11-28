
import React, { CSSProperties } from "react";
import { Block } from "../..";
import { CopyText } from "../../../../component/copy";
import { ShyAlert } from "../../../../component/lib/alert";
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
import { Rect } from "../../../common/vector/point";
import { PageLayoutType } from "../../../page/declare";
import { url, view } from "../../factory/observable";
import { BlockView } from "../../view";
import { ChildsArea } from "../../view/appear";

import "./style.less";
@url('/card/box')
export class CardBox extends Block {
    get isView() {
        return true;
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
        var g = await useCardBoxStyle({ open: name as any, fill: { mode: 'none' } });
        if (g) {

        }
    }
}
/*** 在一个页面上，从视觉上有多个视图块，
 * 如每个页面都有一个初始的内容视图，不可拖动
 *  但页面可以会有弹层等一些其它的视图
 */
@view('/card/box')
export class ViewComponent extends BlockView<CardBox>{
    render() {
        var style: CSSProperties = {};
        if (this.block.page?.pageLayout?.type == PageLayoutType.docCard) {
            style.display = 'block';
            style.width = '100%';
            style.boxSizing = 'border-box';
        }
        var screenStyle = this.block.page.getScreenStyle();
        return <div style={style}>
            <div className="visible-hover" style={screenStyle}>
                <div className="relative padding-20 round-16 sy-block-card-box">
                    <div className="flex visible pos-top-right gap-r-20 gap-t-20">
                        <span className="flex-center cursor round item-hover size-30" onMouseDown={e => this.block.openContextmenu(e)}> <Icon size={18} icon={DotsSvg}></Icon></span>
                    </div>
                    <div ><ChildsArea childs={this.block.childs}></ChildsArea></div>
                </div>
                <div className="visible flex-center gap-h-20">
                    <div onMouseDown={e => this.block.onAddCardBox(e)} className="size-30 bg-white shadow flex-center cursor border circle item-hover text-1"> <Icon size={18} icon={PlusSvg}></Icon></div>
                </div>
            </div>
        </div>
    }
}
