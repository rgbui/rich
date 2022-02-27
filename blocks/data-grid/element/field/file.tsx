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
                    if (!Array.isArray(this.value)) this.value = [];
                    this.value.push(r.data.file);
                    this.onUpdateCellValue(this.value);
                    this.forceUpdate();
                }
            }
        }
    }
}
@view('/field/file')
export class FieldFileView extends BlockView<FieldFile>{
    renderFiles(images: { name: string, url: string }[]) {
        return images.map((img, i) => {
            return <div className="sy-field-file-item" key={i}>
                <a download={img.url} href={img.url}>{img.name}</a>
            </div>
        })
    }
    render() {
        var vs = Array.isArray(this.block.value) ? this.block.value : (this.block.value ? [this.block.value] : []);
        if (!this.block.field?.config?.isMultiple && vs.length > 1) vs = [vs.first()]
        return <div className='sy-field-file' onMouseDown={e => e.stopPropagation()}>
            {this.block.value && <div className="sy-field-files">
                {this.renderFiles(vs)}
            </div>}
            {(vs.length == 0 || this.block.field?.config?.isMultiple) && <Button size={'small'} ghost onClick={e => this.block.uploadFile(e)}>上传文件</Button>}
        </div>
    }
}