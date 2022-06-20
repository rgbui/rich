import { BlockView } from "../../../src/block/view";
import React from 'react';
import { url, view } from "../../../src/block/factory/observable";
import { Block } from "../../../src/block";
import { BlockDisplay } from "../../../src/block/enum";
import { listenKatexInput } from "../../../extensions/katex";
import { Rect } from "../../../src/common/vector/point";
import { loadKatex } from "./load";

@url('/katex')
export class Katex extends Block {
    display = BlockDisplay.block;
    katexContent = '';
    opened: boolean = false;
    async didMounted() {
        await this.renderKatex();
    }
    async renderKatex() {
        this.katexContent = (await loadKatex()).renderToString(this.content, { throwOnError: false })
    }
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
            this.renderKatex()
        }
    }
}
@view('/katex')
export class KatexView extends BlockView<Katex>{
    render() {
        return <div className={'sy-block-katex' + (this.block.opened ? " sy-block-katex-opened" : "")} onMouseDown={e => this.block.open(e)} style={this.block.visibleStyle}>
            <div className='sy-block-katex-content' dangerouslySetInnerHTML={{ __html: this.block.katexContent }}>
            </div>
        </div>
    }
}