import { Block } from "../../src/block";
import { BlockView } from "../../src/block/view";
import React from 'react';
import { prop, url, view } from "../../src/block/factory/observable";
import { BlockDisplay } from "../../src/block/enum";
import "./style.less";
import { MouseDragger } from "../../src/common/dragger";
import { Rect } from "../../src/common/vector/point";

@url('/measure')
export class Measure extends Block {
    @prop()
    value: number = 80;
    display = BlockDisplay.block;
    async getHtml() {
        return `<progress value='${this.value}'></progress>`
    }
    async getMd() {
        return `-----------${this.value}%`
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
        var bg = style.backgroundColor?.replace(/ /g, '')
        if (bg == 'rgba(255,255,255,0)' || bg == 'rgb(255,255,255,0)') style.backgroundColor = 'var(--text-p-color)';
        else style.backgroundColor = bg.replace(/\,[\s]*[\d\.]+[\s]*\)[\s]*$/, ',1)');
        return <div className='sy-block-measure' onMouseDown={e => e.stopPropagation()} style={this.block.visibleStyle}>
            <div className='sy-block-measure-progress' onMouseDown={e => this.setProgress(e)}>
                <div className='sy-block-measure-progress-bar' style={{
                    width: this.block.value + '%',
                    backgroundColor: style.backgroundColor
                }}></div>
            </div>
            <div className='sy-block-measure-value' style={
                { color: style.color }
            }>{this.block.value}%</div>
        </div>
    }
}