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
import "./style.less";
import { Rect } from "../../../src/common/vector/point";
import { useCardTheme } from "../../../extensions/theme/card";
import lodash from "lodash";
import { MenuItem } from "../../../component/view/menu/declare";
import { BlockDirective } from "../../../src/block/enum";

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
        rs.splice(at, 0, ...ns)
        return rs;
    }
    async onClickContextMenu(item: MenuItem<string | BlockDirective>, event: MouseEvent): Promise<void> {
        if (item.name == 'cardStyle') {
            this.openCardStyle();
            return;
        }
        return await super.onClickContextMenu(item, event);
    }
}
@view('/card')
export class PageCardView extends BlockView<PageCard>{
    renderCard() {
        var s = this.block.cardStyle;
        var contentStyle: CSSProperties = {
            borderRadius: s?.contentStyle?.round,
            boxShadow: s?.contentStyle?.shadow,
        }
        contentStyle.borderRadius = 16;
        contentStyle.boxShadow = 'rgba(18, 18, 18, 0.1) 0px 1px 3px 0px';
        contentStyle.boxSizing = 'border-box';
        contentStyle.border = '1px solid rgb(238, 238, 238)';
        var cs = s.contentStyle;
        if (cs.border) {
            if (typeof cs.border == 'string') contentStyle.border = cs.border;
            else Object.assign(contentStyle, cs.border);
        }
        if (cs.round) {
            if (typeof cs?.round == 'string' || typeof cs?.round == 'number') contentStyle.borderRadius = cs.round;
            else Object.assign(contentStyle, cs.round);
        }
        if (cs.shadow) {
            if (typeof cs.shadow == 'string') contentStyle.boxShadow = cs.shadow;
            else Object.assign(contentStyle, cs.shadow);
        }
        if (s.contentStyle?.transparency !== 'noborder') {

            if (s.contentStyle.transparency == 'solid') {
                contentStyle.backgroundColor = '#fff'
            }
            else contentStyle.backgroundColor = 'rgba(255,255,255, 0.75)'
            if (s.contentStyle.transparency == 'frosted') {
                contentStyle.backdropFilter = 'blur(20px) saturate(170%)'
            }
        }
        else {
            contentStyle.boxShadow = 'none';
            contentStyle.border = 'none';
            contentStyle.borderRadius = 0;
        }
        var pageContentStyle: CSSProperties = {}
        if (s?.coverStyle.bgStyle) {
            var bs = s?.coverStyle.bgStyle;
            if (bs.mode == 'color') pageContentStyle.backgroundColor = bs.color;
            else if (bs.mode == 'image' || bs.mode == 'uploadImage') {
                pageContentStyle.backgroundImage = `url(${bs.src})`;
                pageContentStyle.backgroundSize = 'cover';
                pageContentStyle.backgroundRepeat = 'no-repeat';
                pageContentStyle.backgroundPosition = 'center center';
                pageContentStyle.backgroundAttachment = 'fixed';
            }
            else if (bs.mode == 'grad') {
                pageContentStyle.backgroundImage = bs?.grad?.bg;
                pageContentStyle.backgroundSize = 'cover';
                pageContentStyle.backgroundRepeat = 'no-repeat';
                pageContentStyle.backgroundPosition = 'center center';
                pageContentStyle.backgroundAttachment = 'fixed';
            }
        }
        var round = contentStyle.borderRadius || 8;

        var bgStyle: CSSProperties = {}
        if (s.coverStyle.display != 'none' && s.coverStyle?.bgStyle) {
            if (s.coverStyle?.bgStyle.mode == 'color') bgStyle.backgroundColor = bs.color;
            else if (s.coverStyle?.bgStyle.mode == 'image' || s.coverStyle?.bgStyle.mode == 'uploadImage') {
                bgStyle.backgroundImage = `url(${s.coverStyle?.bgStyle.src})`;
                bgStyle.backgroundSize = 'cover';
                bgStyle.backgroundRepeat = 'no-repeat';
                bgStyle.backgroundPosition = 'center center';
                bgStyle.backgroundAttachment = 'fixed';
            }
            else if (s.coverStyle?.bgStyle.mode == 'grad') {
                bgStyle.backgroundImage = s.coverStyle?.bgStyle?.grad?.bg;
                bgStyle.backgroundSize = 'cover';
                bgStyle.backgroundRepeat = 'no-repeat';
                bgStyle.backgroundPosition = 'center center';
                bgStyle.backgroundAttachment = 'fixed';
            }
        }
        if (s.coverStyle?.display == 'none') {
            return <div >
                <div className="padding-10" style={contentStyle}>
                    <ChildsArea childs={this.block.childs}></ChildsArea>
                </div>
            </div>
        }
        else if (s.coverStyle.display == 'inside') {
            return <div className="relative" style={{ ...bgStyle, borderRadius: round }}>
                <div className="padding-10" style={contentStyle}>
                    <ChildsArea childs={this.block.childs}></ChildsArea>
                </div>
            </div>
        }
        else if (s.coverStyle.display == 'inside-cover') {
            return <div style={contentStyle} >
                <div className="h-120" style={{ ...bgStyle, borderRadius: `${round}px ${round}px 0px 0px` }}>
                </div>
                <div className="padding-10" >
                    <ChildsArea childs={this.block.childs}></ChildsArea>
                </div>
            </div>
        }
        else if (s.coverStyle.display == 'inside-cover-bottom') {
            return <div style={contentStyle} >
                <div className="padding-10" >
                    <ChildsArea childs={this.block.childs}></ChildsArea>
                </div>
                <div className="h-120" style={{ ...bgStyle, borderRadius: ` 0px 0px ${round}px ${round}px` }}>
                </div>
            </div>
        }
        else if (s.coverStyle.display == 'inside-cover-left') {
            contentStyle.borderRadius = ` 0px ${round}px ${round}px 0px`
            bgStyle.borderRadius = `${round}px 0px 0px ${round}px `
            return <div className="flex flex-full" style={contentStyle} >
                <div className="flex-fixed" style={{ ...bgStyle, width: '33。3%' }}>
                </div>
                <div className="padding-10" style={{ width: '66.6%' }}>
                    <ChildsArea childs={this.block.childs}></ChildsArea>
                </div>
            </div>
        }
        else if (s.coverStyle.display == 'inside-cover-right') {
            contentStyle.borderRadius = `${round}px 0px 0px ${round}px `
            bgStyle.borderRadius = ` 0px ${round}px ${round}px 0px`
            return <div className="flex flex-full" style={contentStyle} >
                <div className="padding-10" style={{ width: '66.6%' }}>
                    <ChildsArea childs={this.block.childs}></ChildsArea>
                </div>
                <div style={{ ...bgStyle, width: '33。3%' }}>
                </div>
            </div>
        }
    }
    renderView() {
        return <div style={this.block.visibleStyle}>
            <div className='sy-block-card relative visible-hover' >
                {this.block.isCanEdit() && <>
                    <div style={{ zIndex: 1000 }} className="visible  pos-top-right gap-20 flex">
                        <span onMouseDown={e => {
                            e.stopPropagation();
                            this.block.openCardStyle()
                        }} className="size-24 round flex-center item-hover bg-white cursor ">
                            <Icon size={18} icon={PlatteSvg}></Icon>
                        </span>
                        <span onMouseDown={e => {
                            e.stopPropagation();
                            this.block.onContextmenu(e.nativeEvent)
                        }} className="size-24 round flex-center item-hover bg-white cursor ">
                            <Icon size={18} icon={DotsSvg}></Icon>
                        </span>
                    </div>
                </>}
                <div>{this.renderCard()}</div>
            </div>
        </div>
    }
}