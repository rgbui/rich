import { BaseBlock } from "..";
import { BlockComposition } from "./composition/block";
import React from 'react';
import { BaseComponent } from "../component";
import { BlockDisplay, BlockType } from "../enum";
import { url, view } from "../../factory/observable";
/**
 * 可以将相邻的block变成一个整体去操作，
 * 可以看成是contentBlock
 */
@url('/group')
export class Group extends BaseBlock {
    display = BlockDisplay.block;
    type = BlockType.layout;
}
@view('/group')
export class GroupView extends BaseComponent<Group>{
    render() {
        return <div className='block-group' >{this.block.childs.map(x =>
            <x.viewComponent key={x.id} block={x}></x.viewComponent>
        )}</div>
    }
}