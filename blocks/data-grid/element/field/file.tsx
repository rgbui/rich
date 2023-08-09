import React from "react";
import { useDataGridFileViewer } from "../../../../extensions/data-grid/filer";
import { ResourceArguments } from "../../../../extensions/icon/declare";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Rect } from "../../../../src/common/vector/point";
import { util } from "../../../../util/util";
import { OriginField } from "./origin.field";
import { DownloadSvg } from "../../../../component/svgs";
import { Icon } from "../../../../component/view/icon";
import { ToolTip } from "../../../../component/view/tooltip";
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
        var rs = await useDataGridFileViewer({ roundArea: Rect.fromEle(event.currentTarget as HTMLElement) }, {
            mime: 'file',
            resources: vs,
            isMultiple: this.field?.config?.isMultiple ? true : false
        });
        if (Array.isArray(rs)) {
            this.value = rs;
            this.onUpdateCellValue(this.value);
            this.forceUpdate();
        }
    }
}
@view('/field/file')
export class FieldFileView extends BlockView<FieldFile>{
    down(img: ResourceArguments, e: React.MouseEvent) {
        e.stopPropagation();
        util.downloadFile(img.url, img.filename)
    }
    renderFiles(images: ResourceArguments[]) {
        return images.map((img, i) => {
            return <div className="min-h-30 flex" key={i}>
                <a className="round l-18 padding-w-2 item-hover-focus cursor text-1 text-overflow" >{img.filename}</a>
                <Tip text={'下载文件'}><span onMouseDown={e => { this.down(img, e) }} className="gap-l-5 size-18 visible flex-center item-hover round cursor"><Icon size={18} icon={DownloadSvg}></Icon></span></Tip>
            </div>
        })
    }
    renderView()  {
        var vs = Array.isArray(this.block.value) ? this.block.value : (this.block.value ? [this.block.value] : []);
        if (!this.block.field?.config?.isMultiple && vs.length > 1) vs = [vs.first()]
        return <div className='sy-field-file  visible-hover'>
            {this.block.value && <div className="sy-field-files">
                {this.renderFiles(vs)}
            </div>}
        </div>
    }
}


