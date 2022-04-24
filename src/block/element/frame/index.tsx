
import React from 'react';
import { Block } from '../..';
import { BlockView } from '../../view';
import { prop, url, view } from '../../factory/observable';
import { ChildsArea, TextArea } from '../../view/appear';
import { BlockAppear } from '../../appear';
import "./style.less";
import { BoardPointType, BoardBlockSelector } from '../../partial/board';
import { BlockCssName } from '../../pattern/css';
import { Rect, RectUtility, PointArrow } from '../../../common/vector/point';
import { Polygon } from '../../../common/vector/polygon';

/**
 * 可以将相邻的block变成一个整体去操作，
 * 可以看成是contentBlock
 */
@url('/frame')
export class Frame extends Block {
    async created(this: Block): Promise<void> {
        this.pattern.setFillStyle({ color: '#fff' });
    }
    @prop()
    content: string = '框';
    @prop()
    fixedWidth: number = 800;
    @prop()
    fixedHeight: number = 300;
    getBlockBoardSelector(this: Block, types?: BoardPointType[]): BoardBlockSelector[] {
        var h = 30;
        var pickers: BoardBlockSelector[] = [];
        var { width, height } = this.fixedSize;
        var rect = new Rect(0, h, width, height - h);
        var gm = this.globalWindowMatrix;
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
        if (types.includes(BoardPointType.pathConnectPort))
            pickers.push(...rect.centerPoints.map((pr, i) => {
                var arrows: PointArrow[] = [];
                if (i == 0) arrows = [PointArrow.top, PointArrow.center];
                else if (i == 1) arrows = [PointArrow.middle, PointArrow.right];
                else if (i == 2) arrows = [PointArrow.bottom, PointArrow.center]
                else if (i == 3) arrows = [PointArrow.middle, PointArrow.left]
                return {
                    type: BoardPointType.pathConnectPort,
                    arrows,
                    point: gm.transform(pr)
                }
            }))
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
    async getBoardEditCommand(this: Block): Promise<{ name: string; value?: any; }[]> {
        var cs: { name: string; value?: any; }[] = [];
        cs.push({ name: 'frameRadio' });
        cs.push({ name: 'backgroundColor', value: this.pattern.css(BlockCssName.fill)?.color || 'transparent' });
        return cs;
    }
    async setBoardEditCommand(this: Block, name: string, value: any) {
        if (name == 'backgroundColor')
            this.pattern.setFillStyle({ color: value, mode: 'color' });
    }
}
@view('/frame')
export class FrameView extends BlockView<Frame>{
    render() {
        var h = 30;
        var h20 = 20;
        var style = Object.assign({ width: this.block.fixedWidth, height: this.block.fixedHeight }, this.block.visibleStyle);
        return <div className='sy-block-frame' style={style} >
            <div className='sy-block-frame-head' style={{ height: h, lineHeight: h + 'px', fontSize: h20 / 1.2 }}>
                <TextArea  block={this.block}  placeholder='框'  prop='content' ></TextArea>
            </div>
            <ChildsArea childs={this.block.childs}></ChildsArea>
            <div className='sy-block-frame-content' style={{ top: h }}>
            </div>
        </div>
    }
}


