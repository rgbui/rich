import React from "react";
import { ShapesList } from "../../../extensions/shapes/shapes";
import { Block } from "../../../src/block";
import { BlockRenderRange } from "../../../src/block/enum";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockCssName } from "../../../src/block/pattern/css";
import { ShySvg } from "../../../src/block/svg";
import { BlockView } from "../../../src/block/view";
import { TextSpanArea } from "../../../src/block/view/appear";
import "./style.less";
import { lst } from "../../../i18n/store";
import { Rect } from "../../../src/common/vector/point";

@url('/shape')
export class Shape extends Block {
    @prop()
    fixedWidth: number = 200;
    @prop()
    fixedHeight: number = 200;
    async getBoardEditCommand(): Promise<{ name: string; value?: any; }[]> {
        var bold = this.pattern.css(BlockCssName.font)?.fontWeight;
        var cs: { name: string; value?: any; }[] = [];
        cs.push({ name: 'fontSize', value: Math.round(this.pattern.css(BlockCssName.font)?.fontSize || 14) });
        cs.push({ name: 'fontWeight', value: bold == 'bold' || bold == 500 ? true : false });
        cs.push({ name: 'fontStyle', value: this.pattern.css(BlockCssName.font)?.fontStyle == 'italic' ? true : false });
        cs.push({ name: 'textDecoration', value: this.pattern.css(BlockCssName.font)?.textDecoration });
        cs.push({ name: 'fontColor', value: this.pattern.css(BlockCssName.font)?.color });
        cs.push({ name: 'fontFamily', value: this.pattern.css(BlockCssName.font)?.fontFamily });

        cs.push({ name: 'stroke', value: this.pattern.getSvgStyle()?.stroke || '#000' });
        cs.push({ name: 'strokeOpacity', value: this.pattern.getSvgStyle()?.strokeOpacity || 1 });
        cs.push({ name: 'strokeWidth', value: this.pattern.getSvgStyle()?.strokeWidth || 1 });
        cs.push({ name: 'strokeDasharray', value: this.pattern.getSvgStyle()?.strokeDasharray || 'none' })

        cs.push({ name: 'fillColor', value: this.pattern.getSvgStyle()?.fill || '#000' });
        cs.push({ name: 'fillOpacity', value: this.pattern.getSvgStyle()?.fillOpacity || 1 });
        cs.push({ name: 'turnShapes', value: this.svgName });
        return cs;
    }
    get fixedSize(): { width: number; height: number; } {
        return {
            width: this.fixedWidth,
            height: this.fixedHeight
        }
    }
    async setBoardEditCommand(this: Block, name: string, value: any): Promise<boolean | void> {
        if (['stroke', 'strokeDasharray', 'strokeOpacity', 'strokeWidth', 'fillColor', 'fillOpacity',].includes(name)) {
            var key = name;
            if (name == 'fillColor') key = 'fill';
            this.pattern.setSvgStyle({ [key]: value })
        }
        else if ((await super.setBoardEditCommand(name, value))) {

        }
        else if (name == 'turnShapes') {
            var r = ShapesList.find(g => g.name == value);
            if (r) {
                await this.updateProps(
                    { svg: new ShySvg(r.svg), svgName: value },
                    BlockRenderRange.self
                )
            }
        }
    }
    init(this: Block): void {
        super.init();
        this.registerPropMeta('svg', ShySvg, false);
    }
    @prop()
    svg: ShySvg = new ShySvg(
        {
            "viewBox": [0, 0, 24, 24],
            "childs": [{
                "paths": [{
                    "closed": true,
                    "segments": [{ "point": [13.073, 19] },
                    {
                        "point": [8.427, 22.65],
                        "handleOut": [7.97568180822469, 23.004773179256198]
                    },
                    {
                        "point": [6.845016302357559, 22.82017651458252],
                        "handleIn": [7.361462895727626, 23.07084568927965],
                        "handleOut": [6.328569708987492, 22.569507339885387]
                    },
                    { "point": [6, 21.472], "handleIn": [6.00048478937054, 22.046066097175366] },
                    { "point": [6, 19], "handleOut": [3.2385762508460334, 19] },
                    { "point": [1, 14], "handleIn": [1, 16.761423749153966] },
                    { "point": [1, 7], "handleOut": [1, 4.238576250846034] },
                    { "point": [6, 2], "handleIn": [3.238576250846033, 2] },
                    { "point": [18, 2], "handleOut": [20.761423749153966, 2] },
                    { "point": [23, 7], "handleIn": [23, 4.238576250846033] },
                    { "point": [23, 14], "handleOut": [23, 16.761423749153966] },
                    { "point": [18, 19], "handleIn": [20.761423749153966, 19] }]
                }]
            }]
        });
    @prop()
    svgName: string = '5';
    get isCanEmptyDelete() {
        if (this.isFreeBlock) return false;
        else return true;
    }
    getVisibleBound(): Rect {
        var fs = this.fixedSize;
        var rect = new Rect(0, 0, fs.width, fs.height);
        rect = rect.transformToRect(this.globalWindowMatrix);
        return rect;
    }
}
@view('/shape')
export class ShapeView extends BlockView<Shape>{
    renderView() {
        var fs = this.block.fixedSize;
        var sb = this.block.svg.clone();
        var w = this.block.pattern.getSvgStyle()?.strokeWidth || 1
        sb.scaleTo(fs.width - w, fs.height - w);
        sb.extend(w);
        var style = this.block.visibleStyle;
        style.width = this.block.fixedWidth || 200;
        style.height = this.block.fixedHeight || 200;
        return <div className="sy-block-shape" style={style}>
            {sb.render({ marginLeft: 0 - w / 2, marginTop: 0 - w / 2, width: sb.viewBox.width, height: sb.viewBox.height })}
            <div className="sy-block-shape-content">
                <TextSpanArea placeholder={this.block.isFreeBlock ? lst("键入文本") : undefined} block={this.block}></TextSpanArea>
            </div>
        </div>
    }
}


