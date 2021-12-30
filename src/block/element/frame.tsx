
import React from 'react';
import { Block } from '..';
import { BlockView } from '../view';
import { prop, url, view } from '../factory/observable';
import { ChildsArea } from '../view/appear';
/**
 * 可以将相邻的block变成一个整体去操作，
 * 可以看成是contentBlock
 */
@url('/frame')
export class Group extends Block {
    @prop()
    title: string = '';
}
@view('/frame')
export class GroupView extends BlockView<Group>{
    render() {
        return <div className='sy-block-frame' >
            <ChildsArea childs={this.block.childs}></ChildsArea>
        </div>
    }
}


