import { Block } from "../../src/block";
import { BaseComponent } from "../../src/block/component";
import React from "react";
import { prop, url, view } from "../../src/block/factory/observable";
import "./style.less";
import { BlockAppear, BlockDisplay } from "../../src/block/base/enum";
import { Dragger } from "../../src/common/dragger";
import { util } from "../../src/util/util";
@url('/table')
export class Table extends Block {
    appear = BlockAppear.layout;
    display = BlockDisplay.block;
    @prop()
    cols: { width: number }[] = [];
}
@view('/table')
export class TableView extends BaseComponent<Table>{
    mousemove(event: MouseEvent) {
        if(this.sublineDragger.isMove==true)return;
        var tableRange = this.table.getBoundingClientRect();
        var eleRange = this.block.el.getBoundingClientRect();
        var scrollLeft = this.block.el.scrollLeft;
        var w = 0;
        var gap = 5;
        var index = -1;
        for (let i = 0; i < this.block.cols.length; i++) {
            var col = this.block.cols[i];
            if (i > 0) {
                if (tableRange.left + w - gap < event.x && event.x < tableRange.left + w + gap) {
                    index = i;
                    break;
                }
            }
            w += col.width;
        }
        if (index > -1) {
            this.subline.style.display = 'block';
            this.subline.style.left = (tableRange.left + w - eleRange.left + scrollLeft - gap) + 'px';
            this.subline.style.height = tableRange.height + 'px';
            this.subline.setAttribute('data-index', (index - 1).toString());
        }
        else {
            this.subline.style.display = 'none';
        }
    }
    didMount() {
        this.sublineDragger = new Dragger(this.subline);
        this.sublineDragger.bind();
        var self = this;
        this.sublineDragger.mousedown = (event) => {
            event.stopPropagation();
        }
        this.sublineDragger.moveDown = (event) => {
            self.sublineDragger.data.colIndex = parseInt(self.subline.getAttribute('data-index'));
            self.sublineDragger.data.colEle = self.table.querySelector('colgroup').children[self.sublineDragger.data.colIndex];
            self.sublineDragger.data.colWidth = self.block.cols[self.sublineDragger.data.colIndex].width;
        };
        this.sublineDragger.move = (fromEvent, currentEvent) => {
            var dx = currentEvent.x - fromEvent.x;
            var w = self.sublineDragger.data.colWidth + dx;
            w = Math.max(w, 20);
            self.sublineDragger.data.colEle.style.width = w + 'px';
            self.sublineDragger.data.colEle.style.minWidth = w + 'px';
        };
        this.sublineDragger.moveEnd = (fromEvent, currentEvent) => {
            var dx = currentEvent.x - fromEvent.x;
            var w = self.sublineDragger.data.colWidth + dx;
            w = Math.max(w, 20);
            self.sublineDragger.data.colEle.style.width = w + 'px';
            self.sublineDragger.data.colEle.style.minWidth = w + 'px';
            var cols = util.clone(self.block.cols);
            var col = cols[self.sublineDragger.data.colIndex];
            col.width = w;
            self.block.onUpdateProps({ cols });
        }
    }
    willUnmount() {
        this.sublineDragger.off();
    }
    sublineDragger: Dragger;
    table: HTMLTableElement;
    subline: HTMLElement;
    render() {
        return <div className='sy-block-table' style={this.block.visibleStyle}
            onMouseMove={e => this.mousemove(e.nativeEvent)}>
            <div className='sy-block-table-subline' ref={e => this.subline = e}></div>
            <table ref={e => this.table = e} >
                <colgroup>
                    {this.block.cols.map((col, index) => {
                        return <col key={index} style={{ minWidth: col.width, width: col.width }}></col>
                    })}
                </colgroup>
                <tbody>{this.block.childs.map(x =>
                    <x.viewComponent key={x.id} block={x}></x.viewComponent>)}</tbody>
            </table></div>
    }
}