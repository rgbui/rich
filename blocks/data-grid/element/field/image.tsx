import React, { CSSProperties } from "react";
import { Slick } from "../../../../component/view/slick";
import { useDataGridFileViewer } from "../../../../extensions/data-grid/filer";
import { url, view } from "../../../../src/block/factory/observable";
import { Rect } from "../../../../src/common/vector/point";
import { OriginField, OriginFileView } from "./origin.field";

@url('/field/image')
export class FieldImage extends OriginField {
    async onCellMousedown(event: React.MouseEvent) {
        if (this.checkEdit() === false) return;
        event.stopPropagation();
        var vs = Array.isArray(this.value) ? this.value : (this.value ? [this.value] : []);
        if (!this.field?.config?.isMultiple) {
            vs = vs.slice(0, 1);
        }
        var fn = async () => {
            var rs = await useDataGridFileViewer({ roundArea: Rect.fromEle(event.currentTarget as HTMLElement) }, {
                mime: 'image',
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
@view('/field/image')
export class FieldImageView extends OriginFileView<FieldImage>{
    renderImages(images: { url: string, src: string }[]) {
        var style: CSSProperties = {};
        if (this.block.field?.config?.imageFormat?.display == 'auto') {
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
        if (this.block.field?.config?.isMultiple && this.block.field?.config?.imageFormat?.multipleDisplay == 'carousel') {
            var settings = {
                autoplay: true,
                renderCenterLeftControls: () => <></>,
                renderCenterRightControls: () => <></>
            };
            return <div onMouseDown={e => { e.stopPropagation() }}><Slick {...settings}>{images.map((img, i) => {
                return <img key={i} className="round" src={img.url || img.src} style={style} />
            })}</Slick></div>
        }
        return images.map((img, i) => {
            return <div className="sy-field-image-item" key={i}>
                <img className="round" src={img.url || img.src} style={style} />
            </div>
        })
    }
    renderFieldValue() {
        var vs = Array.isArray(this.block.value) ? this.block.value : (this.block.value ? [this.block.value] : []);
        if (!this.block.field?.config?.isMultiple && vs.length > 1) vs = [vs.first()]
        return <div className='sy-field-image'>
            {vs.length > 0 && <div className={"sy-field-images" + (vs.length > 1 && this.block.field?.config?.imageFormat?.display == 'thumb' ? " flex flex-wrap r-gap-r-10" : "")}>
                {this.renderImages(vs)}
            </div>}
        </div>
    }
}