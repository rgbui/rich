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
                    if (!Array.isArray(this.value)) this.value = [];
                    this.value.push(r.data.file);
                    this.onUpdateCellValue(this.value);
                    this.forceUpdate();
                }
            }
        }
    }
}
@view('/field/image')
export class FieldImageView extends BlockView<FieldImage>{
    renderImages(images: { url: string }[]) {
        return images.map((img, i) => {
            return <div className="sy-field-image-item" key={i}>
                <img src={img.url} />
            </div>
        })
    }
    render() {
        var vs = Array.isArray(this.block.value) ? this.block.value : (this.block.value ? [this.block.value] : []);
        if (!this.block.field?.config?.isMultiple && vs.length > 1) vs = [vs.first()]
        return <div className='sy-field-image' onMouseDown={e => e.stopPropagation()}>
            {vs.length > 0 && <div className="sy-field-images">
                {this.renderImages(vs)}
            </div>}
            {(vs.length == 0 || this.block.field?.config?.isMultiple) && <div
                className="sy-field-image-add"
            >
                <Button ghost onClick={e => this.block.uploadFile(e)}>上传文件</Button>
            </div>}
        </div>
    }
}