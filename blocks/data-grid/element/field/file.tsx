import React from "react";
import { Button } from "../../../../component/view/button";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginField } from "./origin.field";
@url('/field/file')
export class FieldFile extends OriginField {
    async uploadFile(event: React.MouseEvent) {

    }
}
@view('/field/file')
export class FieldFileView extends BlockView<FieldFile>{
    render() {
        return <div className='sy-field-text' onMouseDown={e => e.stopPropagation()}>
            {!this.block.value && <Button ghost onClick={e => this.block.uploadFile(e)}>上传文件</Button>}
            {this.block.value && <div></div>}
        </div>
    }
}