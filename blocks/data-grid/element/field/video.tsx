import React from "react";
import { CSSProperties } from "react";
import { useDataGridFileViewer } from "../../../../extensions/data-grid/filer";
import { url, view } from "../../../../src/block/factory/observable";
import { Rect } from "../../../../src/common/vector/point";
import { OriginField, OriginFileView } from "./origin.field";
OriginFileView
@url('/field/video')
export class FieldVideo extends OriginField {
    async onCellMousedown(event: React.MouseEvent) {
        if (this.checkEdit() === false) return;
        event.stopPropagation();
        var vs = Array.isArray(this.value) ? this.value : (this.value ? [this.value] : []);
        if (!this.field?.config?.isMultiple) {
            vs = vs.slice(0, 1);
        }
        var fn = async () => {
            var rs = await useDataGridFileViewer({ roundArea: Rect.fromEle(event.currentTarget as HTMLElement) }, {
                mime: 'video',
                resources: vs,
                isMultiple: this.field?.config?.isMultiple ? true : false
            });
            if (Array.isArray(rs)) {
                this.value = rs;
                this.onUpdateCellValue(this.value);
                this.forceUpdate();
            }
        }
        if (this.dataGrid) await this.dataGrid.onDataGridTool(fn)
        else await fn()
    }
}

@view('/field/video')
export class FieldVideoView extends OriginFileView<FieldVideo>{
    renderImages(images: { url: string }[]) {
        var style: CSSProperties = {};
        style.width = '100%';
        style.maxHeight = 300;
        style.objectFit = 'cover';
        style.objectPosition = '50% 50%';
        return images.map((img, i) => {
            return <div className="sy-field-image-item" key={i}>
                <video controls className="round" src={img.url} style={style} ></video>
            </div>
        })
    }
    renderFieldValue() {
        var vs = Array.isArray(this.block.value) ? this.block.value : (this.block.value ? [this.block.value] : []);
        if (!this.block.field?.config?.isMultiple && vs.length > 1) vs = [vs.first()]
        return <div className='sy-field-image'>
            {vs.length > 0 && <div className="sy-field-images">
                {this.renderImages(vs)}
            </div>}
        </div>
    }
}