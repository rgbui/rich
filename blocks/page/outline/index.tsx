import { BlockView } from "../../../src/block/view";
import React from 'react';
import { url, view } from "../../../src/block/factory/observable";
import { Block } from "../../../src/block";
import { BlockDisplay } from "../../../src/block/enum";
import "./style.less";

@url('/outline')
export class PageOutLine extends Block {
    display = BlockDisplay.block;
    outlines: { id: string, deep: number, hover: boolean, text: string }[] = [];
    async updateOutLines() {
        this.outlines = await this.page.getOutLines();
        this.forceUpdate();
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
    render() {
        return <div className='sy-block-outline' style={this.block.visibleStyle}>
            {this.block.outlines.map(line => {
                return <a key={line.id} className={line.hover ? "hover" : ""} style={{ paddingLeft: 10 + line.deep * 15 }} onMouseDown={e => this.mousedownLine(line, e)}>{line.text}</a>
            })}
        </div>
    }
}