
import React from 'react';
import { BaseComponent } from "../component";
import { BlockAppear, BlockDisplay } from "../enum";
import { url, view } from "../../factory/observable";
import { Block } from '..';
/**
 * 分区中会有很多行，每行存在于一个或多个block
 */
@url('/row')
export class Row extends Block {
    display = BlockDisplay.block;
    appear = BlockAppear.layout;
    get isRow() {
        return true;
    }
}
@view('/row')
export class RowView extends BaseComponent<Row>{
    mousedown(index: number, event: MouseEvent) {
        console.log(index, event);
        // if (this.block.childs.length > 1) {

        // }
    }
    renderChilds() {
        var ps: JSX.Element[] = [];
        for (let i = 0; i < this.block.childs.length; i++) {
            var child = this.block.childs[i];
            // if (i > 0) {
            //     ps.push(<div key={child.id + "_child_" + i.toString()} onMouseDown={e => this.mousedown(i, e.nativeEvent)} className='sy-block-row-resize-col'></div>)
            // }
            ps.push(<child.viewComponent key={child.id} block={child}></child.viewComponent>)
        }
        return ps;
    }
    render() {
        return <div className='sy-block-row'  ref={e => this.block.childsEl = e}>{this.renderChilds()}</div>
    }
}
