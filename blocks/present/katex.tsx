import { BlockView } from "../../src/block/view";
import katex from 'katex';
import React from 'react';
import { prop, url, view } from "../../src/block/factory/observable";
import "../../node_modules/katex/dist/katex.min.css";
import { SolidArea } from "../../src/block/view/appear";
import { Block } from "../../src/block";
import { BlockDisplay } from "../../src/block/enum";

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
}
@view('/katex')
export class KatexView extends BlockView<Katex>{
    render() {
        return <div className='sy-block-katex' style={this.block.visibleStyle}>
            <SolidArea rf={e => this.block.elementAppear({ el: e })}><span dangerouslySetInnerHTML={{ __html: this.block.htmlContent }}></span> </SolidArea>
        </div>
    }
}