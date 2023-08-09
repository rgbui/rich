import { BlockView } from "../../../src/block/view";
import React from 'react';
import { prop, url, view } from "../../../src/block/factory/observable";
import { Block } from "../../../src/block";
import { BlockDirective, BlockDisplay } from "../../../src/block/enum";
import { useKatexInput } from "../../../extensions/katex";
import { Rect } from "../../../src/common/vector/point";
import "./style.less";
import { lst } from "../../../i18n/store";
import { CopyAlert } from "../../../component/copy";
import { Katex } from "../../../component/view/katex";

@url('/katex')
export class KatexBlock extends Block {
    display = BlockDisplay.block;
    katexContent = '';
    opened: boolean = false;
    async open(event: React.MouseEvent) {
        event.stopPropagation();
        this.opened = true;
        var old = this.content;
        this.forceUpdate();
        var el = this.el.querySelector('.sy-block-katex-content') as HTMLElement;
        var newValue = await useKatexInput({
            direction: "bottom",
            align: 'center',
            roundArea: Rect.fromEle(el)
        }, this.content, (data) => {
            this.content = data;
            this.forceUpdate()
        });
        this.opened = false;
        this.forceUpdate();
        if (newValue) {
            await this.onManualUpdateProps({ content: old }, { content: newValue });
        }
    }
    async getHtml() {
        return `<div class='sy-block-katex'>${this.content}</div>`
    }
    async getMd() {
        return `\n${this.content}\n`
    }
    @prop()
    align: 'left' | 'right' | 'center' = 'center';
    async onGetContextMenus() {
        var items = await super.onGetContextMenus();
        var align = items.find(g => g.name == 'text-align');
        if (align) {
            align.text = lst('公式居中');
        }
        var at = items.findIndex(g => g.name == BlockDirective.copy);
        items.splice(at + 2, 0, { icon: { name: 'bytedance-icon', code: 'formula' }, name: 'copyCode', text: lst('复制公式代码') })
        return items;
    }
    async onClickContextMenu(item, event) {
        switch (item.name) {
            case 'copyCode':
                CopyAlert(this.content, lst('复制公式代码成功'))
                return;
        }
        await super.onClickContextMenu(item, event);
    }
}
@view('/katex')
export class KatexView extends BlockView<KatexBlock>{
    renderView() {
        var style = this.block.contentStyle;
        if (this.block.align == 'left') style.textAlign = 'left';
        return <div style={this.block.visibleStyle}><div
            className={'sy-block-katex' + (this.block.opened ? " sy-block-katex-opened" : "")}
           style={style}   onMouseDown={e => this.block.open(e)}>
            <Katex block className='sy-block-katex-content' latex={this.block.content}></Katex>
        </div>
        </div>
    }
}