import React, { CSSProperties } from "react";
import { useDataGridFileViewer } from "../../../../extensions/data-grid/filer";
import { url, view } from "../../../../src/block/factory/observable";

import { Rect } from "../../../../src/common/vector/point";
import { OriginField, OriginFileView } from "./origin.field";
import { S } from "../../../../i18n/view";

@url('/field/audio')
export class FieldAudio extends OriginField {
    async onCellMousedown(event: React.MouseEvent) {
        if (this.checkEdit() === false) return;
        event.stopPropagation();
        var vs = Array.isArray(this.value) ? this.value : (this.value ? [this.value] : []);
        if (!this.field?.config?.isMultiple) {
            vs = vs.slice(0, 1);
        }
        var fn = async () => {
            var rs = await useDataGridFileViewer({ roundArea: Rect.fromEle(event.currentTarget as HTMLElement) }, {
                mime: 'audio',
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

@view('/field/audio')
export class FieldVideoView extends OriginFileView<FieldAudio>{
    renderImages(images: { url: string }[]) {
        var style: CSSProperties = {};
        style.width = '100%';
        style.height = 30;
        return images.map((img, i) => {
            return <div className="sy-field-image-item" key={i}>
                <audio className="round" controls src={img.url} style={style}  >
                    <source src={img.url} type="audio/ogg" />
                    <source src={img.url} type="audio/mpeg" />
                    <source src={img.url} type="audio/wav" />
                    <S text='您的浏览器不支持audio元素'>您的浏览器不支持 audio 元素。</S>
                </audio>
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