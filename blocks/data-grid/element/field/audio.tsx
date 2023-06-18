import React, { CSSProperties } from "react";
import { useDataGridFileViewer } from "../../../../extensions/data-grid/filer";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Rect } from "../../../../src/common/vector/point";
import { OriginField } from "./origin.field";

@url('/field/audio')
export class FieldAudio extends OriginField {
    async onCellMousedown(event: React.MouseEvent) {
        var vs = Array.isArray(this.value) ? this.value : (this.value ? [this.value] : []);
        if (!this.field?.config?.isMultiple) {
            vs = vs.slice(0, 1);
        }
        var rs = await useDataGridFileViewer({ roundArea:Rect.fromEle(event.currentTarget as HTMLElement) }, {
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
}

@view('/field/audio')
export class FieldVideoView extends BlockView<FieldAudio>{
    renderImages(images: { url: string }[]) {
        var style: CSSProperties = {};
        // if (this.block.field?.config.imageFormat?.display == 'auto') {
        //     style.width = '100%';
        //     style.maxHeight = 300;
        //     style.objectFit = 'cover';
        //     style.objectPosition = '50% 50%';
        // }
        // else {
        style.width = '100%';
        style.height = 30;
        // style.objectFit = 'cover';
        // style.objectPosition = '50% 50%';
        // }
        return images.map((img, i) => {
            return <div className="sy-field-image-item" key={i}>
                <audio className="round" controls src={img.url} style={style}  >
                    <source src={img.url} type="audio/ogg" />
                    <source src={img.url} type="audio/mpeg" />
                    <source src={img.url} type="audio/wav" />
                    您的浏览器不支持 audio 元素。
                </audio>
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