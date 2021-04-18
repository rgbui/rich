
import React from 'react';
import { BaseComponent } from "../component";
import { BlockAppear, BlockDisplay } from "../enum";
import { url, view } from "../../factory/observable";
import { Block } from "../..";
/**
 * 可以将相邻的block变成一个整体去操作，
 * 可以看成是contentBlock
 */
@url('/group')
export class Group extends Block {
    display = BlockDisplay.block;
    appear = BlockAppear.layout;
}
@view('/group')
export class GroupView extends BaseComponent<Group>{
    render() {
        return <div className='sy-block-group' >{this.block.childs.map(x =>
            <x.viewComponent key={x.id} block={x}></x.viewComponent>
        )}</div>
    }
}