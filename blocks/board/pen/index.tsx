import React, { ReactNode } from "react";
import { Block } from "../../../src/block";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
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
    async getBoardEditCommand(this: Block): Promise<{ name: string; value?: any; }[]> {
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
}
@view('/pen')
export class PenView extends BlockView<Pen>{
    render(): ReactNode {
        return <div className="sy-block-pen" style={this.block.visibleStyle}>
            <svg viewBox={this.block.viewBox || undefined} preserveAspectRatio="xMinYMin" style={{ width: this.block.fixedWidth, height: this.block.fixedHeight }}>
                {this.block.pathString && <path d={this.block.pathString}></path>}
            </svg>
        </div>
    }
}