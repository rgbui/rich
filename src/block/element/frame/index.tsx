
import React from 'react';
import { Block } from '../..';
import { BlockView } from '../../view';
import { prop, url, view } from '../../factory/observable';
import { ChildsArea, TextArea } from '../../view/appear';
import { BoardPointType, BoardBlockSelector } from '../../partial/board';
import { BlockCssName } from '../../pattern/css';
import { Rect, RectUtility, PointArrow } from '../../../common/vector/point';
import { Polygon } from '../../../common/vector/polygon';
import { lst } from '../../../../i18n/store';
import "./style.less";
import { BlockRenderRange } from '../../enum';
import { GridMap } from '../../../page/grid';

/**
 * 可以将相邻的block变成一个整体去操作，
 * 可以看成是contentBlock
 */
@url('/frame')
export class Frame extends Block {
    async created(this: Block): Promise<void> {
        this.pattern.setFillStyle({ color: '#fff' });
    }
    get isEnterCreateNewLine(): boolean {
        return false;
    }
    get isCanEmptyDelete() {
        if (this.isFreeBlock) return false;
        else return true;
    }
    get isSupportTextStyle() {
        return false;
    }
    get isDisabledInputLine() {
        return true;
    }
    init() {
        super.init();
        this.content = lst('容器');
        this.gridMap = new GridMap(this)
    }
    @prop()
    frameFormat: 'none' | '1:1' | "3:4" | "4:3" | "16:9" | "A4" | "web" | 'phone' | 'pad' = 'none';
    @prop()
    content: string = '';
    @prop()
    fixedWidth: number = 800;
    @prop()
    fixedHeight: number = 300;
    getBlockBoardSelector(types?: BoardPointType[]): BoardBlockSelector[] {
        var h = 30;
        var pickers: BoardBlockSelector[] = [];
        var { width, height } = this.fixedSize;
        var rect = new Rect(0, h, width, height - h);
        var gm = this.globalMatrix;
        // var gs = gm.resolveMatrixs();
        /**
         * 这里基本没有skew，只有scale,rotate,translate
         * scale 水平和垂直相等
         */
        var pathRects = RectUtility.getRectLineRects(rect, this.realPx(1));
        if (types.includes(BoardPointType.path))
            pickers.push(...pathRects.map((pr, i) => {
                var arrows: PointArrow[] = [];
                if (i == 0) arrows = [PointArrow.top, PointArrow.center];
                else if (i == 1) arrows = [PointArrow.middle, PointArrow.right];
                else if (i == 2) arrows = [PointArrow.bottom, PointArrow.center]
                else if (i == 3) arrows = [PointArrow.middle, PointArrow.left]
                return {
                    type: BoardPointType.path,
                    arrows,
                    poly: new Polygon(...pr.points.map(p => gm.transform(p)))
                }
            }))
        // if (types.includes(BoardPointType.pathConnectPort))
        //     pickers.push(...rect.centerPoints.map((pr, i) => {
        //         var arrows: PointArrow[] = [];
        //         if (i == 0) arrows = [PointArrow.top, PointArrow.center];
        //         else if (i == 1) arrows = [PointArrow.middle, PointArrow.right];
        //         else if (i == 2) arrows = [PointArrow.bottom, PointArrow.center]
        //         else if (i == 3) arrows = [PointArrow.middle, PointArrow.left]
        //         return {
        //             type: BoardPointType.pathConnectPort,
        //             arrows,
        //             point: gm.transform(pr)
        //         }
        //     }))
        if (types.includes(BoardPointType.resizePort)) pickers.push(...rect.points.map((p, i) => {
            var arrows: PointArrow[] = [];
            if (i == 0) arrows = [PointArrow.top, PointArrow.left];
            else if (i == 1) arrows = [PointArrow.top, PointArrow.right];
            else if (i == 2) arrows = [PointArrow.bottom, PointArrow.right]
            else if (i == 3) arrows = [PointArrow.bottom, PointArrow.left]
            return {
                type: BoardPointType.resizePort,
                arrows,
                point: gm.transform(p)
            }
        }))
        return pickers;
    }
    async getBoardEditCommand(): Promise<{ name: string; value?: any; }[]> {
        var cs: { name: string; value?: any; }[] = [];
        cs.push({ name: 'backgroundColor', value: this.pattern.css(BlockCssName.fill)?.color || 'transparent' });
        cs.push({ name: 'frameFormat', value: this.frameFormat })
        return cs;
    }
    async setBoardEditCommand(this: Block, name: string, value: any) {
        if (name == 'backgroundColor')
            this.pattern.setFillStyle({ color: value, mode: 'color' });
        else if (name == 'frameFormat') {
            var props: Record<string, any> = {}
            if (value == '1:1') {
                props.fixedWidth = Math.min(this.fixedWidth, this.fixedHeight);
                props.fixedHeight = props.fixedWidth;
            }
            else if (value == '3:4') {
                props.fixedWidth = Math.min(this.fixedWidth, this.fixedHeight * 4 / 3);
                props.fixedHeight = props.fixedWidth * 3 / 4;
            }
            else if (value == '4:3') {
                props.fixedWidth = Math.min(this.fixedWidth, this.fixedHeight * 3 / 4);
                props.fixedHeight = props.fixedWidth * 4 / 3;
            }
            else if (value == '16:9') {
                props.fixedWidth = Math.min(this.fixedWidth, this.fixedHeight * 9 / 16);
                props.fixedHeight = props.fixedWidth * 16 / 9;
            }
            else if (value == 'A4') {
                const a4Width = 595; // A4 paper width in pixels
                const a4Height = 842; // A4 paper height in pixels
                props.fixedWidth = a4Width;
                props.fixedHeight = a4Height;
            }
            await this.updateProps({ frameFormat: value, ...props }, BlockRenderRange.self)
        }
    }
}

