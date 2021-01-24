import { BaseBlock } from "../base/base";
import React from 'react';
import { BaseComponent } from "../base/component";
/**
 * 分区中会有很多行，每行存在于一个或多个block
 */
export class Row extends BaseBlock {

}
export class RowView extends BaseComponent<Row>{
    render() {
        return <div className='block-row' >{this.block.childs.map(x =>
            <x.viewComponent key={x.id} block={x}></x.viewComponent>
        )}</div>
    }
}
