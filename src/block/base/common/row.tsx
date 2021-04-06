
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
    get isRow(){
        return true;
    }
}
@view('/row')
export class RowView extends BaseComponent<Row>{
    onMousemove(event: MouseEvent) {
        if (this.block.childs.length > 0) {

        }
    }
    render() {
        return <div className='sy-block-row' onMouseMove={e => this.onMousemove(e.nativeEvent)} >{this.block.childs.map(x =>
            <x.viewComponent key={x.id} block={x}></x.viewComponent>
        )}</div>
    }
}
