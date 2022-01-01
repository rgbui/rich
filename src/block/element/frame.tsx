
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
export class Frame extends Block {
    @prop()
    frameTitle: string = '';
    @prop()
    fixedWidth: number = 800;
    @prop()
    fixedHeight: number = 300;
}
@view('/frame')
export class FrameView extends BlockView<Frame>{
    render() {
        var style = Object.assign({ width: this.block.fixedWidth, height: this.block.fixedHeight }, this.block.visibleStyle)
        return <div className='sy-block-frame' style={style} >
            <ChildsArea childs={this.block.childs}></ChildsArea>
        </div>
    }
}


