import React from "react";
import { Block } from "../../../src/block";
import { BlockAppear } from "../../../src/block/appear";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { TextArea } from "../../../src/block/view/appear";

@url('/button')
export class BlockButton extends Block {
    @prop()
    showIcon: boolean = true;
    @prop()
    showText: boolean = true;
}
@view('/button')
export class BlockButtonView extends BlockView<BlockButton>{
    render() {
        return <div className='sy-button' style={this.block.visibleStyle} ><TextArea placeholder='按钮'
            rf={e => this.block.elementAppear({ el: e, appear: BlockAppear.text, prop: 'content' })}
            html={this.block.content}></TextArea>
        </div>
    }
}


