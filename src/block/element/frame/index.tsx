
import React from 'react';
import { Block } from '../..';
import { BlockView } from '../../view';
import { prop, url, view } from '../../factory/observable';
import { ChildsArea, TextArea } from '../../view/appear';
import { BlockAppear } from '../../appear';
import "./style.less";
import { BoardPointType, BoardBlockSelector } from '../../partial/board';
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
    getBlockBoardSelector(this: Block, types?: BoardPointType[]): BoardBlockSelector[] {
        var pickers = super.getBlockBoardSelector();
        pickers.removeAll(p => p.type == BoardPointType.rotatePort);
        return pickers;
    }
    async getBoardEditCommand(this: Block): Promise<{ name: string; value?: any; }[]> {
        var cs: { name: string; value?: any; }[] = [];
        cs.push({ name: 'frameRadio' });
        cs.push({ name: 'backgroundColor' });
        return cs;
    }
}
@view('/frame')
export class FrameView extends BlockView<Frame>{
    render() {
        var style = Object.assign({ width: this.block.fixedWidth, height: this.block.fixedHeight }, this.block.visibleStyle);
        return <div className='sy-block-frame' style={style} >
            <div className='sy-block-frame-head'>
                <TextArea placeholder='框' rf={e => this.block.elementAppear({ el: e, appear: BlockAppear.text })} html={this.block.content}></TextArea>
            </div>
            <div className='sy-block-frame-content'>
                <ChildsArea childs={this.block.childs}></ChildsArea>
            </div>
        </div>
    }
}


