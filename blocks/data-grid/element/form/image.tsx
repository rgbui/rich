import lodash from "lodash";
import React from "react";
import { OpenFileDialoug } from "../../../../component/file";
import { CloseSvg } from "../../../../component/svgs";
import { Button } from "../../../../component/view/button";
import { Icon } from "../../../../component/view/icon";
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
    deleteImage(img, event: React.MouseEvent) {
        var vs = Array.isArray(this.block.value) ? this.block.value : (this.block.value ? [this.block.value] : []);
        lodash.remove(vs, g => g == img);
        this.block.value = vs;
        this.forceUpdate();
    }
    renderImages(images: { url: string }[]) {
        return images.map((img, i) => {
            return <div
                onClick={e => this.deleteImage(img, e)}
                className="border round flex-center relative gap-r-10 gap-b-10 visible-hover size-120 round"
                key={i}>
                <span className="pos-top-right flex-center size-24 item-hover-focus circle cursor visible">
                    <Icon size={16} icon={CloseSvg}></Icon>
                </span>
                <img src={img.url}
                    style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "cover", objectPosition: 'center center' }}
                />
            </div>
        })
    }
    render() {
        var vs = Array.isArray(this.block.value) ? this.block.value : (this.block.value ? [this.block.value] : []);
        if (!this.block.field?.config?.isMultiple && vs.length > 1) vs = [vs.first()]
        return <FieldView block={this.block}>
            <div className="sy-form-field-image-value" >
                {vs.length > 0 && <div className="flex">
                    {this.renderImages(vs)}
                </div>}
                {(vs.length < 2 || this.block.field?.config?.isMultiple) && <Button size="small" ghost onClick={e => this.block.uploadFile(e)}>上传图片</Button>}
            </div>
        </FieldView>
    }
}