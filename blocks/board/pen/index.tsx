import React, { ReactNode } from "react";
import { Block } from "../../../src/block";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { PointArrow, Rect } from "../../../src/common/vector/point";
import "./style.less";
import { ShySvg } from "../../../src/block/svg";

// https://github.com/szimek/signature_pad
// https://www.cnblogs.com/fangsmile/p/13427794.html

@url('/pen')
export class Pen extends Block {
    @prop()
    penType: 'brush' | 'pen' | 'pencil' | 'water' | 'pen-green' | 'pen-area' = 'brush';
    @prop()
    fixedWidth: number = 200;
    @prop()
    fixedHeight: number = 200;
    @prop()
    svg: ShySvg = new ShySvg();
    init(this: Block): void {
        super.init();
        this.registerPropMeta('svg', ShySvg, false);
    }
    async created() {
        if (!(this.pattern.styles && this.pattern.styles[0]?.cssList?.length > 0)) {
            await this.pattern.setSvgStyle({
                strokeWidth: 3,
                stroke: 'rgb(0,198,145)'
            });
        }
    }
    async getBoardEditCommand(): Promise<{ name: string; value?: any; }[]> {
        var cs: { name: string; value?: any; }[] = [];
        if (this.penType == 'brush' || this.penType == 'water' || this.penType == 'pen-green')
            cs.push({ name: 'strokeWidth', value: this.pattern.getSvgStyle()?.strokeWidth || 2 });
        // cs.push({ name: 'fillNoTransparentColor', value: this.pattern.getSvgStyle()?.stroke || '#000' });

        cs.push({ name: 'fillColor', value: this.pattern.getSvgStyle()?.stroke || '#000' });
        cs.push({ name: 'fillOpacity', value: this.pattern.getSvgStyle()?.strokeOpacity || 1 })
        return cs;
    }
    async getBoardCopyStyle() {
        var r = await super.getBoardCopyStyle();
        r.data.fillColor = r.data.fillNoTransparentColor;
        delete r.data.fillNoTransparentColor;
        return r;
    }
    async setBoardEditCommand(name: string, value: any) {
        if (name == 'tickness') {
            await this.pattern.setSvgStyle({ strokeWidth: value })
        }
        else if (['strokeWidth', 'strokeDasharray'].includes(name)) {
            await this.pattern.setSvgStyle({ [name]: value });
        }
        else if (name == 'fillNoTransparentColor' || name == 'fillColor') {
            await this.pattern.setSvgStyle({ stroke: value })
        }
        else if (name == 'fillOpacity') {
            await this.pattern.setSvgStyle({ strokeOpacity: value })
        }
    }
    getVisibleBound(): Rect {
        var fs = this.fixedSize;
        var rect = new Rect(0, 0, fs.width, fs.height);
        rect = rect.transformToRect(this.globalWindowMatrix);
        return rect;
    }
    getVisibleContentBound() {
        return this.getVisibleBound()
    }
    onResizeBoardSelector(arrows: PointArrow[], event: React.MouseEvent) {
        this.onResizeScaleBoardSelector(arrows, event);
    }
    get fixedSize(): { width: number; height: number; } {
        if (this.svg) {
            var b = this.svg.getBound();
            if (b) {
                var w = this.pattern.getSvgStyle()?.strokeWidth || 2;
                if (this.penType == 'pen-area') w = 0;
                if (w > 0)
                    b = b.extend(w);
                return {
                    width: b.width,
                    height: b.height,
                }
            }
        }
        return {
            width: this.fixedWidth,
            height: this.fixedHeight
        }
    }
}

@view('/pen')
export class PenView extends BlockView<Pen> {
    renderView() {
        var w = this.block.pattern.getSvgStyle()?.strokeWidth || 2;
        var style = this.block.visibleStyle;
        if (this.block.penType == 'pen-area') {
            style.fill = style.stroke;
            style.fillOpacity = style.strokeOpacity;
            style.strokeWidth = 0;
            style.strokeOpacity = undefined;
            style.stroke = undefined;
        }
        else {
            style.fill = 'none';
            style.fillOpacity = 0;
        }
        if (this.block.penType == 'water') {
            style.strokeDasharray = `${w * 2},${w * 2}`;
        }
        return <div className="sy-block-pen"
            style={style}>
            {this.block.svg.render({
                strokeWidth: this.block.penType == 'pen-area' ? 0 : w,
                attrs: {
                    shapeRendering: 'geometricPrecision'
                }
            })}
            {this.renderComment()}
        </div>
    }
}