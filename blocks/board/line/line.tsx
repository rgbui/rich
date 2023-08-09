import lodash from "lodash";
import React, { ReactNode } from "react";
import { Block } from "../../../src/block";
import { BlockRenderRange } from "../../../src/block/enum";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BoardBlockSelector, BoardPointType } from "../../../src/block/partial/board";
import { CurveUtil } from "../../../src/block/svg/curve";
import { Segment } from "../../../src/block/svg/segment";
import { BlockView } from "../../../src/block/view";
import { Point, PointArrow, Rect } from "../../../src/common/vector/point";
import { Polygon } from "../../../src/common/vector/polygon";
import { util } from "../../../util/util";
import { renderLine } from "./render";
import "./style.less";

export type PortLocation = {
    x: number | PointArrow,
    y: number | PointArrow,
    blockId?: string
}

@url('/line')
export class Line extends Block {
    getBlockBoardSelector(types: BoardPointType[] = [
        BoardPointType.path,
        BoardPointType.resizePort,
        BoardPointType.connectPort
    ]) {
        var pickers: BoardBlockSelector[] = [];
        try {
            var gm = this.globalWindowMatrix;
            var segs = this.segments;
            segs.each((seg, i) => {
                if (seg)
                    pickers.push({
                        type: BoardPointType.lineMovePort,
                        arrows: [PointArrow.point],
                        point: gm.transform(seg.point),
                        data: { at: i }
                    });
            });
            for (var i = 0; i < segs.length - 1; i++) {
                var current = segs[i];
                var next = segs[i + 1];
                if (current && next)
                    pickers.push({
                        type: BoardPointType.lineSplitPort,
                        arrows: [PointArrow.point],
                        point: gm.transform(CurveUtil.cacCurvePoint(
                            {
                                start: current.point,
                                end: next.point,
                                control1: current.handleOut,
                                control2: next.handleIn
                            }, .5)),
                        data: { at: i }
                    });
            }
            return pickers;
        }
        catch (ex) {
            console.error(ex);
            return []
        }
    }
    @prop()
    from: PortLocation = { x: 0, y: 0 };
    @prop()
    to: PortLocation = { x: 100, y: 100 };
    @prop()
    points: PortLocation[] = [];
    cacPointSegment(pl: PortLocation, options?: { isOnlyPointSegment?: boolean }) {
        try {
            var seg: Segment;
            if (pl == this.from || pl == this.to) {
                if (pl.blockId) {
                    var block = this.page.find(g => g.id == pl.blockId);
                    if (block) {
                        var pickers = block.getBlockBoardSelector([BoardPointType.pathConnectPort]);
                        var ps = typeof pl.x == 'string' && typeof pl.y == 'string' ? pickers.findAll(x => x.type == BoardPointType.pathConnectPort) : pickers.findAll(x => x.type == BoardPointType.path);
                        if (typeof pl.x == 'string' && typeof pl.y == 'string') {
                            var pi = ps.find(g => g.arrows.every(s => [pl.x, pl.y].includes(s)));
                            if (pi) {
                                /***
                                 * 计算 https://www.muzhuangnet.com/show/51297.html
                                 */
                                var point = this.globalWindowMatrix.inverseTransform(pi.point);
                                var handleOut: Point = pi.arrowPoint ? this.globalWindowMatrix.inverseTransform(pi.arrowPoint) : undefined;
                                var isFrom = pl == this.from;
                                seg = Segment.create(new Point(point), !isFrom ? handleOut : undefined, isFrom ? handleOut : undefined)
                            }
                        }
                    }
                }
                else seg = Segment.create(new Point(pl.x as number, pl.y as number))
            }
            else if (this.points.includes(pl)) {
                var at = this.points.findIndex(g => g === pl);
                var current = new Point(pl.x as number, pl.y as number);
                if (options?.isOnlyPointSegment) {
                    seg = Segment.create(
                        current,
                        undefined,
                        undefined
                    )
                }
                else {
                    if (at == 0) {
                        var pre = this.cacPointSegment(this.from, { isOnlyPointSegment: true });
                        var next = this.cacPointSegment(this.points.length - 1 == at ? this.to : this.points[at + 1], { isOnlyPointSegment: true });
                        var ce = pre.point.center(next.point);
                        var r = current.diff(ce);
                        seg = Segment.create(
                            current,
                            pre.point.center(ce).move(r[0], r[1]),
                            next.point.center(ce).move(r[0], r[1]),
                        )
                    }
                    else if (at == this.points.length - 1) {
                        var pre = this.cacPointSegment(this.points[at - 1], { isOnlyPointSegment: true });
                        var next = this.cacPointSegment(this.to, { isOnlyPointSegment: true });
                        var ce = pre.point.center(next.point);
                        var r = current.diff(ce);
                        seg = Segment.create(
                            current,
                            pre.point.center(ce).move(r[0], r[1]),
                            next.point.center(ce).move(r[0], r[1]),
                        )
                    }
                    else {
                        var pre = this.cacPointSegment(this.points[at - 1], { isOnlyPointSegment: true });
                        var next = this.cacPointSegment(this.points[at + 1], { isOnlyPointSegment: true });
                        var ce = pre.point.center(next.point);
                        var r = current.diff(ce);
                        seg = Segment.create(
                            current,
                            pre.point.center(ce).move(r[0], r[1]),
                            next.point.center(ce).move(r[0], r[1]),
                        )
                    }
                }
            }
            if (this.lineType == 'straight') {
                delete seg.handleIn;
                delete seg.handleOut;
            }
            return seg;
        }
        catch (ex) {
            this.page.onError(ex);
            console.error(ex);
            return undefined;
        }
    }
    get segments() {
        try {
            var segs = [
                this.cacPointSegment(this.from),
                ...(this.points.toArray(pl => this.cacPointSegment(pl))),
                this.cacPointSegment(this.to)
            ];
            lodash.remove(segs, g => g ? false : true);
            return segs;
        }
        catch (ex) {
            this.page.onError(ex);
            return [

            ]
        }
    }
    async updateLine(from: PortLocation, to: PortLocation, oldData?: {
        from: PortLocation;
        to: PortLocation;
    }) {
        oldData = oldData || { from: util.clone(this.from), to: util.clone(this.to) };
        if (oldData.from.blockId !== from.blockId) {
            if (oldData.from.blockId) {
                var fb = this.page.find(g => g.id == oldData.from.blockId);
                if (fb) {
                    fb.disconnectLine(this);
                }
            }
            if (from.blockId) {
                var fb = this.page.find(g => g.id == from.blockId);
                if (fb) {
                    fb.conectLine(this);
                }
            }
        }
        if (oldData.to.blockId !== to.blockId) {
            if (oldData.to.blockId) {
                var fb = this.page.find(g => g.id == oldData.to.blockId);
                if (fb) {
                    fb.disconnectLine(this);
                }
            }
            if (to.blockId) {
                var fb = this.page.find(g => g.id == to.blockId);
                if (fb) {
                    fb.conectLine(this);
                }
            }
        }
        this.manualUpdateProps(oldData, { from, to });
    }
    @prop()
    lineStart: string | number = 'none';
    @prop()
    lineEnd: string | number = 'none';
    @prop()
    lineType: 'straight' | 'curve' = 'curve';
    async getBoardEditCommand(): Promise<{ name: string; value?: any; }[]> {
        var cs: { name: string; value?: any; }[] = [];
        cs.push({ name: 'lineStart', value: this.lineStart });
        cs.push({ name: 'lineEnd', value: this.lineEnd });
        cs.push({ name: 'lineType', value: this.lineType });
        cs.push({ name: 'strokeWidth', value: this.pattern.getSvgStyle()?.strokeWidth || 1 });
        cs.push({ name: 'strokeDasharray', value: this.pattern.getSvgStyle()?.strokeDasharray || 'none' })
        cs.push({ name: 'backgroundColor', value: this.pattern.getSvgStyle()?.stroke || '#000' });
        return cs;
    }
    async setBoardEditCommand(name: string, value: any) {
        if (name == 'backgroundColor') {
            this.pattern.setSvgStyle({ stroke: value })
        }
        else if (['lineStart', 'lineEnd', 'lineType'].includes(name)) {
            this.updateProps({ [name]: value }, BlockRenderRange.self);
        }
        else if (['strokeWidth', 'strokeDasharray'].includes(name)) {
            this.pattern.setSvgStyle({ [name]: value });
        }
    }
    getVisiblePolygon() {
        var gm = this.globalWindowMatrix;
        var poly = new Polygon(...(this.segments.toArray(seg => seg ? gm.transform(seg.point) : undefined)));
        return poly;
    }
    getVisibleBound(): Rect {
        if (this.el)
            return Rect.fromEle(this.el.querySelector('.visible') as HTMLElement)
    }
}
@view('/line')
export class LineView extends BlockView<Line>{
    renderView() {
        var w = this.block.pattern.getSvgStyle()?.strokeWidth || 1;
        var segs = this.block.segments
        if (segs.length == 0) return <div style={this.block.visibleStyle}></div>
        var rect = Segment.getSegmentsBound(segs);
        var re = rect.extend(Math.max(30, w + 5, 100));
        var style = this.block.visibleStyle;
        style.padding = 0;
        return <div className="sy-block-line" style={style}>
            <svg viewBox={`${re.x} ${re.y} ${re.width} ${re.height}`} style={{
                width: re.width,
                height: re.height,
                transform: `translate(${re.x}px,${re.y}px)`
            }}>
                {renderLine(this.block)}
            </svg>
        </div>
    }
}