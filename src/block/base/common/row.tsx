
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
    render() {
        return <div className='sy-block-row'   >{this.block.childs.map((x, i) => {
            console.log(i,'xx');
            return <>
                {i > 0 && <div key={x.id + "xx" + i.toString()} onMouseDown={e => this.mousedown(i, e.nativeEvent)} className='sy-block-row-resize-col'></div>}
                <x.viewComponent key={x.id} block={x}></x.viewComponent>
            </>
        }
        )}</div>
    }
}
