import { Block } from "../../../src/block";
import { BlockDisplay } from "../../../src/block/enum";
import { url, view } from "../../../src/block/factory/observable";
import { listenKatexInput } from "../../../extensions/katex";
import React from "react";
import { BlockView } from "../../../src/block/view";
import { Rect } from "../../../src/common/vector/point";
import { loadKatex } from "./load";

@url('/katex/line')
export class KatexLine extends Block {
    display = BlockDisplay.inline;
    katexContent = '';
    opened: boolean = false;
    async didMounted() {
        await this.renderKatex();
    }
    async renderKatex() {
        this.katexContent = (await loadKatex()).renderToString(this.content, { throwOnError: false });
        this.forceUpdate()
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
@view('/katex/line')
export class KatexView extends BlockView<KatexLine>{
    render() {
        return <span className={'sy-block-katex-line' + (this.block.opened ? " sy-block-katex-opened" : "")}
            onMouseDown={e => this.block.open(e)}
            dangerouslySetInnerHTML={{ __html: this.block.katexContent }}
        >
        </span>
    }
}