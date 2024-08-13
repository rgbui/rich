import React, { CSSProperties } from "react";
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
import { ShapesList } from "../../../extensions/board/shapes/shapes";
import { BoardTurns } from "../turns";

@url('/shape')
export class Shape extends Block {
    async created() {
        if (!(this.pattern.styles && this.pattern.styles[0]?.cssList?.length > 0)) {
            await this.pattern.setSvgStyle({
                strokeWidth: 3,
                stroke: 'rgb(0,198,145)'
            });
            await this.pattern.setFontStyle({
                fontSize: 20,
                color: 'rgb(0,198,145)',
            });
        }
    }
    @prop()
    align: 'left' | 'center' | 'right' = 'center';
    @prop()
    valign: 'top' | 'middle' | 'bottom' = 'middle';
    @prop()
    fixedWidth: number = 200;
    @prop()
    fixedHeight: number = 200;
    async getBoardEditCommand(): Promise<{ name: string; value?: any; }[]> {
        var bold = this.pattern.css(BlockCssName.font)?.fontWeight;
        var ft = this.pattern.css(BlockCssName.font);
        var cs: { name: string; value?: any; }[] = [];
        var so = this.pattern.getSvgStyle()?.strokeOpacity
        var sw = this.pattern.getSvgStyle()?.strokeWidth
        var fl = this.pattern.getSvgStyle()?.fillOpacity
        if (typeof so != 'number') so = 1;
        if (typeof sw != 'number') sw = 1;
        if (typeof fl != 'number') fl = 1;
        cs.push({ name: 'fontSize', value: Math.round(this.pattern.css(BlockCssName.font)?.fontSize || 14) });
        cs.push({ name: 'fontWeight', value: bold == 'bold' || bold == 500 ? true : false });
        cs.push({ name: 'fontStyle', value: this.pattern.css(BlockCssName.font)?.fontStyle == 'italic' ? true : false });
        cs.push({ name: 'textDecoration', value: this.pattern.css(BlockCssName.font)?.textDecoration });
        cs.push({ name: 'fontColor', value: this.pattern.css(BlockCssName.font)?.color });
        cs.push({ name: 'fontFamily', value: this.pattern.css(BlockCssName.font)?.fontFamily });

        cs.push({ name: 'stroke', value: this.pattern.getSvgStyle()?.stroke || '#000' });
        cs.push({ name: 'strokeOpacity', value: so });
        cs.push({ name: 'strokeWidth', value: sw });
        cs.push({ name: 'strokeDasharray', value: this.pattern.getSvgStyle()?.strokeDasharray || 'none' })

        cs.push({ name: 'fillColor', value: this.pattern.getSvgStyle()?.fill || '#000' });
        cs.push({ name: 'fillOpacity', value: fl });
        cs.push({ name: 'turnShapes', value: { name: this.svgName, value: this.svg.id, svg: this.svg.clone() } });
        cs.push({ name: 'width', value: this.fixedWidth });
        cs.push({ name: 'height', value: this.fixedHeight });
        cs.push({ name: 'align', value: this.align });
        cs.push({ name: 'valign', value: this.valign });
        cs.push({ name: 'ai' })

        return cs;
    }
    async getBoardCopyStyle() {
        var r = await super.getBoardCopyStyle();
        r.data.fillColor = r.data.fillNoTransparentColor;
        delete r.data.fillNoTransparentColor;
        delete r.data.turnShapes;
        delete r.data.width;
        delete r.data.height;
        return r;
    }
    async getWillTurnData(url: string) {
        return await BoardTurns.turn(this, url);
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
            await this.pattern.setSvgStyle({ [key]: value })
        }
        else if (['width', 'height'].includes(name)) {
            await this.updateProps({ [name == 'width' ? "fixedWidth" : "fixedHeight"]: value }, BlockRenderRange.self)
        }
        else if (name == 'align') {
            await this.updateProps({ 'align': value }, BlockRenderRange.self);
        }
        else if (name == 'valign') {
            await this.updateProps({ 'valign': value }, BlockRenderRange.self);
        }
        else if ((await super.setBoardEditCommand(name, value))) {

        }
        else if (name == 'turnShapes') {
            if (value.turnUrl) {
                setTimeout(() => {
                    this.page.onTurn(this, value.turnUrl, async (nb) => {
                        this.page.kit.picker.onPicker([nb])
                    })
                }, 50);
            }
            else {
                var svg = new ShySvg(value.svg);
                if (!svg.viewBox) svg.viewBox = svg.getBound();
                if (!svg.id && value.value) svg.id = value.value;
                await this.updateProps(
                    {
                        svg: svg,
                        svgName: value.name
                    },
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
            id: '5',
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
    getVisibleContentBound() {
        return this.getVisibleBound()
    }
}

@view('/shape')
export class ShapeView extends BlockView<Shape> {
    renderView() {
        var fs = this.block.fixedSize;
        var w = this.block.pattern.getSvgStyle()?.strokeWidth || 1;
        var style = this.block.visibleStyle;
        style.width = this.block.fixedSize.width;
        style.height = this.block.fixedSize.height;
        var pd = 20;
        var contentStyle: CSSProperties = {

        }
        if (this.block.align == 'left') {
            contentStyle.justifyContent = 'flex-start';
            contentStyle.paddingLeft = pd;
            contentStyle.paddingRight = pd;
        }
        else if (this.block.align == 'center') {
            contentStyle.justifyContent = 'center';
            contentStyle.paddingLeft = pd;
            contentStyle.paddingRight = pd;
        }
        else if (this.block.align == 'right') {
            contentStyle.justifyContent = 'flex-end';
            contentStyle.paddingLeft = pd;
            contentStyle.paddingRight = pd;
        }

        if (this.block.valign == 'top') {
            contentStyle.alignItems = 'flex-start';
            contentStyle.paddingTop = pd;
            contentStyle.paddingBottom = pd;
        }
        else if (this.block.valign == 'middle') {
            contentStyle.alignItems = 'center';
        }
        else if (this.block.valign == 'bottom') {
            contentStyle.alignItems = 'flex-end';
            contentStyle.paddingTop = pd;
            contentStyle.paddingBottom = pd;
        }

        var getSvg = () => {
            if (!this.block.svgName.endsWith('.json')) {
                var sh = ShapesList.find(c => c.name == this.block.svgName);
                if (!sh.svg)
                    return <div
                        className="r-w100 r-h100"
                        style={{ width: this.block.fixedSize.width, height: this.block.fixedSize.height }}
                        dangerouslySetInnerHTML={{ __html: sh.shape }}>
                    </div>
            }
            var sb = this.block.svg.clone();
            sb.scaleTo(fs.width - w, fs.height - w);
            sb.extend(w);
            var vb = sb.viewBox;
            return sb.render({
                attrs: {
                    shapeRendering: 'geometricPrecision'
                },
                style: {
                    marginLeft: 0 - w / 2,
                    marginTop: 0 - w / 2,
                    width: vb.width,
                    height: vb.height,
                    position: "absolute"
                }
            })
        }
        return <div className="sy-block-shape relative" style={style}>
            {getSvg()}
            <div className="pos flex-center border-box" style={
                {
                    top: 0,
                    left: 0,
                    textDecoration: 'inherit',
                    // padding: pd,
                    width: this.block.fixedSize.width,
                    height: this.block.fixedSize.height,
                    overflow: 'hidden',
                    ...contentStyle
                }}>
                <TextSpanArea placeholder={this.block.isFreeBlock ? lst("键入文本") : undefined} block={this.block}></TextSpanArea>
            </div>
            {this.renderComment()}
        </div>
    }
}


