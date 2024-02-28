import React, { CSSProperties } from "react";
import { ArrowLeftSvg, ArrowRightSvg, BlockcolorSvg, BrowserSvg, DotsSvg, PlusSvg, TrashSvg } from "../../../component/svgs";
import { Icon, IconValueType } from "../../../component/view/icon";
import { useSelectMenuItem } from "../../../component/view/menu";
import { MenuItem, MenuItemType } from "../../../component/view/menu/declare";
import { Block } from "../../../src/block";
import { BlockChildKey, BlockUrlConstant } from "../../../src/block/constant";
import { BlockFactory } from "../../../src/block/factory/block.factory";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { ChildsArea } from "../../../src/block/view/appear";
import { MouseDragger } from "../../../src/common/dragger";
import { Point, Rect } from "../../../src/common/vector/point";
import { ActionDirective } from "../../../src/history/declare";
import { BlockDirective, BlockRenderRange } from "../../../src/block/enum";
import { ls, lst } from "../../../i18n/store";
import { Tip } from "../../../component/view/tooltip/tip";
import lodash from "lodash";
import { BackgroundColorList } from "../../../extensions/color/data";
import { ghostView } from "../../../src/common/ghost";
import { util } from "../../../util/util";
import "./style.less";

@url('/tab')
export class Tab extends Block {
    blocks: { childs: Block[], otherChilds: Block[] } = { childs: [], otherChilds: [] };
    tabIndex: number = 0;
    isComposite: Boolean = true;
    get allBlockKeys() {
        return [BlockChildKey.childs, BlockChildKey.otherChilds]
    }
    @prop()
    tabItems: { icon?: IconValueType, text: string }[] = [];
    @prop()
    showIcon: boolean = false;
    @prop()
    contentHeight: number = 200;
    @prop()
    autoContentHeight: boolean = true;
    @prop()
    displayMode: 'border' | 'top-line' | 'button' = 'top-line';

    @prop()
    border: 'border' | 'none' = 'none';

