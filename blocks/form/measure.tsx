import { Block } from "../../src/block";
import { BlockView } from "../../src/block/view";
import React from 'react';
import { prop, url, view } from "../../src/block/factory/observable";
import { BlockDirective, BlockDisplay, BlockRenderRange } from "../../src/block/enum";
import "./style.less";
import { MouseDragger } from "../../src/common/dragger";
import { Rect } from "../../src/common/vector/point";
import { lst } from "../../i18n/store";
import { MenuItem } from "../../component/view/menu/declare";

@url('/measure')
export class Measure extends Block {
    @prop()
    value: number = 80;
    display = BlockDisplay.block;
    @prop()
    hideValue: boolean = false;
    async getHtml() {
        return `<progress value='${this.value}'></progress>`
    }
    async getMd() {
        return `-----------${this.value}%`
    }
    async onGetContextMenus() {
        var items = await super.onGetContextMenus();
        var at = items.findIndex(g => g.name == BlockDirective.copy);
        items.splice(at + 2, 0, {
            icon: { name: 'bytedance-icon', code: 'percentage' },
            name: 'hideValue',
            checked: this.hideValue,
            text: lst('隐藏数值')
        })
        return items;
    }
    async onContextMenuInput(this: Block, item: MenuItem<string | BlockDirective>): Promise<void> {
        if (item.name == 'hideValue') {
            this.onUpdateProps({ hideValue: item.checked }, { range: BlockRenderRange.self });
        }
        else await super.onContextMenuInput(item);
    }
}

@view('/measure')
export class MeasureView extends BlockView<Measure>{
    setProgress(e: React.MouseEvent) {
        var pe = this.block.el.querySelector('.sy-block-measure-progress') as HTMLElement;
        var bound = Rect.fromEle(pe);
        var oldValue = this.block.value;
        var self = this;
        function setValue(ev: MouseEvent, isEnd) {
            var dx = ev.clientX - bound.left;
            if (dx < 0) dx = 0;
            else if (dx > bound.width) dx = bound.width;
            self.block.value = Math.round(dx * 100 / bound.width);
            self.forceUpdate();
            if (isEnd) {
                self.block.onManualUpdateProps({ value: oldValue }, { value: self.block.value });
            }
        }
        MouseDragger({
            event: e,
            dis: 0,
            moving(ev, data, isEnd) {
                setValue(ev, false);
            },
            moveEnd(e, isMove, data) {
                setValue(e, true);
            }
        })
    }
    render() {
        var style = this.block.contentStyle;
        var bg = (style.backgroundColor || '')?.replace(/ /g, '')
        if (!bg || bg == 'rgba(255,255,255,0)' || bg == 'rgb(255,255,255,0)') style.backgroundColor = 'var(--text-p-color)';
        else if (bg) style.backgroundColor = bg.replace(/\,[\s]*[\d\.]+[\s]*\)[\s]*$/, ',1)');
        return <div className='sy-block-measure' onMouseDown={e => e.stopPropagation()} style={this.block.visibleStyle}>
            <div className='sy-block-measure-progress' onMouseDown={e => this.setProgress(e)}>
                <div className='sy-block-measure-progress-bar' style={{
                    width: this.block.value + '%',
                    backgroundColor: style.backgroundColor
                }}></div>
            </div>
            {this.block.hideValue !== true && <div className='sy-block-measure-value' style={
                { color: style.color }
            }>{this.block.value}%</div>}
        </div>
    }
}