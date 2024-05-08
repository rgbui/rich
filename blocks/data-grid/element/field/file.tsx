import React from "react";
import { useDataGridFileViewer } from "../../../../extensions/data-grid/filer";
import { ResourceArguments } from "../../../../extensions/icon/declare";
import { url, view } from "../../../../src/block/factory/observable";
import { Rect } from "../../../../src/common/vector/point";
import { util } from "../../../../util/util";
import { OriginField, OriginFileView } from "./origin.field";
import { DownloadSvg, FileSvg } from "../../../../component/svgs";
import { Icon } from "../../../../component/view/icon";
import { Tip } from "../../../../component/view/tooltip/tip";

@url('/field/file')
export class FieldFile extends OriginField {
    async onCellMousedown(event: React.MouseEvent) {
        if (this.checkEdit() === false) return;
        event.stopPropagation();
        var vs = Array.isArray(this.value) ? this.value : (this.value ? [this.value] : []);
        if (!this.field?.config?.isMultiple) {
            vs = vs.slice(0, 1);
        }
        var fn = async () => {
            var rs = await useDataGridFileViewer({ dist: 0, roundArea: Rect.fromEle(event.currentTarget as HTMLElement) }, {
                mime: 'file',
                resources: vs,
                isMultiple: this.field?.config?.isMultiple ? true : false
            });
            if (Array.isArray(rs)) {
                this.value = rs;
                this.onUpdateCellValue(this.value);
                this.forceManualUpdate();
            }
        }
        if (this.dataGrid) await this.dataGrid.onDataGridTool(fn)
        else await fn()
    }
}

@view('/field/file')
export class FieldFileView extends OriginFileView<FieldFile> {
    down(img: ResourceArguments, e: React.MouseEvent) {
        e.stopPropagation();
        util.downloadFile(img.url, img.filename)
    }
    renderFiles(images: ResourceArguments[]) {
        return images.map((img, i) => {
            return <div className={" padding-w-3 text-1 flex item-hover-light-focus round " + (i == images.length - 1 ? "" : "gap-b-5")} key={i}>
                <span className="flex-fixed size-16  flex-center gap-r-2"><Icon size={16} icon={FileSvg}></Icon></span>
                <span className="cursor text-overflow flex-auto" >{img.filename}</span>
                <Tip text={'下载文件'}><span onMouseDown={e => { this.down(img, e) }} className="gap-l-5 visible size-16 flex-center item-hover round cursor flex-fixed"><Icon size={14} icon={DownloadSvg}></Icon></span></Tip>
            </div>
        })
    }
    renderFieldValue() {
        var vs = Array.isArray(this.block.value) ? this.block.value : (this.block.value ? [this.block.value] : []);
        if (!this.block.field?.config?.isMultiple && vs.length > 1) vs = [vs.first()]
        return <div className='sy-field-file  visible-hover'>
            {this.block.value && <div className="sy-field-files">
                {this.renderFiles(vs)}
            </div>}
        </div>
    }
}


