import React from "react";
import { ResourceArguments } from "../../extensions/icon/declare";
import { Content } from "../../src/block/element/content";
import { BlockAppear } from "../../src/block/enum";
import { url, prop, view } from "../../src/block/factory/observable";
import { SolidArea } from "../../src/block/partial/appear";
import { BlockView } from "../../src/block/view";

@url('/file')
export class File extends Content {
    @prop()
    src: ResourceArguments = { name: 'none' }
    appear = BlockAppear.solid;
}
@view('/file')
export class FileView extends BlockView<File>{
    render() {
        return <div className='sy-block-image' style={this.block.visibleStyle}>
            <SolidArea content={
                this.block.src && <img src={this.block.src.url} />
            }></SolidArea>
        </div>
    }
}