import { BlockView } from "../../../src/block/view";
import React, { CSSProperties } from 'react';
import { prop, url, view } from "../../../src/block/factory/observable";
import { Block } from "../../../src/block";
import { BlockDirective, BlockDisplay, BlockRenderRange } from "../../../src/block/enum";
import { BlockUrlConstant } from "../../../src/block/constant";
import { Rect } from "../../../src/common/vector/point";
import lodash from "lodash";
import { dom } from "../../../src/common/dom";
import { AnimatedScrollTo } from "../../../util/animatedScrollTo";
import { DotsSvg, OutlineSvg, TriangleSvg } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
import { MenuItem, MenuItemType } from "../../../component/view/menu/declare";
import { lst } from "../../../i18n/store";
import "./style.less";

type OutLineItemType = {
    id: string,
    parentId?: string,
    level?: number,
    hLevel?: number,
    block: Block,
    hover?: boolean,
    text?: string,
    html?: string,
    spread?: boolean,
    childs?: OutLineItemType[]
}

/**
 * 目录大纲
 * 标题
 * 靠右或者靠左
 * 是否紧挨着内容
 * 支持大纲的背景色及背景框
 * 支持大纲的拆叠或展开
 * 
 */
@url('/outline')
export class PageOutLine extends Block {
    display = BlockDisplay.block;
    outlines: OutLineItemType[] = [];
    hoverId = '';
    spreadCaches: { [key: string]: boolean } = {};
    @prop()
    outlineTitle = '';
    updateOutlinesHover() {
        var hoverId = '';
        if (this.outlines.length > 0) {
            for (let i = 0; i < this.outlines.length - 1; i++) {
                var r = Rect.fromEle(this.outlines[i].block.el);
                var n = Rect.fromEle(this.outlines[i + 1].block.el);
                if (r.top < 50 && n.top > 50) {
                    hoverId = this.outlines[i].block.id;
                    break;
                }
            }
            if (!hoverId) {
                var r = Rect.fromEle(this.outlines[this.outlines.length - 1].block.el);
                if (r.top <= 50) hoverId = this.outlines[this.outlines.length - 1].block.id;
            }
        }
        this.hoverId = hoverId;
        this.forceUpdate();
    }
    cacOutLines() {
        var outlines: OutLineItemType[] = [];
        var bs = this.page.findAll(x => x.url == BlockUrlConstant.Head && x.el && (x.closest(c => c.isPanel) ? false : true) && (x.closest(c => c.isPart) ? false : true));
        lodash.sortBy(bs, g => Rect.fromEle(g.el).top);
        var lastItem: OutLineItemType;
        if (this.page.view) {
            for (let i = 0; i < bs.length; i++) {
                var b = bs[i];
                var level = parseInt((b as any).level.replace('h', ''));
                var sc = this.spreadCaches[b.id];
                if (typeof sc !== 'boolean') {
                    sc = true;
                    this.spreadCaches[b.id] = sc;
                }
                var itemData: OutLineItemType = ({
                    id: b.id,
                    block: b,
                    hLevel: level,
                    text: b.getBlockContent(),
                    html: b.el ? b.el.innerText : undefined,
                    spread: sc
                });
                if (lastItem) {
                    if (level > lastItem.hLevel) {
                        itemData.parentId = lastItem.id;
                        itemData.level = lastItem.level + 1;
                        lastItem.childs.push(itemData);
                    }
                    else if (level == lastItem.hLevel) {
                        var pa = lastItem.parentId ? outlines.arrayJsonFind('childs', c => c.id == lastItem.parentId) : undefined;
                        if (pa) { itemData.parentId = pa.id; itemData.level = pa.level + 1; pa.childs.push(itemData); }
                        else {
                            itemData.level = 0;
                            outlines.push(itemData);
                        }
                    }
                    else {
                        var rcs = outlines.arrayJsonParents('childs', lastItem, c => true);
                        rcs.reverse();
                        var rr = rcs.find(c => (c.hLevel) < level);
                        if (rr) {
                            itemData.parentId = rr.id;
                            itemData.level = rr.level + 1;
                            rr.childs.push(itemData);
                        }
                        else {
                            itemData.level = 0;
                            outlines.push(itemData);
                        }
                    }
                    lastItem = itemData;
                }
                else {
                    lastItem = itemData;
                    itemData.level = 0;
                    outlines.push(itemData);
                }
            }
        }
        this.outlines = outlines;
    }
    updateOutLine() {
        this.cacOutLines();
        this.updateOutlinesHover()
    }
    updateHeadBlock(block: Block, forceUpdate?: boolean) {
        var ou = this.outlines.find(c => c.id == block.id);
        if (ou) {
            ou.html = block.el ? block.el.innerText : undefined;
            ou.text = block.getBlockContent();
            if (forceUpdate) this.forceUpdate()
        }
    }
    get handleBlock() {
        return null;
    }
    async getMd() {
        return '';
    }
    async onGetContextMenus() {
        var rs: MenuItem[] = [];
        rs.push({
            type: MenuItemType.input,
            value: this.outlineTitle,
            name: 'outlineTitle',
            placeholder: lst('文档目录标题'),
        });
        rs.push({
            type: MenuItemType.divide
        });
        rs.push({ text: lst('全部展开'), name: 'spreadOpen', icon: { name: 'byte', code: 'expand-down' } })
        rs.push({ text: lst('全部收起'), name: 'spreadClose', icon: { name: 'byte', code: 'expand-left' } })
        rs.push({ type: MenuItemType.divide })
        rs.push({
            text: lst('刷新文档目录'),
            name: 'refresh',
            icon: { name: 'byte', code: 'refresh' },
        });
        rs.push({
            text: lst('关闭文档目录'),
            name: 'close',
            icon: OutlineSvg
        });
        return rs;
    }
    async onContextMenuInput(item: MenuItem<string | BlockDirective>, options?: { merge?: boolean; }): Promise<void> {
        if (item.name == 'outlineTitle') {
            await this.onUpdateProps({ outlineTitle: item.value }, { range: BlockRenderRange.self })
        }
        else super.onContextMenuInput(item, options)
    }
    async onClickContextMenu(item: MenuItem<string | BlockDirective>, event: MouseEvent, options?: { merge?: boolean; }): Promise<void> {
        if (item.name == 'refresh') {
            this.updateOutLine();
        }
        else if (item.name == 'close') {
            this.page.onToggleOutline({ nav: false })
        }
        else if (item.name == 'spreadOpen') {
            this.outlines.arrayJsonEach(
                'childs', c => { c.spread = true });
            for (var d in this.spreadCaches) {
                this.spreadCaches[d] = true;
            };
            this.forceUpdate();
        }
        else if (item.name == 'spreadClose') {
            this.outlines.arrayJsonEach(
                'childs', c => { c.spread = false });
            for (var d in this.spreadCaches) {
                this.spreadCaches[d] = false;
            };
            this.forceUpdate();
        }
        else super.onClickContextMenu(item, event, options)
    }
}

