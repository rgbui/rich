import { BlockView } from "../../../src/block/view";
import React from 'react';
import { url, view } from "../../../src/block/factory/observable";
import { Block } from "../../../src/block";
import { BlockDisplay } from "../../../src/block/enum";
import "./style.less";
import { BlockUrlConstant } from "../../../src/block/constant";
import { Rect } from "../../../src/common/vector/point";
import lodash from "lodash";

@url('/outline')
export class PageOutLine extends Block {
    display = BlockDisplay.block;
    outlines: { id: string, deep: number, block: Block, hover?: boolean, text: string }[] = [];
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
    getOutLines() {
        var outlines: { id: string, deep: number, block: Block, text: string }[] = [];
        var bs = this.page.findAll(x => x.url == BlockUrlConstant.Head && x.el && (x.closest(c => c.isPart) ? false : true));
        lodash.sortBy(bs, g => Rect.fromEle(g.el).top);
        var currentDeep = 0, lastLevel;
        if (this.page.view) {
            outlines = bs.map((b, i) => {
                var level = parseInt((b as any).level.replace('h', ''));
                var deep = currentDeep;
                if (typeof lastLevel == 'number' && level < lastLevel) deep -= 1;
                else if (typeof lastLevel == 'number' && level > lastLevel) deep += 1;
                currentDeep = deep;
                lastLevel = level;
                return {
                    id: b.id,
                    deep,
                    block: b,
                    text: b.childs.length > 0 ? b.childs.map(c => c.content).join("") : b.content
                }
            })
        }
        this.outlines = outlines;
    }
    updateOutLine() {
        this.getOutLines();
        this.updateOutlinesHover()
    }
}
@view('/outline')
export class PageOutLineView extends BlockView<PageOutLine>{
    mousedownLine(line, event: React.MouseEvent) {
        var block = this.block.page.find(g => g.id == line.id);
        if (block) {
            block.el.scrollIntoView({
                block: "nearest",
                inline: "nearest"
            });
        }
    }
    didMount(): void {
        this.block.updateOutLine()
    }
    render() {
        return <div className='sy-block-outline' style={this.block.visibleStyle}>
            {this.block.outlines.map(line => {
                return <div className={"item" + (this.block.hoverId == line.block.id ? " hover" : "")} key={line.id}><a key={line.id} style={{ paddingLeft: 10 + line.deep * 15 }} onMouseDown={e => this.mousedownLine(line, e)}>{line.text}</a></div>
            })}
        </div>
    }
}