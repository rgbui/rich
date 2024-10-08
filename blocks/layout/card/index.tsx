import React, { CSSProperties } from "react";
import { Block } from "../../../src/block";
import { BlockFactory } from "../../../src/block/factory/block.factory";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { ChildsArea } from "../../../src/block/view/appear";
import { GridMap } from "../../../src/page/grid";
import { lst } from "../../../i18n/store";
import { LinkPageItem, PageThemeStyle, getPageIcon } from "../../../src/page/declare";
import { Icon } from "../../../component/view/icon";
import { DotsSvg, Edit1Svg, GlobalLinkSvg, PlatteSvg } from "../../../component/svgs";
import { Rect } from "../../../src/common/vector/point";
import { useCardTheme } from "../../../extensions/theme/card";
import lodash from "lodash";
import { MenuItem, MenuItemType } from "../../../component/view/menu/declare";
import { BlockDirective, BlockRenderRange } from "../../../src/block/enum";
import { getCardStyle } from "../../../extensions/theme/themes";
import { Tip } from "../../../component/view/tooltip/tip";
import { MouseDragger } from "../../../src/common/dragger";
import { memoryCopyData, memoryReadData } from "../../../src/page/common/copy";
import "./style.less";
import { PageLink } from "../../../extensions/link/declare";
import { channel } from "../../../net/channel";
import { MenuPanel } from "../../../component/view/menu";
import { useLinkPicker } from "../../../extensions/link/picker";

