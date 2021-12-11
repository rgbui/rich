import { BlockView } from "../../../src/block/view";
import katex from 'katex';
import React from 'react';
import { prop, url, view } from "../../../src/block/factory/observable";
import "../../../node_modules/katex/dist/katex.min.css";
import { Block } from "../../../src/block";
import { BlockDisplay, BlockRenderRange } from "../../../src/block/enum";
import { listenKatexInput } from "../../../extensions/katex";
import { Rect } from "../../../src/common/point";

@url('/katex')
export class Katex extends Block {
    @prop()
    formula: string = '';
    display = BlockDisplay.block;
    get htmlContent() {
        let html = katex.renderToString(this.formula, {
            throwOnError: false
        });
        return html;
    }
    async open(event: React.MouseEvent) {
        event.stopPropagation();
        var old = this.content;
        var newValue = await listenKatexInput({ roundArea: Rect.fromEle(event.target as HTMLElement) }, this.content, (data) => {
            this.content = data;
            this.forceUpdate()
        });
        if (newValue) {
            this.onManualUpdateProps({ cotnent: old }, { content: newValue });
        }
    }
}
@view('/katex')
export class KatexView extends BlockView<Katex>{
    render() {
        return <div className='sy-block-katex' style={this.block.visibleStyle}>
            <div onMouseDown={e => this.block.open(e)} className='sy-block-katex-content' dangerouslySetInnerHTML={{ __html: this.block.htmlContent }}>
            </div>
        </div>
    }
}