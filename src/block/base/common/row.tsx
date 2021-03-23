
import React from 'react';
import { BaseComponent } from "../component";
import { BlockAppear, BlockDisplay} from "../enum";
import { url, view } from "../../factory/observable";
import { Block } from '..';
/**
 * 分区中会有很多行，每行存在于一个或多个block
 */
@url('/row')
export class Row extends Block {
    
    display = BlockDisplay.block;
    appear=BlockAppear.layout;
}

@view('/row')
export class RowView extends BaseComponent<Row>{
    render() {
        return <div className='block-row' >{this.block.childs.map(x =>
            <x.viewComponent key={x.id} block={x}></x.viewComponent>
        )}</div>
    }
}
