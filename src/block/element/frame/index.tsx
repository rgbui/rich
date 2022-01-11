
import React from 'react';
import { Block } from '../..';
import { BlockView } from '../../view';
import { prop, url, view } from '../../factory/observable';
import { ChildsArea, TextArea } from '../../view/appear';
import { BlockAppear } from '../../appear';
import "./style.less";
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
        return <div className='sy-block-frame' style={this.block.visibleStyle} >
            <div className='sy-block-frame-head'>
                <TextArea placeholder='框' rf={e => this.block.elementAppear({ el: e, appear: BlockAppear.text })} html={this.block.content}></TextArea>
            </div>
            <div className='sy-block-frame-content'>
                <ChildsArea childs={this.block.childs}></ChildsArea>
            </div>
        </div>
    }
}


