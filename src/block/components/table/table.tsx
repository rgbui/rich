import { Block } from "../..";
import { BaseComponent } from "../../base/component";
import React from "react";
import { url, view } from "../../factory/observable";
import "./style.less";
import { BlockAppear, BlockDisplay } from "../../base/enum";
@url('/table')
export class Table extends Block {
    appear = BlockAppear.layout;
    display = BlockDisplay.block;
    cols: { width: number }[] = [];
}
@view('/table')
export class TableView extends BaseComponent<Table>{
    mousemove(event: MouseEvent) {
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
        }
        else {
            this.subline.style.display = 'none';
        }
    }
    mousedownSubLine(event: MouseEvent) {

    }
    _mousemoveSubLine(event: MouseEvent) {

    }
    table: HTMLTableElement;
    subline: HTMLElement;
    render() {
        return <div className='sy-block-table' style={this.block.visibleStyle}
            onMouseMove={e => this.mousemove(e.nativeEvent)}>
            <div className='sy-block-table-subline' onMouseDown={e => this.mousedownSubLine(e.nativeEvent)} ref={e => this.subline = e}></div>
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