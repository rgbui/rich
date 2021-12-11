import { BlockView } from "../../../src/block/view";
import React from 'react';
import { url, view } from "../../../src/block/factory/observable";
import "../../../node_modules/katex/dist/katex.min.css";
import { Block } from "../../../src/block";
import { BlockDisplay } from "../../../src/block/enum";

@url('/outline')
export class PageOutLine extends Block {
    display = BlockDisplay.block;
    outlines: { id: string, head: string, text: string }[] = [];
    async didMounted() {
        this.outlines = await this.page.getOutLines();
        /**
         * listen page head change
         */
    }
}
@view('/outline')
export class PageOutLineView extends BlockView<PageOutLine>{
    mousedownLine(line, event: React.MouseEvent) {
        var block = this.block.page.find(g => g.id == line.id);
        if (block) {

        }
    }
    render() {
        return <div className='sy-block-outline' style={this.block.visibleStyle}>
            {this.block.outlines.map(line => {
                return <a key={line.id} onMouseDown={e => this.mousedownLine(line, e)}>{line.text}</a>
            })}
        </div>
    }
}