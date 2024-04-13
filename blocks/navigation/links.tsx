import React from "react";
import { Block } from "../../src/block";
import { prop, url, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";
import { channel } from "../../net/channel";
import { LinkPageItem, getPageIcon, getPageText } from "../../src/page/declare";
import { Icon } from "../../component/view/icon";
import { Point, Rect } from "../../src/common/vector/point";
import { BlockDirective, BlockRenderRange } from "../../src/block/enum";
import { MenuItem, MenuItemType } from "../../component/view/menu/declare";
import { lst } from "../../i18n/store";

@url('/links')
export class LinkPaths extends Block {
    async didMounted() {
        this.loadLinks();
    }
    async loadLinks() {
        var c = await channel.get('/page/query/parents',
            {
                ws: this.page.ws,
                id: this.page.getPageDataInfo()?.id
            });
        if (c?.ok) {
            this.items = c.data.items.reverse();
        }
        else this.items = [];
        this.forceUpdate();
    }
    items: LinkPageItem[] = [];
    getVisibleHandleCursorPoint(): Point {
        if (!this.el) return;
        var rect = Rect.fromEle(this.el.querySelector('span') as HTMLElement);
        return rect.leftMiddle;
    }
    @prop()
    align: 'left' | 'center' | 'right' = 'left';
    @prop()
    joinChar: '/' | '>' = '/';
    @prop()
    hiddenSelection: boolean = false;
    async onGetContextMenus() {
        if (this.isFreeBlock) {
            return await this.onGetBoardContextMenus()
        }
        var rs = await super.onGetContextMenus();
        var at = rs.findIndex(g => g.name == 'text-center');
        rs.splice(at + 1, 0, ...[{
            name: "joinChar",
            text: lst('分隔符'),
            type: MenuItemType.select,
            value: this.joinChar,
            icon: { name: 'byte', code: 'distribute-horizontally' } as any,
            options: [
                { text: '/', value: '/' },
                { text: '>', value: '>' }
            ]
        },
        {
            name: 'hiddenSelection',
            text: lst('仅显示链接'),
            icon: { name: 'bytedance-icon', code: 'link-four' } as any,
            type: MenuItemType.switch,
            checked: this.hiddenSelection
        },
            // { type: MenuItemType.divide }
        ]);
        var dat = rs.findIndex(g => g.name == BlockDirective.delete);
        rs.splice(dat + 1, 0, {
            type: MenuItemType.divide
        },
            {
                type: MenuItemType.help,
                text: lst('了解如何使用面包屑导航'),
                url: window.shyConfig?.isUS ? "https://help.shy.live/page/1833" : "https://help.shy.live/page/1833"
            })
        return rs;
    }
    async onContextMenuInput(item: MenuItem<BlockDirective | string>) {
        if (item?.name == 'hiddenSelection') {
            return await this.onUpdateProps({ hiddenSelection: item.checked }, { range: BlockRenderRange.self })
        }
        else if (item?.name == 'joinChar') {
            return await this.onUpdateProps({ joinChar: item.value }, { range: BlockRenderRange.self })
        }
        await super.onContextMenuInput(item);
    }
    async onClickContextMenu(this: Block, item: MenuItem<string | BlockDirective>, event: MouseEvent, options?: { merge?: boolean; }): Promise<void> {
        if (item?.name == 'joinChar') {
            return await this.onUpdateProps({ joinChar: item.value }, { range: BlockRenderRange.self })
        }
        await super.onClickContextMenu(item, event, options);
    }
}

@view('/links')
export class LinkPathsView extends BlockView<LinkPaths> {
    mousedown(item: LinkPageItem) {
        if (item.id == this.block.page.getPageDataInfo()?.id) return;
        channel.air('/page/open', { item: item.id });
    }
    renderJoin() {
        if (this.block.joinChar == '>')
            return <Icon className={'remark flex-fixed flex-center '} size={20} icon={{ name: "byte", code: 'right' }}></Icon>
        return <span className="padding-w-5 flex-fixed padding-h-2 remark f-20">/</span>
    }
    renderItem(item: LinkPageItem, index: number, items: LinkPageItem[]) {
        if (item.mime == 20 || item.mime == 'pages')
            return <span className="flex-center flex-fixed" key={item.id}>
                <span className="text-over flex-auto">{item.text}</span>
                {index == items.length - 1 ? "" : this.renderJoin()}
            </span>
        else return <span className="flex-center flex-fixed" key={item.id}>
            <span
                onMouseDown={e => this.mousedown(item)}
                className="flex item-hover cursor round padding-w-5 padding-h-2  ">
                <Icon className={'remark gap-r-3  flex-fixed'} size={16} icon={getPageIcon(item)}></Icon>
                <span className="text-over flex-auto">{getPageText(item)}</span>
            </span>
            {index == items.length - 1 ? "" : this.renderJoin()}
        </span>
    }
    getItems() {
        var items = this.block.items;
        if (this.block.hiddenSelection) {
            items = items.filter(item => !(item.mime == 20 || item.mime == 'pages'))
        }
        return items;
    }
    renderView() {
        var items = this.getItems();
        var cs = this.block.contentStyle;
        if (this.block.align == 'center') cs.justifyContent = 'center';
        else if (this.block.align == 'right') cs.justifyContent = 'flex-end';
        return <div className="sy-block-sub-links" style={this.block.visibleStyle}>
            <div className="flex flex-wrap" style={cs}>
                {items.map((item, i) => {
                    return this.renderItem(item, i, items)
                })}
            </div>
        </div>
    }
}