@view('/frame')
export class FrameView extends BlockView<Frame>{
    renderView() {
        var h = 30;
        var h20 = 20;
        var style = Object.assign({
            width: this.block.fixedWidth,
            height: this.block.fixedHeight
        }, this.block.visibleStyle);
        var gap = 0;
        var gh = 0;
        if (['pad', 'phone'].includes(this.block.frameFormat)) {
            gap = 20;
        }
        if (this.block.frameFormat == 'web') {
            gh = 24;
        }
        return <div className='sy-block-frame' style={style} >
            <div className='sy-block-frame-head' style={{ height: h, lineHeight: h + 'px', fontSize: h20 / 1.2 }}>
                <TextArea block={this.block} placeholder={lst('容器')} prop='content' ></TextArea>
            </div>
            {this.renderBorder()}
            <div>
                <ChildsArea childs={this.block.childs}></ChildsArea>
            </div>
            <div className='sy-block-frame-content' style={{
                top: gap + gh + h,
                left: gap,
                bottom: gap,
                right: gap,
                ...this.block.contentStyle
            }}>
            </div>
        </div>
    }
    renderBorder() {
        var h = 30;
        if (this.block.frameFormat == 'web') {
            return <div className='pos' style={{ boxSizing: 'border-box', top: h, left: 0, height: 24, right: 0, width: '100%' }}>
                <div className='flex r-gap-w-10' style={{ height: 24, background: '#444', borderRadius: '16px 16px 0px 0px' }}>
                    <div className='size-10 circle bg-white'></div>
                    <div className='size-10 circle bg-white'></div>
                    <div className='size-10 circle bg-white'></div>
                </div>
            </div>
        }
        else if (this.block.frameFormat == 'pad') {
            return <div className='pos round-16' style={{ boxSizing: 'border-box', top: h, left: 0, width: '100%', height: 'calc(100% - 30px)', border: '20px solid #444' }}></div>
        }
        else if (this.block.frameFormat == 'phone') {
            return <div className='pos round-16' style={{ boxSizing: 'border-box', top: h, left: 0, width: '100%', height: 'calc(100% - 30px)', border: '20px solid #444' }}>

            </div>
        }
    }
}


