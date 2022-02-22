import React from "react";
import { OpenFileDialoug } from "../../../../component/file";
import { Button } from "../../../../component/view/button";
import { channel } from "../../../../net/channel";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginField } from "./origin.field";
@url('/field/image')
export class FieldImage extends OriginField {
    async uploadFile(event: React.MouseEvent) {
        var exts = ['image/*'];
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
@view('/field/image')
export class FieldImageView extends BlockView<FieldImage>{
    render() {
        return <div className='sy-field-image' onMouseDown={e => e.stopPropagation()}>
            {this.block.value && <div className="sy-field-image-wrapper">
                <img src={this.block.value.url} />
            </div>}
            {(!this.block.value || this.block.field?.config?.isMultiple) && <div
                className="sy-field-image-add"
            >
                <Button ghost onClick={e => this.block.uploadFile(e)}>上传文件</Button>
            </div>}
        </div>
    }
}