@url('/card')
export class PageCard extends Block {
    async didMounted(): Promise<void> {
        await this.onBlockReloadData(async () => {
            if (this.blocks.childs.length == 0) {
                this.initPageCard();
            }
        })
    }
    async initPageCard() {
        var newBlock = await BlockFactory.createBlock('/textspan',
            this.page,
            { content: '', placeholder: lst('添加卡片内容') },
            this
        );
        this.blocks.childs.push(newBlock);
        this.forceManualUpdate();
    }
    init() {
        this.gridMap = new GridMap(this)
    }
    async getMd() {
        return (await this.childs.asyncMap(async b => await b.getMd())).join('  \n')
    }
    @prop()
    cardStyle: PageThemeStyle = {
        name: 'style-1',
        contentStyle: {
            color: "light",
            transparency: "solid",
            bgStyle: { mode: 'color', color: '#fff' },
            round: 4,
            border: '1px solid #d9e1ec',
            shadow: '0px 1px 3px rgba(18, 18, 18, 0.1)'
        },
        coverStyle: {
            display: 'none'
        }
    }
    @prop()
    link: PageLink = null;
    async openCardStyle() {
        var rect = Rect.fromEle(this.el);
        var nRect = new Rect(rect.rightTop, rect.rightTop.move(-30, 30))
        await useCardTheme(this, nRect)
    }
    async onGetContextMenus() {
        var pageLink: LinkPageItem;
        if (this.link?.pageId) {
            var pa = await channel.get('/page/item', { id: this.link.pageId });
            if (pa?.ok) { pageLink = pa.data.item; }
        }
        var rs = await super.onGetContextMenus();
        var at = rs.findIndex(g => g.name == BlockDirective.comment);
        lodash.remove(rs, g => g.name == 'color');
        var ns: MenuItem<string | BlockDirective>[] = [];
        ns.push({
            text: lst('卡片样式'),
            icon: PlatteSvg,
            name: 'cardStyle'
        });
        var d = memoryReadData('PageCard.cardStyle');
        ns.push({
            text: lst('卡片操作'),
            icon: { name: 'byte', code: 'write' },
            childs: [
                {
                    name: 'copyStyle',
                    icon: { name: 'byte', code: 'format-brush' } as any,
                    text: lst("复制卡片样式")
                },
                {
                    name: 'pasteStyle',
                    icon: { name: 'byte', code: 'magic-wand' } as any,
                    value: lodash.cloneDeep(d),
                    disabled: d ? false : true,
                    text: lst("粘贴卡片样式")
                },
                {
                    type: MenuItemType.divide
                },
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
            ]
        })
        ns.push(
            {
                name: 'autoContentHeight',
                type: MenuItemType.switch,
                checked: this.autoContentHeight ? false : true,
                text: lst('固定高度'),
                icon: { name: 'byte', code: 'auto-height-one' }
            }
        )
        ns.push({ type: MenuItemType.divide })
        rs.splice(at, 0, ...ns)
        var dat = rs.findIndex(c => c.name == BlockDirective.delete);
        if (dat > -1) {
            rs.splice(dat + 1, 0, { type: MenuItemType.divide }, {
                type: MenuItemType.help,
                text: lst('了解如何使用卡片块'),
                url: window.shyConfig?.isUS ? "https://help.shy.red/page/76#6R5HYHohVAmbonKCMEHBco" : "https://help.shy.live/page/281"
            })
        }
        return rs;
    }
    getResolveContent(this: Block) {
        return lst('卡片')
    }
    async onContextMenuInput(this: Block, item: MenuItem<BlockDirective | string>) {
        if (item?.name == 'autoContentHeight') {
            this.onUpdateProps({ autoContentHeight: item.checked ? false : true }, { range: BlockRenderRange.self });
        }
        else await super.onContextMenuInput(item);
    }
    async onClickContextMenu(item: MenuItem<string | BlockDirective>, event: MouseEvent): Promise<void> {
        if (item.name == 'cardStyle') {
            this.openCardStyle();
            return;
        }
        else if (item.name == 'copyStyle') {
            memoryCopyData('PageCard.cardStyle', lodash.cloneDeep(this.cardStyle))
        }
        else if (item.name == 'pasteStyle') {
            var value = item.value;
            await this.onUpdateProps({
                cardStyle: value
            }, {
                range: BlockRenderRange.self
            })
        }
        else if (item?.name == 'imageLink') {
            var rgc = await useLinkPicker({ roundArea: Rect.fromEle(this.el).update(null, null, null, 10) }, {
            }, { allowCreate: false });
            if (rgc) {
                var link = Array.isArray(rgc.refLinks) ? rgc.refLinks[0] : rgc.link;
                await this.onUpdateProps({ link: link }, { range: BlockRenderRange.self });
            }
        }
        else return await super.onClickContextMenu(item, event);
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
    getScrollDiv(): HTMLElement {
        var p = this.parentPanel;
        if (p) return p.getScrollDiv()
        else return this.page.getScrollDiv();
    }
    @prop()
    autoContentHeight: boolean = true;
    @prop()
    contentHeight: number = 200;

    @prop()
    cardCoverHeight = 120;

    @prop()
    cardCoverWidth = 33.3;

}

@view('/card')
export class PageCardView extends BlockView<PageCard> {
    mousedownLink(event: React.MouseEvent) {
        if (this.block.link) {
            if (this.block.link.url) {
                window.open(this.block.link.url)
                event.stopPropagation();
            }
            else if (this.block.link.pageId) {
                event.stopPropagation();
                channel.act('/page/open', { item: this.block.link.pageId })
            }
        }
    }
    onResize(event: React.MouseEvent) {
        event.stopPropagation();
        var height = this.block.contentHeight;
        MouseDragger({
            event,
            moving: (e, d, end) => {
                var dy = e.clientY - event.clientY;
                var h = height + dy;
                if (h < 60) h = 60;
                this.block.contentHeight = h;
                if (end) {
                    this.block.onManualUpdateProps(
                        { contentHeight: height },
                        { contentHeight: h }
                    );
                }
                else this.forceUpdate()
            }
        })
    }
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
                },
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
    renderCard() {
        var s = this.block.cardStyle;
        var self = this;
        var { contentStyle, coverStyle } = getCardStyle(s);
        if (s.coverStyle?.display == 'none') {
            return <div >
                <div className="padding-10" style={{
                    ...contentStyle,
                    height: this.block.autoContentHeight !== true ? this.block.contentHeight : undefined,
                    overflowY: (this.block.autoContentHeight !== true ? "overlay" : "hidden") as any,
                }
                }><ChildsArea childs={this.block.childs}></ChildsArea>
                </div>
            </div>
        }
        else if (s.coverStyle.display == 'inside') {
            var style: CSSProperties = {

            }
            if (contentStyle.backgroundColor) {
                style.backgroundColor = contentStyle.backgroundColor
                style.backdropFilter = contentStyle.backdropFilter;
                delete contentStyle.backgroundColor;
                delete contentStyle.backdropFilter;
            }
            var boxStyle = { ...coverStyle, ...contentStyle }
            style.borderRadius = boxStyle.borderRadius;
            if (s.contentStyle?.transparency == 'solid') {
                delete style.background;
                delete style.backdropFilter;
                delete style.backgroundColor;
            }
            return <div className="relative" style={boxStyle}>
                <div className="padding-10 min-h-60" style={{
                    ...style,
                    height: this.block.autoContentHeight !== true ? this.block.contentHeight : undefined,
                    overflowY: (this.block.autoContentHeight !== true ? "overlay" : "hidden") as any,
                }}><ChildsArea childs={this.block.childs}></ChildsArea>
                </div>
            </div>
        }
        else if (s.coverStyle.display == 'inside-cover') {
            return <div style={contentStyle} >
                <div className="relative" style={{
                    ...coverStyle,
                    height: self.block.cardCoverHeight
                }}>
                    {self.block.isCanEdit() && <div className="item-hover-define" onMouseDown={e => {
                        self.dragSize('top', e);
                    }} style={{
                        position: 'absolute',
                        bottom: -3,
                        left: 0,
                        height: 6,
                        right: 0,
                        cursor: 'row-resize',
                        color: 'rgba(55, 53, 47, 0.16)',
                    } as any}></div>}
                </div>
                <div className="padding-10 min-h-60" style={{
                    height: this.block.autoContentHeight !== true ? this.block.contentHeight : undefined,
                    overflowY: (this.block.autoContentHeight !== true ? "overlay" : "hidden") as any,
                }} >
                    <ChildsArea childs={this.block.childs}></ChildsArea>
                </div>
            </div>
        }
        else if (s.coverStyle.display == 'inside-cover-left') {
            return <div className="flex flex-full" style={contentStyle} >
                <div className="flex-fixed relative" style={{
                    ...coverStyle,
                    width: (self.block.cardCoverWidth) + '%',
                }}>
                    {self.block.isCanEdit() && <div
                        className="item-hover-define"
                        onMouseDown={e => {
                            self.dragSize('left', e);
                        }}
                        style={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            right: -3,
                            width: 6,
                            cursor: 'col-resize',
                            borderRadius: 3,
                            color: 'rgba(55, 53, 47, 0.16)',
                        }}
                    ></div>}
                </div>
                <div className="padding-10 flex-auto min-h-60" style={{
                    height: this.block.autoContentHeight !== true ? this.block.contentHeight : undefined,
                    overflowY: (this.block.autoContentHeight !== true ? "overlay" : "hidden") as any,
                }} >
                    <ChildsArea childs={this.block.childs}></ChildsArea>
                </div>
            </div>
        }
        else if (s.coverStyle.display == 'inside-cover-right') {
            return <div className="flex flex-full" style={contentStyle} >
                <div className="padding-10 flex-auto min-h-60" style={{
                    height: this.block.autoContentHeight !== true ? this.block.contentHeight : undefined,
                    overflowY: (this.block.autoContentHeight !== true ? "overlay" : "hidden") as any,
                }}>
                    <ChildsArea childs={this.block.childs}></ChildsArea>
                </div>
                <div className="flex-fixed relative" style={{ ...coverStyle, width: (self.block.cardCoverWidth) + '%', }}>
                    {self.block.isCanEdit() && <div
                        className="item-hover-define"
                        onMouseDown={e => {
                            self.dragSize('right', e);
                        }}
                        style={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: -3,
                            width: 6,
                            cursor: 'col-resize',
                            borderRadius: 3,
                            color: 'rgba(55, 53, 47, 0.16)',
                        }}
                    ></div>}
                </div>
            </div>
        }
    }
    renderView() {
        return <div style={this.block.visibleStyle}>
            <div className="relative" style={this.block.contentStyle}>
                <div className=' relative visible-hover' >
                    {this.block.isCanEdit() && <>
                        <div style={{ zIndex: 1000, top: -24 }}
                            className="h-24 visible  pos-top-right flex round bg-white shadow-s">
                            <span onMouseDown={async e => {
                                e.stopPropagation();
                                var el = (e.currentTarget as HTMLElement).parentNode as HTMLElement;
                                el?.classList.remove('visible')
                                await this.block.openCardStyle()
                                el.classList.add('visible')
                            }} className="size-24 round flex-center item-hover cursor remark">
                                <Icon size={18} icon={PlatteSvg}></Icon>
                            </span>
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
                    <div>{this.renderCard()}</div>
                </div>
                {this.block.isCanEdit() && this.block.autoContentHeight !== true && <Tip text={'拖动标签页高度'}><div className="sy-block-card-resize visible" onMouseDown={e => this.onResize(e)}></div></Tip>}
            </div>
            {this.renderComment()}
        </div>
    }
}