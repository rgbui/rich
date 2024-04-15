
import lodash from "lodash";
import React from "react";
import { CloseSvg, FileSvg, PlusSvg } from "../../../../component/svgs";
import { Icon } from "../../../../component/view/icon";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { util } from "../../../../util/util";
import { FieldType } from "../../schema/type";
import { OriginFormField, FieldView } from "./origin.field";
import { lst } from "../../../../i18n/store";
import { PopoverPosition } from "../../../../component/popover/position";
import { useFilePicker } from "../../../../extensions/file/file.picker";
import { Rect } from "../../../../src/common/vector/point";
import { S } from "../../../../i18n/view";

@url('/form/file')
class FormFieldFile extends OriginFormField {
    async uploadFile(pos: PopoverPosition, img?: any) {
        if (this.checkEdit() === false) return;
        var mime: "image" | "file" | "audio" | "video" = 'file';
        if (this.field?.type == FieldType.video) mime = 'video'
        else if (this.field?.type == FieldType.audio) mime = 'audio';
        var r = await useFilePicker(pos, mime);
        if (r) {
            var vs = util.covertToArray(this.value);
            if (img) {
                var at = vs.indexOf(img);
                vs[at] = r;
            }
            else {
                if (this.field?.config?.isMultiple !== true) vs = [];
                vs.push(r);
            }
            this.onChange(vs);
            this.forceUpdate();
        }
    }
}

@view('/form/file')
class FormFieldFileView extends BlockView<FormFieldFile> {
    deleteImage(img) {
        var vs = Array.isArray(this.block.value) ? this.block.value : (this.block.value ? [this.block.value] : []);
        if (!this.block.field?.config?.isMultiple && vs.length > 1) vs = [vs.first()]
        lodash.remove(vs, v => v == img);
        this.block.value = vs;
        this.forceUpdate();
    }
    renderFiles(files: { filename: string, size: number, url: string }[]) {
        var text = lst('添加文件');
        if (this.block.field?.type == FieldType.video) text = lst('添加视频')
        else if (this.block.field?.type == FieldType.audio) text = lst('添加音频')
        return <div className={this.block.fieldType == 'doc' ? "gap-w-10" : ""}>
            {files.length > 0 && <div className="gap-b-5 item-hover-light-focus round">
                {files.map((img, i) => {
                    return <div className="padding-h-2 padding-w-5 gap-w-5   item-hover-light   round cursor flex  visible-hover" key={i}>
                        <a className="link f-14 flex-auto flex" download={img.url} href={img.url}>
                            <span className="flex-fixed item-hover round size-24 remark flex-center"><Icon size={18} icon={FileSvg}></Icon></span>
                            <span className="flex-fixed text-overflow gap-w-5">{img.filename}</span>
                            <em className="flex-fixed remark">{util.byteToString(img.size)}</em>
                        </a>
                        {this.block.isCanEdit() && this.block.fieldType != 'doc-detail' && <span onClick={e => this.deleteImage(img)} className="gap-l-10 flex-fixed visible size-20 round cursor flex-center item-hover remark"><Icon size={14} icon={CloseSvg}></Icon></span>}
                    </div>
                })}
            </div>}
            {files.length == 0 && this.block.fieldType == 'doc-detail' && <div className="f-14 remark"><S>空内容</S></div>}
            {this.isCanPlus() && <div className={"flex " + (files.length > 0 ? "visible" : "")}><span className={"item-hover-light-focus item-hover round padding-w-5 f-12   cursor flex text-1"} onClick={e => this.block.uploadFile({ roundArea: Rect.fromEvent(e) })}><Icon size={16} icon={PlusSvg}></Icon><span >{text}</span></span></div>}
        </div>
    }
    isCanPlus() {
        var vs = Array.isArray(this.block.value) ? this.block.value : (this.block.value ? [this.block.value] : []);
        if (!this.block.field?.config?.isMultiple && vs.length > 1) vs = [vs.first()]
        return (vs.length < 1 || vs.length > 1 && this.block.field?.config?.isMultiple) && this.block.fieldType != 'doc-detail'
    }
    renderView() {
        var vs = Array.isArray(this.block.value) ? this.block.value : (this.block.value ? [this.block.value] : []);
        if (!this.block.field?.config?.isMultiple && vs.length > 1) vs = [vs.first()]
        return <FieldView block={this.block} className={'visible-hover'}>
            {this.renderFiles(vs)}
        </FieldView>
    }
}