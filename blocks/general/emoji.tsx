import { BlockView } from "../../src/block/view";
import React from 'react';
import { prop, url, view } from "../../src/block/factory/observable";
import { Block } from "../../src/block";
import { BlockAppear, BlockDisplay } from "../../src/block/partial/enum";
@url('/emoji')
export class Emoji extends Block {
    @prop()
    code: string = '😀';
    @prop()
    mine: 'FontAwesome' | 'emoji' | 'image' = 'emoji';
    appear = BlockAppear.solid;
    display = BlockDisplay.inline;
}
@view('/emoji')
export class EmojiView extends BlockView<Emoji>{
    render() {
        return <div className='sy-block-emoji'>
            {this.block.mine == 'emoji' && <span>{this.block.code}</span>}
            {this.block.mine == 'image' && <span><img src={this.block.code} /></span>}
        </div>
    }
}