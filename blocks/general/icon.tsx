import React from "react";
import { Icon } from "../../component/view/icon";
import { useIconPicker } from "../../extensions/icon";
import { IconArguments } from "../../extensions/icon/declare";
import { Block } from "../../src/block";
import { BlockDirective, BlockDisplay, BlockRenderRange } from "../../src/block/enum";
import { url, prop, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";
import { Rect } from "../../src/common/vector/point";
import { MenuItem, MenuItemType } from "../../component/view/menu/declare";
import { lst } from "../../i18n/store";
import { GlobalLinkSvg, Edit1Svg, DotsSvg, RefreshSvg } from "../../component/svgs";
import { PageLink } from "../../extensions/link/declare";
import { channel } from "../../net/channel";
import { LinkPageItem, getPageIcon } from "../../src/page/declare";
import { useLinkPicker } from "../../extensions/link/picker";
import { MenuPanel } from "../../component/view/menu";
import { ToolTip } from "../../component/view/tooltip";
import "./style.less";
@url('/icon')
export class BlockIcon extends Block {
    @prop()
    src: IconArguments = { name: 'byte', code: 'hamburger-button' };
    @prop()
    size: number = 32;
    @prop()
    link: PageLink = null;
    display = BlockDisplay.block;
    async getHtml() {
        if (this.src && this.src.code) {
            return `<span>${this.src.code}</span>`
        }
        else return '';
    }
    async getMd() {
        return this.src?.code || '';
    }
    async onGetContextMenus() {
        if (this.isFreeBlock) {
            return await this.onGetBoardContextMenus()
        }
        var rs = await super.onGetContextMenus();
        var pageLink: LinkPageItem;
        if (this.link?.pageId) {
            var pa = await channel.get('/page/item', { id: this.link.pageId });
            if (pa?.ok) { pageLink = pa.data.item; }
        }
        var alignItem = rs.find(g => g.name == 'text-center');
        if (alignItem) {
            alignItem.text = lst('对齐')
        }
        var at = rs.findIndex(g => g.name == 'text-center') - 1;
        var ns = [8, 12, 16, 24, 32, 48, 64, 72, 96, 128, 144, 180, 256];
        rs.splice(at, 0, ...[
            {
                type: MenuItemType.divide
            },
            {
                text: lst('图标大小'),
                icon: { name: 'byte', code: 'zoom-in' } as any,
                childs: ns.map(n => {
                    return {
                        name: 'size', text: n.toString(), value: n, checkLabel: this.size == n
                    }
                })
            },
            {
                name: 'replace',
                icon: RefreshSvg,
                text: lst('更换图标')
            },
            {
                type: MenuItemType.divide
            },
        ]);
        at = rs.findIndex(g => g.name == 'text-center');
        rs.splice(at, 0, ...[
            {
                text: lst('添加链接...'),
                icon: { name: 'bytedance-icon', code: 'link-two' },
                name: this.link ? undefined : "imageLink",
                childs: this.link ? [
                    {
                        name: 'imageLink',
                        text: pageLink?.text || this.link?.url,
                        value: pageLink,
                        icon: pageLink ? getPageIcon(pageLink) : GlobalLinkSvg,
                        btns: [{ icon: Edit1Svg, name: 'editImageLink' }]
                    }
                ] : undefined
            } as any,
            {
                type: MenuItemType.divide
            }
        ])
        return rs;
    }
    async onContextMenuBtnClick(item: MenuItem<string | BlockDirective>, event: React.MouseEvent<Element, MouseEvent>, clickName: string, mp: MenuPanel<any>) {
        if (item.name == 'imageLink') {
            var r = await useLinkPicker({ roundArea: Rect.fromEvent(event).update(null, null, null, 10) }, {
                url: this.link?.url,
                pageId: this.link?.pageId,
                text: (item?.value as PageLink)?.text
            }, { allowCreate: false });
            if (r) {
                var link = Array.isArray(r.refLinks) ? r.refLinks[0] : r.link;
                await this.onUpdateProps({ link: link }, { range: BlockRenderRange.self });
                mp.updateItems(await this.onGetContextMenus())
            }
        }
    }
    async onClickContextMenu(item: MenuItem<BlockDirective | string>, event: MouseEvent) {
        if (item?.name == 'size') {
            await this.page.onAction('iconSize', async () => {
                await this.updateProps({ size: item.value }, BlockRenderRange.self);
            });
            return;
        }
        else if (item?.name == 'imageLink') {
            var rgc = await useLinkPicker({ roundArea: Rect.fromEle(this.el).update(null, null, null, 10) }, {
            }, { allowCreate: false });
            if (rgc) {
                var link = Array.isArray(rgc.refLinks) ? rgc.refLinks[0] : rgc.link;
                await this.onUpdateProps({ link: link }, { range: BlockRenderRange.self });
            }
        }
        else await super.onClickContextMenu(item, event);
    }
    @prop()
    align: 'left' | 'center' = 'left';
    getVisibleHandleCursorPoint() {
        var icon = this.el.querySelector('.flex-center') as HTMLElement;
        var rect = Rect.fromEle(icon);
        var point = rect.leftMiddle;
        return point;
    }
    async changeIcon(event: React.MouseEvent) {

        var icon = await useIconPicker({ roundArea: Rect.fromEvent(event) }, this.src, { visibleColor: false });
        if (typeof icon != 'undefined') {
            if (icon == null) this.onDelete()
            else this.onUpdateProps({ src: icon }, { range: BlockRenderRange.self });
        }
    }
}

@view('/icon')
export class BlockIconView extends BlockView<BlockIcon>{

    mousedown(event: React.MouseEvent) {
        if (this.block.link) {
            if (this.block.link.url) {
                window.open(this.block.link.url)
                event.stopPropagation();
            }
            else if (this.block.link.pageId) {
                event.stopPropagation();
                channel.air('/page/open', { item: this.block.link.pageId })
            }
        }
    }
    renderView() {
        var icon = this.block.src;
        if (icon.code && (icon as any).mime) {
            icon = { name: 'emoji', code: icon.code };
        }
        var cs = this.block.contentStyle;
        var bg = cs.backgroundColor;
        delete cs.backgroundColor;
        if (this.block.align == 'center') cs.justifyContent = 'center';
        else if (this.block.align == 'left') cs.justifyContent = 'flex-start';
        else if (this.block.align == 'right') cs.justifyContent = 'flex-end';
        var gap = 10;
        return <div style={this.block.visibleStyle}>
            <div className="flex" style={cs}>
                <div className="flex-center relative  visible-hover" onMouseDown={e => this.mousedown(e)} style={{
                    backgroundColor: bg,
                    width: this.block.size + gap,
                    height: this.block.size + gap,
                    borderRadius: 5,
                    cursor: 'pointer'
                }}>
                    <Icon icon={{ ...icon }} size={this.block.size}></Icon>
                    {this.block.isCanEdit() && <>
                        <div style={{ zIndex: 1000, top: -24, right: gap }}
                            className="h-24 visible  pos-top-right flex round bg-white shadow-s">
                            <ToolTip overlay={lst('更换图标')}><span onMouseDown={async e => {
                                e.stopPropagation();
                                var el = (e.currentTarget as HTMLElement).parentNode as HTMLElement;
                                el?.classList.remove('visible')
                                await this.block.changeIcon(e)
                                el.classList.add('visible')
                            }} className="size-24 round flex-center item-hover cursor remark">
                                <Icon size={18} icon={RefreshSvg}></Icon>
                            </span></ToolTip>
                            <span onMouseDown={async e => {
                                e.stopPropagation();
                                var el = (e.currentTarget as HTMLElement).parentNode as HTMLElement;
                                el?.classList.remove('visible')
                                await this.block.onContextmenu(e.nativeEvent)
                                el.classList.add('visible')
                            }} className="size-24 round flex-center item-hover cursor  remark ">
                                <Icon size={18} icon={DotsSvg}></Icon>
                            </span>
                        </div>
                    </>}
                </div>
            </div>
        </div>
    }
}