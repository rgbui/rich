import React from "react";
import { ResourceArguments } from "../../extensions/icon/declare";
import { Block } from "../../src/block";

import { BlockDisplay } from "../../src/block/enum";
import { url, prop, view } from "../../src/block/factory/observable";
import { SolidArea } from "../../src/block/view/appear";
import { BlockView } from "../../src/block/view";

@url('/file')
export class File extends Block {
    @prop()
    src: ResourceArguments = { name: 'none' }
    display = BlockDisplay.block;
    get appearAnchors() {
        if (this.src.name == 'none') return [];
        return this.__appearAnchors;
    }
}
@view('/file')
export class FileView extends BlockView<File>{
    render() {
        return <div className='sy-block-file' style={this.block.visibleStyle}>
            {this.block.src.name != 'none' && <SolidArea rf={e => this.block.elementAppear({ el: e, prop: 'src' })}>
            </SolidArea>}
        </div>
    }
}