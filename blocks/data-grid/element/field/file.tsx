import React from "react";
import { useDataGridFileViewer } from "../../../../extensions/data-grid/filer";
import { ResourceArguments } from "../../../../extensions/icon/declare";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Rect } from "../../../../src/common/vector/point";
import { util } from "../../../../util/util";
import { OriginField } from "./origin.field";

@url('/field/file')
export class FieldFile extends OriginField {
    async onCellMousedown(event: React.MouseEvent) {
        var vs = Array.isArray(this.value) ? this.value : (this.value ? [this.value] : []);
        if (!this.field?.config?.isMultiple) {
            vs = vs.slice(0, 1);
        }
        var rs = await useDataGridFileViewer({ roundArea:Rect.fromEle(event.currentTarget as HTMLElement) }, {
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
            return <div className="min-h-30 " key={i}>
                <a onMouseDown={e => { this.down(img, e) }} className="padding-3 round item-hover-focus cursor text-1 text-overflow" download={img.url}>{img.filename}</a>
            </div>
        })
    }
    render() {
        var vs = Array.isArray(this.block.value) ? this.block.value : (this.block.value ? [this.block.value] : []);
        if (!this.block.field?.config?.isMultiple && vs.length > 1) vs = [vs.first()]
        return <div className='sy-field-file'>
            {this.block.value && <div className="sy-field-files">
                {this.renderFiles(vs)}
            </div>}
        </div>
    }
}


