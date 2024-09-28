
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
import { S } from "../../../../i18n/view";
import { Rect } from "../../../../src/common/vector/point";
import { ToolTip } from "../../../../component/view/tooltip";
import { ResourceArguments } from "../../../../extensions/icon/declare";
import { UploadView } from "../../../../extensions/file/upload";

@url('/form/file')
class FormFieldFile extends OriginFormField {
    async uploadFile(pos: PopoverPosition, img?: any) {
        if (this.checkEdit() === false) return;
        if (this.fromType == 'doc-detail') return;
        var mime: "image" | "file" | "audio" | "video" = 'file';
        if (this.field?.type == FieldType.video) mime = 'video'
        else if (this.field?.type == FieldType.audio) mime = 'audio';
        var r = await useFilePicker(pos, mime);
        if (r) {
            await this.saveFile(r, img);
        }

    }
    async saveFile(r: ResourceArguments, img?: any) {
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
        this.forceManualUpdate();
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
        var removeText = lst('移除文件')
        if (this.block.field?.type == FieldType.video) { text = lst('添加视频'); removeText = lst('移除视频') }
        else if (this.block.field?.type == FieldType.audio) { text = lst('添加音频'); removeText = lst('移除音频') }
        return <div className={this.block.fromType == 'doc' ? "" : ""}>
            {files.length > 0 && <div className="gap-b-5 ">
                {files.map((img, i) => {
                    return <div className={"h-30    round  cursor flex  visible-hover " + (this.block.fromType != 'doc-add' && this.block.fromType != 'doc-detail' ? " padding-w-10 item-hover-light" : "")} key={i}>
                        <a style={{ color: 'inherit' }} className="link f-14 flex-fixed flex  round " download={img.url} href={img.url}>
                            <span className="flex-fixed round  text-1 flex-center"><Icon size={16} icon={FileSvg}></Icon></span>
                            <span className="flex-fixed text-overflow gap-w-5">{img.filename}</span>
                        </a>
                        <span className={this.block.fromType == 'doc-add' ? "flex-fixed gap-r-10 " : " flex-auto"}></span>
                        {this.block.isCanEdit() && this.block.fromType != 'doc-detail' && <>
                            <ToolTip overlay={<S>{removeText}</S>}><span onClick={e => this.deleteImage(img)} className="flex-fixed visible size-20 round cursor flex-center border shadow-s bg-hover gap-r-5 "><Icon size={12} icon={CloseSvg}></Icon></span></ToolTip>
                            <ToolTip overlay={<S>{text}</S>}><span
                                onClick={e => this.block.uploadFile({ roundArea: Rect.fromEle(e.currentTarget as HTMLElement) }, img)}
                                className="flex-fixed visible size-20 round cursor flex-center border shadow-s bg-hover  "><Icon size={16} icon={PlusSvg}></Icon>
                            </span></ToolTip>
                        </>}
                    </div>
                })}
            </div>}
            {files.length == 0 && this.block.fromType != 'doc-add' && <div
                onMouseDown={e => this.block.uploadFile({ roundArea: Rect.fromEle(e.currentTarget as HTMLElement) })}
                className={"f-14 min-h-30 cursor f-14 flex  remark" + (this.block.fromType == 'doc' ? " item-hover-light padding-w-10" : (""))}>{<S>空内容</S>}</div>}
            {files.length == 0 && this.block.fromType == 'doc-add' && <div>{this.renderUpload()}</div>}
        </div>
    }
    renderUpload() {
        var mime: "image" | "file" | "audio" | "video" = 'file';
        if (this.block.field?.type == FieldType.video) mime = 'video'
        else if (this.block?.field?.type == FieldType.audio) mime = 'audio';
        return <div style={{ maxWidth: 300 }}>
            <UploadView button={false} warn={false} mine={mime} change={e => this.block.saveFile({ name: 'upload', ...e })}></UploadView>
        </div>
    }
    isCanPlus() {
        var vs = Array.isArray(this.block.value) ? this.block.value : (this.block.value ? [this.block.value] : []);
        if (!this.block.field?.config?.isMultiple && vs.length > 1) vs = [vs.first()]
        return (vs.length < 1 || vs.length > 1 && this.block.field?.config?.isMultiple) && this.block.fromType != 'doc-detail'
    }
    renderView() {
        var vs = Array.isArray(this.block.value) ? this.block.value : (this.block.value ? [this.block.value] : []);
        if (!this.block.field?.config?.isMultiple && vs.length > 1) vs = [vs.first()]
        return <FieldView block={this.block} className={'visible-hover'}>
            {this.renderFiles(vs)}
        </FieldView>
    }
}