@view('/outline')
export class PageOutLineView extends BlockView<PageOutLine>{
    mousedownLine(line, event: React.MouseEvent) {
        var block = this.block.page.find(g => g.id == line.id);
        if (block) {
            var panelEl = dom(block.el).getOverflowPanel();
            var panelElRect = Rect.fromEle(panelEl);
            var blockRect = Rect.fromEle(block.el);
            var offset = panelEl.scrollTop;
            var d = blockRect.top - panelElRect.top;
            AnimatedScrollTo(panelEl, offset + d)
        }
    }
    didMount(): void {
        this.block.updateOutLine()
        this.height = window.innerHeight - 70;
        this.forceUpdate()
    }
    height: number = null;
    renderView() {
        var style: CSSProperties = { ...this.block.visibleStyle };
        if (typeof this.height == 'number') style.height = this.height;
        return <div className='sy-block-outline relative visible-hover' style={style}>
            <div className="sy-block-outline-head pos flex-end"
                style={{ top: this.block.outlineTitle ? 0 : -30, right: 0, height: 30 }}>
                <span className="size-24 round item-hover cursor visible" onMouseDown={async e => {
                    var ele = e.currentTarget as HTMLElement;
                    try {
                        ele.classList.remove('visible')
                        await this.block.onContextmenu(Rect.fromEle(e.currentTarget as HTMLElement))
                    }
                    catch (ex) {

                    }
                    finally {
                        ele.classList.add('visible')
                    }
                }}><Icon icon={DotsSvg}></Icon></span>
            </div>
            <div className="sy-block-outline-line">
                {this.block.outlineTitle && <div className="item text-over remark f-14" style={{ paddingLeft: 20 }}>{this.block.outlineTitle}</div>}
                {this.block.outlines.map(line => {
                    return this.renderItem(line, 0)
                })}
            </div>
        </div>
    }
    renderItem(item: OutLineItemType, deep: number) {
        return <div key={item.id}><div className={"item text-over" + (this.block.hoverId == item.block.id ? " hover" : "")}>
            <a className="flex" style={{ paddingLeft: 20 + deep * 15 }} onMouseDown={e => this.mousedownLine(item, e)}>
                <span
                    className={"size-20 round item-hover cursor flex-center ts " + (item.spread ? "angel-90" : "")}
                    onMouseDown={e => { e.stopPropagation(); item.spread = item.spread ? false : true; this.forceUpdate() }} style={{ visibility: item.childs && item.childs.length > 0 ? "visible" : 'hidden' }}><Icon icon={TriangleSvg}></Icon></span>
                <span dangerouslySetInnerHTML={{ __html: item.html || item.text }}></span>
            </a>
        </div>
            {item.spread && item.childs && item.childs.length > 0 && <div>
                {item.childs.map(c => this.renderItem(c, deep + 1))}
            </div>}
        </div>
    }
}