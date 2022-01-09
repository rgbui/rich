import { BlockView } from "../../../src/block/view";
import katex from 'katex';
import React from 'react';
import { url, view } from "../../../src/block/factory/observable";
import "../../../node_modules/katex/dist/katex.min.css";
import { Block } from "../../../src/block";
import { BlockDisplay } from "../../../src/block/enum";
import { listenKatexInput } from "../../../extensions/katex";
import { Rect } from "../../../src/common/vector/point";

@url('/katex')
export class Katex extends Block {
    display = BlockDisplay.block;
    get htmlContent() {
        let html = katex.renderToString(this.content, {
            throwOnError: false
        });
        return html;
    }
    opened: boolean = false;
    async open(event: React.MouseEvent) {
        event.stopPropagation();
        this.opened = true;
        var old = this.content;
        this.forceUpdate();
        var newValue = await listenKatexInput({ direction: "bottom", align: 'center', roundArea: Rect.fromEle(this.el) }, this.content, (data) => {
            this.content = data;
            this.forceUpdate()
        });
        this.opened = false;
        this.forceUpdate();
        if (newValue) {
            this.onManualUpdateProps({ cotnent: old }, { content: newValue });
        }
    }
}
@view('/katex')
export class KatexView extends BlockView<Katex>{
    render() {
        return <div className={'sy-block-katex' + (this.block.opened ? " sy-block-katex-opened" : "")} onMouseDown={e => this.block.open(e)} style={this.block.visibleStyle}>
            <div className='sy-block-katex-content' dangerouslySetInnerHTML={{ __html: this.block.htmlContent }}>
            </div>
        </div>
    }
}