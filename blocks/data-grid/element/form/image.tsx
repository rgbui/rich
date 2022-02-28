import React from "react";
import { OpenFileDialoug } from "../../../../component/file";
import { Button } from "../../../../component/view/button";
import { channel } from "../../../../net/channel";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { FieldView, OriginFormField } from "./origin.field";

@url('/form/image')
class FormFieldImage extends OriginFormField {
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
                    this.forceUpdate();
                }
            }
        }
    }
}
@view('/form/image')
class FormFieldImageView extends BlockView<FormFieldImage>{
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
        return <FieldView block={this.block}>
            <div className="sy-form-field-image-value" >
                {vs.length > 0 && <div className="sy-field-images">
                    {this.renderImages(vs)}
                </div>}
                {(vs.length == 0 || this.block.field?.config?.isMultiple) && <Button size="small" ghost onClick={e => this.block.uploadFile(e)}>上传文件</Button>}
            </div>
        </FieldView>
    }
}