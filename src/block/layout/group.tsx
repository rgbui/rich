
import React from 'react';
import { Block } from '..';
import { BlockView } from '../view';
import { BlockAppear, BlockDisplay } from '../partial/enum';
import { url, view } from '../factory/observable';

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
export class GroupView extends BlockView<Group>{
    render() {
        return <div className='sy-block-group' >{this.block.childs.map(x =>
            <x.viewComponent key={x.id} block={x}></x.viewComponent>
        )}</div>
    }
}