    @prop()
    autoCarousel: number = 0;
    async didMounted(): Promise<void> {
        var isf = false;
        if (this.tabItems.length == 0) {
            if (this.childs.length > 0) {
                var cs = await this.childs.asyncMap(async c => {
                    return { text: c.getBlockContent() };
                })
                this.tabItems = cs;
                this.blocks.childs = [];
                isf = true;
            }
            else {
                await this.createInitTabItems();
                isf = true;
            }
        }
        this.createCarouselTime();
        if (isf) this.forceUpdate()
    }
    async createInitTabItems() {
        this.blocks.childs = [];
        this.blocks.otherChilds = [];
        this.tabItems.push({ text: lst('选项卡1') })
        this.blocks.otherChilds.push(await BlockFactory.createBlock('/tab/page', this.page, { blocks: { childs: [{ url: BlockUrlConstant.TextSpan, content: '' }] } }, this));

        this.tabItems.push({ text: lst('选项卡2') })
        this.blocks.otherChilds.push(await BlockFactory.createBlock('/tab/page', this.page, { blocks: { childs: [{ url: BlockUrlConstant.TextSpan, content: '' }] } }, this));

        this.tabItems.push({ text: lst('选项卡3') })
        this.blocks.otherChilds.push(await BlockFactory.createBlock('/tab/page', this.page, { blocks: { childs: [{ url: BlockUrlConstant.TextSpan, content: '' }] } }, this));

    }
    async onAddTabItem() {
        this.page.onAction(ActionDirective.onTabAddItem, async () => {
            var items = lodash.cloneWith(this.tabItems);
            items.push({ text: lst('选项') });
            await this.updateProps({ tabItems: items }, BlockRenderRange.self)
            var newBlock = await this.appendBlock({
                url: '/tab/page',
                blocks: { childs: [{ url: BlockUrlConstant.TextSpan, content: '' }] }
            },
                this.blocks.otherChilds.length,
                BlockChildKey.otherChilds
            );
            this.tabIndex = this.tabItems.length - 1;
            this.page.addUpdateEvent(async () => {
                this.page.kit.anchorCursor.onFocusBlockAnchor(newBlock, { merge: true, render: true })
            })
        })
    }
    async onTabeItemContextmenu(event: React.MouseEvent, at: number) {
        if (!this.isCanEdit()) return;
        var item = this.tabItems[at];
        var rs: MenuItem<BlockDirective | string>[] = [
            {
                name: 'name',
                type: MenuItemType.inputTitleAndIcon,
                value: item.text,
                icon: item.icon,
            },
            { type: MenuItemType.divide },
            { name: 'prev', text: lst('前移'), disabled: at == 0 ? true : false, icon: ArrowLeftSvg },
            { name: 'after', text: lst('后移'), disabled: at == this.childs.length - 1 ? true : false, icon: ArrowRightSvg },
            { type: MenuItemType.divide },
            { name: 'delete', text: lst('删除'), disabled: this.childs.length == 1 ? true : false, icon: TrashSvg },
        ];
        var um = await useSelectMenuItem(
            { roundArea: Rect.fromEvent(event) },
            rs
        );
        if (um) {
            if (um.item.name == 'delete') {
                this.page.onAction(ActionDirective.onTabRemoveItem, async () => {
                    var items = lodash.cloneDeep(this.tabItems);
                    items.remove(items[at]);
                    await this.updateProps({ tabItems: items }, BlockRenderRange.self)
                    var pre = at - 1;
                    if (pre < 0) pre = 0;
                    this.tabIndex = pre;
                    await this.blocks.otherChilds[at].delete();
                })
            }
            else if (um.item.name == 'after') {
                this.page.onAction(ActionDirective.onTabExchangeItem, async () => {
                    this.tabIndex = at + 1;
                    var items = lodash.cloneDeep(this.tabItems);
                    var current = items[at + 1];
                    items[at + 1] = items[at];
                    items[at] = current;
                    await this.updateProps({ tabItems: items }, BlockRenderRange.self)
                    await this.blocks.otherChilds[at].insertAfter(this.blocks.otherChilds[at + 1], BlockChildKey.otherChilds);
                })
            }
            else if (um.item.name == 'prev') {
                this.page.onAction(ActionDirective.onTabExchangeItem, async () => {
                    this.tabIndex = at - 1;
                    var items = lodash.cloneDeep(this.tabItems);
                    var current = items[at - 1];
                    items[at - 1] = items[at];
                    items[at] = current;
                    await this.updateProps({ tabItems: items }, BlockRenderRange.self)
                    await this.blocks.otherChilds[at].insertBefore(this.blocks.otherChilds[at - 1], BlockChildKey.otherChilds);
                })
            }
        }
        var props: Record<string, any> = {};
        var rn = rs.find(g => g.name == 'name');
        if (rn.value != item.text && rn.value) {
            props.text = rn.value;
        }
        if (!lodash.isEqual(rn.icon, item.icon)) {
            props.icon = rn.icon;
        }
        if (Object.keys(props).length > 0) {
            var items = lodash.cloneDeep(this.tabItems);
            items[at] = { ...items[at], ...props };
            await this.onUpdateProps({
                tabItems: items
            }, { range: BlockRenderRange.self })
        }
    }
    async onDraggerItem(event: React.MouseEvent, at: number) {
        if (event.button == 2) {
            return await this.onTabeItemContextmenu(event, at);
        }
        var ele = event.currentTarget as HTMLElement;
        var parent = ele.parentElement;
        var self = this;
        var he = parent.querySelector('.hover') as HTMLElement;
        if (he) {
            he.classList.remove('hover');
        }
        ele.classList.add('hover');
        var ne = ele.nextElementSibling as HTMLElement;
        MouseDragger({
            event,
            moveStart() {
                ghostView.load(ele, { point: Point.from(event) });
                ele.classList.add('dragging')
                ele.style.pointerEvents = 'none';
            },
            move(ev) {
                ghostView.move(Point.from(ev));
                var el = ev.target as HTMLElement;
                var overTh = el.closest('.sy-block-tab-item') as HTMLElement;
                if (overTh && parent.contains(overTh) && !overTh.classList.contains('sy-block-tab-plus')) {
                    var rect = Rect.fromEle(overTh);
                    if (ev.pageX < rect.center) {
                        parent.insertBefore(ele, overTh);
                    }
                    else {
                        var next = overTh.nextElementSibling;
                        if (next) parent.insertBefore(ele, next)
                        else parent.appendChild(ele)
                    }
                }
            },
            moveEnd(ev, isMove) {
                if (isMove) {
                    ghostView.unload();
                    ele.classList.remove('dragging')
                    ele.style.pointerEvents = 'auto';
                    ele.classList.remove('hover');
                    var cs = Array.from(parent.querySelectorAll('.sy-block-tab-item'));
                    var currentAt = cs.findIndex(g => g === ele);
                    if (ne) {
                        parent.insertBefore(ele, ne);
                    }
                    else {
                        parent.appendChild(ele);
                    }
                    if (at !== currentAt) {
                        self.page.onAction(ActionDirective.onTabExchangeItem, async () => {
                            self.tabIndex = currentAt;
                            var items = lodash.cloneDeep(self.tabItems);
                            items.move(items[at], currentAt);
                            await self.updateProps({ tabItems: items }, BlockRenderRange.self)
                            var sb = self.blocks.otherChilds[at];
                            await sb.move(currentAt);
                            //console.log(self.tabIndex, currentAt, at, JSON.stringify(self.tabItems));
                            // await util.delay(50);
                            // self.forceUpdate();
                        })
                    }
                }
                else {
                    if (self.tabIndex == at) {
                        self.onTabeItemContextmenu(event, at);
                    }
                    else {
                        self.tabIndex = at;
                        self.forceUpdate()
                    }
                }
            }
        })
    }
    async getMd() {
        var tag = '';
        if (this.childs.length > 0) return tag + '' + (await (this.childs.asyncMap(async b => await b.getMd()))).join('') + "  "
        else return tag + '' + this.content + "  "
    }
    getVisiblePanelBound() {
        var t = (this.view as any).tabPages as HTMLElement;
        return Rect.fromEle(t)
    }
    getInnerPanelBlock() {
        return this.otherChilds[this.tabIndex];
    }
    @prop()
    align: 'left' | 'center' = 'left';
    async onGetContextMenus() {
        var rs = await super.onGetContextMenus();
        var rg = rs.find(g => g.name == 'text-center');
        if (rg) {
            rg.text = lst('标签项')
            var pos = rs.findIndex(g => g == rg);
            var at = this.tabIndex;
            var ns: MenuItem<string | BlockDirective>[] = [];
            ns.push({
                text: lst('显示'),
                icon: BrowserSvg,
                childs: [
                    // { name: 'displayMode', text: lst('卡片'), value: 'border', checkLabel: this.displayMode == 'border' },
                    { name: 'displayMode', text: lst('线型'), value: 'top-line', checkLabel: this.displayMode == 'top-line' },
                    { name: 'displayMode', text: lst('按钮'), value: 'button', checkLabel: this.displayMode == 'button' }
                ]
            })
            ns.push({
                type: MenuItemType.divide
            })
            ns.push({
                name: 'autoContentHeight',
                type: MenuItemType.switch,
                checked: this.autoContentHeight,
                text: lst('自适应高度'),
                icon: { name: 'byte', code: 'auto-height-one' }
            });
            ns.push({
                name: 'border',
                type: MenuItemType.switch,
                checked: this.border == 'none' ? false : true,
                text: lst('边框'),
                icon: { name: "byte", code: 'rectangle-one' }
            })
            ns.push({
                text: lst('自动播放'),
                icon: { name: 'byte', code: 'play' },
                childs: [
                    { name: "autoCarousel", text: lst('关闭'), value: 0, checkLabel: this.autoCarousel == 0 },
                    { name: "autoCarousel", text: '1s', value: 1, checkLabel: this.autoCarousel == 1 },
                    { name: "autoCarousel", text: '2s', value: 2, checkLabel: this.autoCarousel == 2 },
                    { name: "autoCarousel", text: '5s', value: 5, checkLabel: this.autoCarousel == 5 },
                ]
            })
            ns.push({ type: MenuItemType.divide })
            ns.push(
                {
                    text: lst('颜色'),
                    icon: BlockcolorSvg,
                    name: 'color',
                    childs: [
                        {
                            text: lst('背景颜色'),
                            type: MenuItemType.text
                        },
                        {
                            type: MenuItemType.color,
                            name: 'fillColor',
                            block: ls.isCn ? false : true,
                            options: BackgroundColorList().map(f => {
                                return {
                                    text: f.text,
                                    value: f.color,
                                    checked: this.pattern?.getFillStyle()?.color == f.color ? true : false
                                }
                            })
                        },
                    ]
                }
            )
            lodash.remove(rs, g => g.name == 'color');
            rs.splice(pos + 1, 0, ...ns)
        }
        return rs;
    }
    async onClickContextMenu(item: MenuItem<string | BlockDirective>, e) {
        switch (item.name) {
            case 'displayMode':
                await this.onUpdateProps({ displayMode: item.value }, { range: BlockRenderRange.self })
                return;
            case 'autoCarousel':
                await this.onUpdateProps({ autoCarousel: item.value }, { range: BlockRenderRange.self })
                this.createCarouselTime();
                return;
        }
        return await super.onClickContextMenu(item, e);
    }
    autoCarouselTime;
    isOver: boolean = false;
    createCarouselTime() {
        if (this.autoCarousel > 0) {
            this.autoCarouselTime = setInterval(() => {
                if (this.isOver == false) {
                    this.tabIndex = this.tabIndex + 1;
                    if (this.tabIndex >= this.tabItems.length) this.tabIndex = 0;
                    this.forceUpdate()
                }
            }, this.autoCarousel * 1000);
        }
        else {
            if (this.autoCarouselTime) {
                clearInterval(this.autoCarouselTime);
                this.autoCarouselTime = null;
            }
        }
    }
    async onContextMenuInput(this: Block, item: MenuItem<BlockDirective | string>) {
        if (item?.name == 'border') {
            this.onUpdateProps({ border: item.checked ? "border" : "none" }, { range: BlockRenderRange.self });
        }
        else if (item?.name == 'autoContentHeight') {
            this.onUpdateProps({ autoContentHeight: item.checked }, { range: BlockRenderRange.self });
        }
        else await super.onContextMenuInput(item);
    }
    get tabPages() {
        return (this.view as any).tabPages as HTMLElement;
    }
    getVisibleHandleCursorPoint() {
        var bound = this.getVisibleContentBound()
        if (bound) {
            var pos = Point.from(bound);
            pos = pos.move(0, 3 + 4 + util.remToPx(this.page.lineHeight) / 2);
            return pos;
        }
    }
}

