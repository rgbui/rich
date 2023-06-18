import React from "react";
import { CSSProperties } from "react";
import { useDataGridFileViewer } from "../../../../extensions/data-grid/filer";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Rect } from "../../../../src/common/vector/point";
import { OriginField } from "./origin.field";

@url('/field/video')
export class FieldVideo extends OriginField {
    async onCellMousedown(event: React.MouseEvent) {
        var vs = Array.isArray(this.value) ? this.value : (this.value ? [this.value] : []);
        if (!this.field?.config?.isMultiple) {
            vs = vs.slice(0, 1);
        }
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
}

@view('/field/video')
export class FieldVideoView extends BlockView<FieldVideo>{
    renderImages(images: { url: string }[]) {
        var style: CSSProperties = {};
        // if (this.block.field?.config.imageFormat?.display == 'auto') {
        style.width = '100%';
        style.maxHeight = 300;
        style.objectFit = 'cover';
        style.objectPosition = '50% 50%';
        // }
        // else {
        //     style.width = 50;
        //     style.height = 50;
        //     style.objectFit = 'cover';
        //     style.objectPosition = '50% 50%';
        // }
        return images.map((img, i) => {
            return <div className="sy-field-image-item" key={i}>
                <video controls className="round" src={img.url} style={style} ></video>
            </div>
        })
    }
    render() {
        var vs = Array.isArray(this.block.value) ? this.block.value : (this.block.value ? [this.block.value] : []);
        if (!this.block.field?.config?.isMultiple && vs.length > 1) vs = [vs.first()]
        return <div className='sy-field-image'>
            {vs.length > 0 && <div className="sy-field-images">
                {this.renderImages(vs)}
            </div>}
        </div>
    }
}