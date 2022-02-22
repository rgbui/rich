import React from "react";
import { OpenFileDialoug } from "../../../../component/file";
import { Button } from "../../../../component/view/button";
import { channel } from "../../../../net/channel";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginField } from "./origin.field";

@url('/field/file')
export class FieldFile extends OriginField {
    async uploadFile(event: React.MouseEvent) {
        var exts = ['*'];
        var file = await OpenFileDialoug({ exts });
        if (file) {
            var r = await channel.post('/ws/upload/file', {
                file, uploadProgress: (event) => {
                    console.log(event, 'ev');
                }
            })
            if (r.ok) {
                if (r.data.file) {
                    this.onUpdateCellValue(r.data.file);
                }
            }
        }
    }
}
@view('/field/file')
export class FieldFileView extends BlockView<FieldFile>{
    render() {
        return <div className='sy-field-file' onMouseDown={e => e.stopPropagation()}>
            {this.block.value && <div className="sy-field-files">
                {this.block.value?.name}
            </div>}
            {(!this.block.value || this.block.field?.config?.isMultiple) && <Button ghost onClick={e => this.block.uploadFile(e)}>上传文件</Button>}
        </div>
    }
}