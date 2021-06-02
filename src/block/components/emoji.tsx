import { BaseComponent } from "../base/component";
import React from 'react';
import { prop, url, view } from "../factory/observable";
import { Block } from "..";
import { BlockAppear, BlockDisplay } from "../base/enum";
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
export class EmojiView extends BaseComponent<Emoji>{
    render() {
        return <div className='sy-block-emoji'>
            {this.block.mine == 'emoji' && <span>{this.block.code}</span>}
            {this.block.mine == 'image' && <span><img src={this.block.code} /></span>}
        </div>
    }
}