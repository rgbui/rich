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
import { S } from "../../../../i18n/view";
import { Tip } from "../../../../component/view/tooltip/tip";

@url('/form/image')
class FormFieldImage extends OriginFormField {
    async uploadFile(event: React.MouseEvent) {
        if (this.checkEdit() === false) return;
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
                className="border round flex-center relative gap-r-10 gap-b-10 visible-hover size-80 round"
                key={i}>
                {this.block.isCanEdit() && <Tip text='移除图片'><span
                    onClick={e => this.deleteImage(img, e)}
                    className="pos-top-right flex-center size-16  bg-dark-1 text-white circle cursor visible">
                    <Icon size={8} icon={CloseSvg}></Icon>
                </span></Tip>}
                <img src={img.url} className="max-w100 max-h100 obj-center" />
            </div>
        })
    }
    renderView() {
        var vs = Array.isArray(this.block.value) ? this.block.value : (this.block.value ? [this.block.value] : []);
        if (!this.block.field?.config?.isMultiple && vs.length > 1) vs = [vs.first()]
        return <FieldView block={this.block}>
            <div className="sy-form-field-image-value gap-h-10" >
                {vs.length > 0 && <div className="flex">
                    {this.renderImages(vs)}
                </div>}
                {(vs.length < 2 || this.block.field?.config?.isMultiple) && this.block.isCanEdit() && <Button size="small" ghost onClick={e => this.block.uploadFile(e)}><S>上传图片</S></Button>}
            </div>
        </FieldView>
    }
}