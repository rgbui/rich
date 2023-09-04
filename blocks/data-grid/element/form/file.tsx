
import lodash from "lodash";
import React from "react";
import { OpenFileDialoug } from "../../../../component/file";
import { CloseSvg, FileSvg } from "../../../../component/svgs";
import { Button } from "../../../../component/view/button";
import { Icon } from "../../../../component/view/icon";
import { channel } from "../../../../net/channel";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { util } from "../../../../util/util";
import { FieldType } from "../../schema/type";
import { OriginFormField, FieldView } from "./origin.field";
import { S } from "../../../../i18n/view";
import { lst } from "../../../../i18n/store";

@url('/form/file')
class FormFieldFile extends OriginFormField {
    async uploadFile(event: React.MouseEvent) {
        if (this.checkEdit() === false) return;
        var exts = ['*'];
        var file = await OpenFileDialoug({ exts });
        if (file) {
            var r = await channel.post('/ws/upload/file', {
                file,
                uploadProgress: (event) => {
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

@view('/form/file')
class FormFieldFileView extends BlockView<FormFieldFile>{
    deleteImage(img) {
        var vs = Array.isArray(this.block.value) ? this.block.value : (this.block.value ? [this.block.value] : []);
        if (!this.block.field?.config?.isMultiple && vs.length > 1) vs = [vs.first()]
        lodash.remove(vs, v => v == img);
        this.block.value = vs;
        this.forceUpdate();
    }
    renderFiles(images: { filename: string, size: number, url: string }[]) {
        return images.map((img, i) => {
            return <div className="sy-field-file-item padding-h-3 padding-w-10 cursor flex item-hover-focus round visible-hover" key={i}>
                <a className="link f-14 flex-auto flex" download={img.url} href={img.url}>
                    <span className="flex-fixed item-hover round size-24 remark flex-center"><Icon size={18} icon={FileSvg}></Icon></span>
                    <span className="flex-fixed text-overflow gap-w-5">{img.filename}</span>
                    <em className="flex-fixed remark">{util.byteToString(img.size)}</em>
                </a>
                {this.block.isCanEdit() && <span onClick={e => this.deleteImage(img)} className="gap-l-10 flex-fixed visible size-20 round cursor flex-center item-hover"><Icon size={16} icon={CloseSvg}></Icon></span>}
            </div>
        })
    }
    renderView() {
        var text = lst('文件');
        if (this.block.field?.type == FieldType.video) text = lst('视频')
        else if (this.block.field?.type == FieldType.audio) text = lst('音频')
        var vs = Array.isArray(this.block.value) ? this.block.value : (this.block.value ? [this.block.value] : []);
        if (!this.block.field?.config?.isMultiple && vs.length > 1) vs = [vs.first()]
        return <FieldView block={this.block}>
            <div className="sy-form-field-file-value gap-h-5" >
                {this.block.value && <div className="sy-field-files">
                    {this.renderFiles(vs)}
                </div>}
                {(vs.length == 0 || this.block.field?.config?.isMultiple) && this.block.isCanEdit() && <div className={vs.length > 0 ? "gap-t-30" : ""}><Button size={'small'} ghost onClick={e => this.block.uploadFile(e)}><S>上传</S>{text}</Button></div>}
            </div>
        </FieldView>
    }
}