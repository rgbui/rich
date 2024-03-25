import { BlockView } from "../../../src/block/view";
import React, { CSSProperties } from 'react';
import { url, view } from "../../../src/block/factory/observable";
import { Block } from "../../../src/block";
import { BlockDisplay } from "../../../src/block/enum";
import "./style.less";
import { BlockUrlConstant } from "../../../src/block/constant";
import { Rect } from "../../../src/common/vector/point";
import lodash from "lodash";
import { dom } from "../../../src/common/dom";
import { AnimatedScrollTo } from "../../../util/animatedScrollTo";


type OutLineItemType = {
    id: string,
    deep: number,
    block: Block,
    hover?: boolean,
    text?: string,
    html?: string,
    childs?: OutLineItemType[]
}


@url('/outline')
export class PageOutLine extends Block {
    display = BlockDisplay.block;
    outlines: OutLineItemType[] = [];
    hoverId = '';
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
        var bs = this.page.findAll(x => x.url == BlockUrlConstant.Head && x.el && (x.closest(c => c.isPart) ? false : true));
        lodash.sortBy(bs, g => Rect.fromEle(g.el).top);
        var currentDeep = 0, lastLevel;
        if (this.page.view) {
            for (let i = 0; i < bs.length; i++) {
                var b = bs[i];
                var level = parseInt((b as any).level.replace('h', ''));
                var deep = currentDeep;
                if (typeof lastLevel == 'number' && level < lastLevel) {
                    deep -= 1;
                    var dx = deep + (level - lastLevel);
                    var minLevel = outlines.min(g => g.deep);
                    deep = Math.max(minLevel, dx, 0);
                }
                else if (typeof lastLevel == 'number' && level > lastLevel) deep += 1;
                currentDeep = deep;
                lastLevel = level;
                outlines.push({
                    id: b.id,
                    deep,
                    block: b,
                    text: b.getBlockContent(),
                    html: b.el ? b.el.innerText : undefined
                })
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
        if (typeof this.height == 'number')
            style.height = this.height;
        return <div className='sy-block-outline' style={style}>
            <div className="sy-block-outline-line">
                {this.block.outlines.map(line => {
                    return <div className={"item text-over" + (this.block.hoverId == line.block.id ? " hover" : "")} key={line.id}><a key={line.id} style={{ paddingLeft: 20 + line.deep * 15 }} onMouseDown={e => this.mousedownLine(line, e)}>{line.text}</a></div>
                })}
            </div>
        </div>
    }
}