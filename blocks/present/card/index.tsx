import React, { CSSProperties } from "react";
import { Block } from "../../../src/block";
import { BlockFactory } from "../../../src/block/factory/block.factory";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { ChildsArea } from "../../../src/block/view/appear";
import { GridMap } from "../../../src/page/grid";
import { lst } from "../../../i18n/store";
import { PageThemeStyle } from "../../../src/page/declare";
import { Icon } from "../../../component/view/icon";
import { DotsSvg, PlatteSvg } from "../../../component/svgs";
import { Rect } from "../../../src/common/vector/point";
import { useCardTheme } from "../../../extensions/theme/card";
import lodash from "lodash";
import { MenuItem, MenuItemType } from "../../../component/view/menu/declare";
import { BlockDirective, BlockRenderRange } from "../../../src/block/enum";
import { getCardStyle } from "../../../extensions/theme/themes";
import { Tip } from "../../../component/view/tooltip/tip";
import "./style.less";
import { MouseDragger } from "../../../src/common/dragger";

@url('/card')
export class PageCard extends Block {
    async didMounted(): Promise<void> {
        if (this.blocks.childs.length == 0) {
            this.initPageCard();
        }
    }
    async initPageCard() {
        this.blocks.childs.push(await BlockFactory.createBlock('/textspan',
            this.page,
            { content: lst('描述') },
            this
        ));
        this.forceUpdate();
    }
    init() {
        this.gridMap = new GridMap(this)
    }
    async getMd() {
        return (await this.childs.asyncMap(async b => await b.getMd())).join('  \n')
    }
    @prop()
    cardStyle: PageThemeStyle = {
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
    async openCardStyle() {
        var rect = Rect.fromEle(this.el);
        var nRect = new Rect(rect.rightTop, rect.rightTop.move(-30, 30))
        await useCardTheme(this, nRect)
    }
    async onGetContextMenus() {
        var rs = await super.onGetContextMenus();
        var at = rs.findIndex(g => g.name == 'color');
        lodash.remove(rs, g => g.name == 'color');
        var ns: MenuItem<string | BlockDirective>[] = [];
        ns.push({
            text: lst('卡片样式'),
            icon: PlatteSvg,
            name: 'cardStyle'
        });
        ns.push({
            name: 'autoContentHeight',
            type: MenuItemType.switch,
            checked: this.autoContentHeight,
            text: lst('自适应高度'),
            icon: { name: 'byte', code: 'auto-height-one' }
        });
        rs.splice(at, 0, ...ns)
        return rs;
    }
    async onContextMenuInput(this: Block, item: MenuItem<BlockDirective | string>) {
        if (item?.name == 'autoContentHeight') {
            this.onUpdateProps({ autoContentHeight: item.checked }, { range: BlockRenderRange.self });
        }
        else await super.onContextMenuInput(item);
    }
    async onClickContextMenu(item: MenuItem<string | BlockDirective>, event: MouseEvent): Promise<void> {
        if (item.name == 'cardStyle') {
            this.openCardStyle();
            return;
        }
        return await super.onClickContextMenu(item, event);
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

}

@view('/card')
export class PageCardView extends BlockView<PageCard>{
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
    renderCard() {
        var s = this.block.cardStyle;
        var { bgStyle, contentStyle, coverStyle } = getCardStyle(s);
        if (s.coverStyle?.display == 'none') {
            return <div >
                <div className="padding-10" style={{
                    ...contentStyle,
                    height: this.block.autoContentHeight !== true ? this.block.contentHeight : undefined,
                    overflowY: (this.block.autoContentHeight !== true ? "overlay" : "hidden") as any,
                }
                }>
                    <ChildsArea childs={this.block.childs}></ChildsArea>
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
            return <div className="relative" style={boxStyle}>
                <div className="padding-10" style={{
                    ...style,
                    height: this.block.autoContentHeight !== true ? this.block.contentHeight : undefined,
                    overflowY: (this.block.autoContentHeight !== true ? "overlay" : "hidden") as any,
                }}>
                    <ChildsArea childs={this.block.childs}></ChildsArea>
                </div>
            </div>
        }
        else if (s.coverStyle.display == 'inside-cover') {
            return <div style={contentStyle} >
                <div className="h-120" style={{ ...coverStyle }}>
                </div>
                <div className="padding-10" style={{
                    height: this.block.autoContentHeight !== true ? this.block.contentHeight : undefined,
                    overflowY: (this.block.autoContentHeight !== true ? "overlay" : "hidden") as any,
                }} >
                    <ChildsArea childs={this.block.childs}></ChildsArea>
                </div>
            </div>
        }
        else if (s.coverStyle.display == 'inside-cover-left') {
            return <div className="flex flex-full" style={contentStyle} >
                <div className="flex-fixed" style={{
                    ...coverStyle,
                    width: '33.3%'
                }}>
                </div>
                <div className="padding-10 flex-auto" style={{
                    height: this.block.autoContentHeight !== true ? this.block.contentHeight : undefined,
                    overflowY: (this.block.autoContentHeight !== true ? "overlay" : "hidden") as any,
                }} >
                    <ChildsArea childs={this.block.childs}></ChildsArea>
                </div>
            </div>
        }
        else if (s.coverStyle.display == 'inside-cover-right') {
            return <div className="flex flex-full" style={contentStyle} >
                <div className="padding-10 flex-auto" style={{
                    height: this.block.autoContentHeight !== true ? this.block.contentHeight : undefined,
                    overflowY: (this.block.autoContentHeight !== true ? "overlay" : "hidden") as any,
                }}>
                    <ChildsArea childs={this.block.childs}></ChildsArea>
                </div>
                <div className="flex-fixed" style={{ ...coverStyle, width: '33.3%' }}>
                </div>
            </div>
        }
    }
    renderView() {
        return <div style={this.block.visibleStyle}>
            <div className="relative" style={this.block.contentStyle}>
                <div className='min-h-60 relative visible-hover' >
                    {this.block.isCanEdit() && <>
                        <div style={{ zIndex: 1000, top: -30 }} className="h-30 visible  pos-top-right flex">
                            <span onMouseDown={async e => {
                                e.stopPropagation();
                                var el = (e.currentTarget as HTMLElement).parentNode as HTMLElement;
                                el?.classList.remove('visible')
                                await this.block.openCardStyle()
                                el.classList.add('visible')

                            }} className="size-24 round flex-center bg-hover cursor shadow-s gap-r-5">
                                <Icon size={18} icon={PlatteSvg}></Icon>
                            </span>
                            <span onMouseDown={async e => {
                                e.stopPropagation();
                                var el = (e.currentTarget as HTMLElement).parentNode as HTMLElement;
                                el?.classList.remove('visible')
                                await this.block.onContextmenu(e.nativeEvent)
                                el.classList.add('visible')

                            }} className="size-24 round flex-center bg-hover cursor shadow-s ">
                                <Icon size={18} icon={DotsSvg}></Icon>
                            </span>
                        </div>
                    </>}
                    <div>{this.renderCard()}</div>
                </div>
                {this.block.isCanEdit() && this.block.autoContentHeight !== true && <Tip text={'拖动标签页高度'}><div className="sy-block-card-resize visible" onMouseDown={e => this.onResize(e)}></div></Tip>}
            </div>
        </div>
    }
}