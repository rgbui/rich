import React from "react";
import { getEmoji } from "../../../net/element.type";
import { Block } from "../../../src/block";
import { BlockDisplay } from "../../../src/block/enum";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { SolidArea, TextArea } from "../../../src/block/view/appear";
import { EmojiSrcType } from "../../general/emoji";
import "./style.less";

@url('/button')
export class BlockButton extends Block {
    @prop()
    src: EmojiSrcType = { mime: 'emoji', code: '😀' };
    display = BlockDisplay.inline;
    @prop()
    showIcon: boolean = false;
    @prop()
    showText: boolean = true;
    async mousedown(event: MouseEvent) {

    }
}

@view('/button')
export class BlockButtonView extends BlockView<BlockButton>{
    render() {
        return <button className='sy-button'
            onMouseDown={e => this.block.mousedown(e.nativeEvent)}
            style={this.block.visibleStyle}>
            {this.block.showIcon && <span>
                <SolidArea block={this.block} prop='src'>
                    {this.block.src.mime == 'emoji' && <span dangerouslySetInnerHTML={{ __html: getEmoji(this.block.src.code) }}>{this.block.src.code}</span>}
                    {this.block.src.mime == 'image' && <span><img src={this.block.src.url} /></span>}
                </SolidArea>
            </span>}
            {this.block.showText && <span><TextArea block={this.block} placeholder='按钮'
                prop='content'></TextArea></span>}
        </button>
    }
}


