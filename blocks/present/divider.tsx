import { BlockView } from "../../src/block/view";
import React from 'react';
import { url, view } from "../../src/block/factory/observable";
import { Block } from "../../src/block";
import { BlockDisplay } from "../../src/block/enum";
import { Point, Rect } from "../../src/common/vector/point";

@url('/divider')
export class Divider extends Block {
    display = BlockDisplay.block;
    async getHtml() {
        return `<hr/>`
    }
    async getMd() {
        return '----------------------'
    }
    getVisibleHandleCursorPoint() {
        var h = this.el.querySelector('.sy-block-divider-line') as HTMLElement;
        var bound = Rect.fromEle(h);
        if (bound) {
            var pos = Point.from(bound);
            pos = pos.move(0, 1);
            return pos;
        }
    }
}
@view('/divider')
export class DividerView extends BlockView<Divider>{
    renderView()  {
        return <div className='sy-block-divider' style={this.block.visibleStyle}>
            <div className='sy-block-divider-line'></div>
        </div>
    }
}