import { BlockView } from "../../../src/block/view";
import React from 'react';
import { prop, url, view } from "../../../src/block/factory/observable";
import { Block } from "../../../src/block";
import { BlockDirective, BlockDisplay, BlockRenderRange } from "../../../src/block/enum";
import { useKatexInput } from "../../../extensions/katex";
import { PointArrow, Rect } from "../../../src/common/vector/point";
import { lst } from "../../../i18n/store";
import { CopyAlert } from "../../../component/copy";
import { Katex } from "../../../component/view/katex";
import "./style.less";
import { MenuItemType } from "../../../component/view/menu/declare";
import { BlockCssName } from "../../../src/block/pattern/css";

@url('/katex')
export class KatexBlock extends Block {
    display = BlockDisplay.block;
    opened: boolean = false;
    @prop()
    fixedWidth: number = 300;
    @prop()
    fixedHeight: number = 60;
    async open(event: React.MouseEvent) {
        event.stopPropagation();
        this.opened = true;
        var old = this.content;
        this.forceManualUpdate();
        var el = this.el.querySelector('.sy-block-katex-content') as HTMLElement;
        var newValue = await useKatexInput({
            direction: "bottom",
            align: 'center',
            roundArea: Rect.fromEle(el)
        }, this.content, (data) => {
            this.content = data;
            this.forceManualUpdate()
        });
        this.opened = false;
        this.forceManualUpdate();
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
        var align = items.find(g => g.name == 'text-center');
        if (align) {
            align.text = lst('公式对齐');
        }
        var at = items.findIndex(g => g.name == BlockDirective.copy);
        items.splice(at + 3, 0, { icon: { name: 'bytedance-icon', code: 'formula' }, name: 'copyCode', text: lst('复制公式代码') })
        var dat = items.findIndex(g => g.name == BlockDirective.delete);
        items.splice(dat + 1, 0,
            { type: MenuItemType.divide },
            {
                type: MenuItemType.help,
                text: lst('了解如何使用公式'),
                url: window.shyConfig.isUS ? "https://help.shy.live/page/261#v9GuKKnhQ1oZEAwoDeDBPi" : "https://help.shy.live/page/261#v9GuKKnhQ1oZEAwoDeDBPi"
            }
        )
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
    onResizeBoardSelector(arrows: PointArrow[], event: React.MouseEvent) {
        this.onResizeScaleBoardSelector(arrows, event);
    }
    get fixedSize() {
        var el = this.el.querySelector('.sy-block-katex') as HTMLElement;
        // console.log(el);
        if (el) {
            var bound = Rect.fromEle(el);
            // var s = this.globalMatrix.getScaling().x;
            // console.log('bound', bound,s);
            return {
                width: el.offsetWidth,
                height: el.offsetHeight
            }
        }
        else {
            return {
                width: this.fixedWidth,
                height: this.fixedHeight
            }
        }
    }
    async getBoardEditCommand(): Promise<{ name: string; value?: any; }[]> {
        var cs: { name: string; value?: any; }[] = [];
        cs.push({ name: 'katex', value: this.content })
        cs.push({ name: 'fontColor', value: this.pattern.css(BlockCssName.font)?.color });
        return cs;
    }
    async setBoardEditCommand(name: string, value: any) {

        if (await super.setBoardEditCommand(name, value) == false) {
            if (name == 'katex') {
                await this.updateProps({ content: value }, BlockRenderRange.self)
                setTimeout(() => {
                    this.page.kit.picker.onPicker([this]);
                }, 1000);
            }
        }
    }
}

@view('/katex')
export class KatexView extends BlockView<KatexBlock> {
    renderView() {
        var style = this.block.contentStyle;
        if (this.block.align == 'left') style.textAlign = 'left';
        else if (this.block.align == 'right') style.textAlign = 'right';
        else style.textAlign = 'center';
        if (this.block.isFreeBlock) {
            // style.width = this.block.fixedWidth;
            // style.height = this.block.fixedHeight;
            style.padding = '0px';
            style.boxSizing = 'border-box';
        }

        return <div style={this.block.visibleStyle}><div
            className={'sy-block-katex ' + (this.block.isFreeBlock ? " sy-block-katex-free " : "") + (this.block.opened ? " sy-block-katex-opened" : "")}
            style={style} onMouseDown={e => {
                if (this.block.isFreeBlock) return;
                this.block.open(e)
            }}>
            <Katex style={{ margin: 0 }} block className='sy-block-katex-content' latex={this.block.content || '(a-b)^2'}></Katex>
        </div>
            {this.renderComment()}
        </div>
    }
}