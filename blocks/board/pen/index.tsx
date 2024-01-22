import React, { ReactNode } from "react";
import { Block } from "../../../src/block";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { Rect } from "../../../src/common/vector/point";
import "./style.less";
// https://github.com/szimek/signature_pad
// https://www.cnblogs.com/fangsmile/p/13427794.html

@url('/pen')
export class Pen extends Block {
    isScale: boolean = true;
    @prop()
    fixedWidth: number = 200;
    @prop()
    fixedHeight: number = 200;
    @prop()
    viewBox: string = '';
    @prop()
    pathString: string = '';
    async getBoardEditCommand(this: Block): Promise<{ name: string; value?: any; }[]>{
        var cs: { name: string; value?: any; }[] = [];
        cs.push({ name: 'tickness', value: this.pattern.getSvgStyle()?.strokeWidth || 2 });
        cs.push({ name: 'backgroundColor', value: this.pattern.getSvgStyle()?.stroke || '#000' });
        return cs;
    }
    async setBoardEditCommand(name: string, value: any) {
        if (name == 'tickness') {
            this.pattern.setSvgStyle({ strokeWidth: value })
        }
        else if (name == 'backgroundColor') {
            this.pattern.setSvgStyle({ stroke: value })
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
}

@view('/pen')
export class PenView extends BlockView<Pen>{
    renderView() {
        var vb;
        if (this.block.viewBox) {
            var vs = this.block.viewBox.split(/ /g);
            var rect = new Rect(0, 0, parseInt(vs[2]), parseInt(vs[3]));
            var w = this.block.pattern.getSvgStyle()?.strokeWidth || 2;
            rect = rect.extend(w / 2);
            vb = `${rect.x} ${rect.y} ${rect.width} ${rect.height}`;
        }
        return <div className="sy-block-pen" style={this.block.visibleStyle}>
            <svg viewBox={vb || undefined} preserveAspectRatio="xMinYMin" style={{
                width: this.block.fixedWidth,
                height: this.block.fixedHeight
            }}>
                {this.block.pathString && <path d={this.block.pathString}></path>}
            </svg>
        </div>
    }
}