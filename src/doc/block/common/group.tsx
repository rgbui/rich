import { BaseBlock } from "../base/base";
import { BlockComposition } from "../base/composition/block";
import React from 'react';
import { BaseComponent } from "../base/component";
/**
 * 可以将相邻的block变成一个整体去操作，
 * 可以看成是contentBlock
 */
export class Group extends BlockComposition {
   
}

export class GroupView extends BaseComponent<Group>{
    render() {
        return <div className='block-group' >{this.block.childs.map(x =>
            <x.viewComponent key={x.id} block={x}></x.viewComponent>
        )}</div>
    }
}