@view('/tab')
export class TabView extends BlockView<Tab>{
    onResize(event: React.MouseEvent) {
        event.stopPropagation();
        var height = this.block.contentHeight;
        MouseDragger({
            event,
            moving: (e, d, end) => {
                var dy = e.clientY - event.clientY;
                var h = height + dy;
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
    tabPages: HTMLElement;
    renderView() {
        var itemStyle: CSSProperties = {
            justifyContent: 'flex-start'
        }
        if (this.props.block.align == 'center') {
            itemStyle.justifyContent = 'center'
        }
        var innerStyle: CSSProperties = {
            backgroundColor: this.block.contentStyle.backgroundColor,
        }
        var contentStyle = this.block.contentStyle;
        delete contentStyle.backgroundColor;
        var classList: string[] = ['sy-block-tab'];
        if (this.block.isCanEdit()) classList.push('visible-hover');
        classList.push('sy-block-tab-' + this.block.displayMode)
        return <div onMouseEnter={e => {
            this.block.isOver = true;
        }}
            onMouseLeave={e => {
                this.block.isOver = false;
            }}
            className={classList.join(' ')}
            style={this.block.visibleStyle}>
            <div className="relative" style={contentStyle}>
                <div className="sy-block-tab-items relative" style={itemStyle}>
                    <div className="sy-block-tab-items-panel">
                        {this.block.tabItems.map((tab, i) => {
                            return <div
                                onContextMenu={e => {
                                    e.preventDefault();
                                }}
                                onMouseDown={e => {
                                    //e.preventDefault();
                                    e.stopPropagation();
                                    this.block.onDraggerItem(e, i)
                                }}
                                className={"sy-block-tab-item flex-center " + (i == this.block.tabIndex ? "hover" : "")} key={i}>
                                {tab.icon && <Icon className={'gap-r-3'} icon={tab.icon} size={16}></Icon>}
                                <span>{tab.text}</span>
                            </div>
                        })}
                    </div>
                    {this.block.isCanEdit() && <><Tip text={'添加标签页'}><div className="sy-block-tab-plus visible flex-center round size-24  cursor item-hover" onMouseDown={e => this.block.onAddTabItem()}><Icon size={18} icon={PlusSvg}></Icon></div></Tip>
                        <div className="pos-right-full">
                            <Tip text={'标签页菜单'}><div className="visible flex-center round size-24  cursor item-hover" onMouseDown={e => { e.stopPropagation(); this.block.onContextmenu(e.nativeEvent) }}>
                                <Icon size={18} icon={DotsSvg}></Icon></div></Tip>
                        </div></>}
                </div>
                <div ref={e => this.tabPages = e} className={"sy-block-tab-pages " + (this.block.border == "border" ? "sy-block-tab-pages-border" : "")} style={{
                    ...innerStyle,
                    height: this.block.autoContentHeight == true ? undefined : this.block.contentHeight
                }}>
                    <ChildsArea childs={this.block.blocks.otherChilds}></ChildsArea>
                </div>
                {this.block.isCanEdit() && this.block.autoContentHeight !== true && <Tip text={'拖动标签页高度'}><div className="sy-block-tab-resize visible" onMouseDown={e => this.onResize(e)}></div></Tip>}
            </div>
        </div>
    }
}


