import { BlockView } from "../../src/block/view";
import React from 'react';
import { prop, url, view } from "../../src/block/factory/observable";
import { Block } from "../../src/block";
import { BlockDisplay } from "../../src/block/enum";
import { SolidArea } from "../../src/block/partial/appear";
/**
 * 表情
 */
export type EmojiSrcType = {
    mime: 'FontAwesome' | 'emoji' | 'image',
    code?: string,
    url?: string,
}
@url('/emoji')
export class Emoji extends Block {
    @prop()
    src: EmojiSrcType = { mime: 'emoji', code: '😀' };
    display = BlockDisplay.inline;
}
@view('/emoji')
export class EmojiView extends BlockView<Emoji>{
    render() {
        return <div className='sy-block-emoji'>
            <SolidArea ref={e => this.block.elementAppear({ el: e, prop: 'src' })}>
                {this.block.src.mime == 'emoji' && <span>{this.block.src.code}</span>}
                {this.block.src.mime == 'image' && <span><img src={this.block.src.url} /></span>}
            </SolidArea>
        </div>
    }
}