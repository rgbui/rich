import React, { CSSProperties } from "react";
import { OpenFileDialoug } from "../../../../component/file";
import { Button } from "../../../../component/view/button";
import { useDataGridFileViewer } from "../../../../extensions/data-grid/filer";
import { channel } from "../../../../net/channel";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Rect } from "../../../../src/common/vector/point";
import { OriginField } from "./origin.field";

@url('/field/image')
export class FieldImage extends OriginField {
    async onCellMousedown(event: React.MouseEvent) {
        var vs = Array.isArray(this.value) ? this.value : (this.value ? [this.value] : []);
        if (!this.field?.config?.isMultiple) {
            vs = vs.slice(0, 1);
        }
        console.log('ggg',vs);
        var rs = await useDataGridFileViewer({ roundArea: Rect.fromEvent(event) }, {
            mime: 'image',
            resources: vs,
            isMultiple:this.field?.config?.isMultiple?true:false
        });
        if (Array.isArray(rs) && rs.length > 0) {
            this.value = rs;
            this.onUpdateCellValue(this.value);
            this.forceUpdate();
        }
    }
}
@view('/field/image')
export class FieldImageView extends BlockView<FieldImage>{
    renderImages(images: { url: string }[]) {
        var style: CSSProperties = {};
        if (this.block.field?.config.imageFormat?.display == 'auto') {
            style.width = '100%';
            style.maxHeight = 300;
            style.objectFit = 'cover';
            style.objectPosition = '50% 50%';
        }
        else {
            style.width = 50;
            style.height = 50;
            style.objectFit = 'cover';
            style.objectPosition = '50% 50%';
        }
        return images.map((img, i) => {
            return <div className="sy-field-image-item" key={i}>
                <img className="round" src={img.url} style={style} />
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