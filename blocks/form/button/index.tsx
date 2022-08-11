import React from "react";
import { Icon } from "../../../component/view/icon";
import { IconArguments } from "../../../extensions/icon/declare";
import { Block } from "../../../src/block";
import { BlockDisplay } from "../../../src/block/enum";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { SolidArea, TextArea } from "../../../src/block/view/appear";
import "./style.less";

@url('/button')
export class BlockButton extends Block {
    @prop()
    src: IconArguments = { name: 'emoji', code: '😀' };
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
                    <Icon size={16} icon={this.block.src}></Icon>
                </SolidArea>
            </span>}
            {this.block.showText && <span><TextArea block={this.block} placeholder='按钮'
                prop='content'></TextArea></span>}
        </button>
    }
}


