import lodash from "lodash";
import React from "react";
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
import { cacBrokeLinePoints } from "./util";
import "./style.less";

export type PortLocation = {
    x: number | PointArrow,
    y: number | PointArrow,
    blockPoint?: Point;
    blockId?: string
}

@url('/line')
export class Line extends Block {
    async created() {
        if (!(this.pattern.styles && this.pattern.styles[0]?.cssList?.length > 0)) {
            await this.pattern.setSvgStyle({
                strokeWidth: 3,
                stroke: 'rgb(0,198,145)'
            });
        }
    }
    getBlockBoardSelector(types: BoardPointType[] = [
        BoardPointType.path,
        BoardPointType.resizePort,
        BoardPointType.connectPort
    ]) {
        var pickers: BoardBlockSelector[] = [];
        try {
            var gm = this.globalMatrix;
            var segs = this.segments;
            if (this.lineType == 'line') {
                pickers.push({
                    type: BoardPointType.lineMovePort,
                    arrows: [PointArrow.point],
                    point: gm.transform(segs.first().point),
                    data: { at: 0 }
                });
                // for (let i = 1; i < segs.length - 1; i++) {
                //     var current = segs[i];
                //     var next = segs[i + 1];
                //     if (current && next) {
                //         if (i == 1 || i == segs.length - 2)
                //             pickers.push({
                //                 type: BoardPointType.brokenLineSplitPort,
                //                 arrows: [PointArrow.point],
                //                 point: gm.transform(CurveUtil.cacCurvePoint(
                //                     {
                //                         start: current.point,
                //                         end: next.point,
                //                         control1: current.handleOut,
                //                         control2: next.handleIn
                //                     }, .5)),
                //                 data: { at: i }
                //             });
                //         else {
                //             var p = this.points.find(c => c.x == current.point.x && c.y == current.point.y);
                //             if (p) {
                //                 pickers.push({
                //                     type: BoardPointType.brokenLinePort,
                //                     arrows: [PointArrow.point],
                //                     point: gm.transform(current.point),
                //                     data: { at: this.points.findIndex(g => g === p) }
                //                 });
                //             }
                //         }
                //     }
                // }
                pickers.push({
                    type: BoardPointType.lineMovePort,
                    arrows: [PointArrow.point],
                    point: gm.transform(segs.last().point),
                    data: { at: this.points.length + 1 }
                });
            }
            else {
                segs.each((seg, i) => {
                    if (seg) pickers.push({
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
    getPi(pl: PortLocation) {
        if (pl.blockId) {
            var block = this.page.find(g => g.id == pl.blockId);
            if (block) {
                var pickers = block.getBlockBoardSelector([BoardPointType.pathConnectPort]);
                var ps = typeof pl.x == 'string' && typeof pl.y == 'string' ? pickers.findAll(x => x.type == BoardPointType.pathConnectPort) : pickers.findAll(x => x.type == BoardPointType.path);
                if (typeof pl.x == 'string' && typeof pl.y == 'string') {
                    var pi = ps.find(g => g.arrows.every(s => [pl.x, pl.y].includes(s)));
                    if (pi) {
                        var point = this.globalMatrix.inverseTransform(pi.point);
                        pl.blockPoint = { x: point.x, y: point.y } as any;
                        return { point, pi, block };
                    }
                }
            }
            else {
                if (typeof pl.x != 'number' && pl.blockPoint) {
                    return {
                        point: new Point(pl.blockPoint.x as number, pl.blockPoint.y as number)
                    }
                }
            }
            return { point: new Point(pl.x as number, pl.y as number) }
        }
    }
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
                                var point = this.globalMatrix.inverseTransform(pi.point);
                                var handleOut: Point = pi.arrowPoint ? this.globalMatrix.inverseTransform(pi.arrowPoint) : undefined;
                                var isFrom = pl == this.from;
                                seg = Segment.create(new Point(point), !isFrom ? handleOut : undefined, isFrom ? handleOut : undefined)
                            }
                        }
                    }
                    else {
                        if (typeof pl.x != 'number' && pl.blockPoint) {
                            seg = Segment.create(new Point(pl.blockPoint.x as number, pl.blockPoint.y as number))
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
            //this.page.onError(ex);
            // console.error(ex);
            return undefined;
        }
    }
    get segments() {
        try {
            var segs: Segment[] = [];
            var fp = this.getPi(this.from);
            var tp = this.getPi(this.to);
            if (this.lineType == 'line') {
                if (this.points.length == 0)
                    segs.push(...cacBrokeLinePoints(this, fp, tp));
                else if (this.points.length > 0) {
                    for (let i = 0; i < this.points.length; i++) {
                        if (i == 0) {
                            segs.push(...cacBrokeLinePoints(this, fp, { point: new Point(this.points[i].x as number, this.points[i].y as number) }));
                        }
                        else if (i == this.points.length - 1) {
                            segs.push(...cacBrokeLinePoints(this, { point: new Point(this.points[i].x as number, this.points[i].y as number) }, tp));
                        }
                        else {
                            segs.push(...cacBrokeLinePoints(this,
                                { point: new Point(this.points[i].x as number, this.points[i].y as number) },
                                { point: new Point(this.points[i + 1].x as number, this.points[i + 1].y as number) })
                            );
                        }
                    }
                }
            }
            else {
                segs = [
                    this.cacPointSegment(this.from),
                    ...(this.points.toArray(pl => this.cacPointSegment(pl))),
                    this.cacPointSegment(this.to)
                ];
                lodash.remove(segs, g => g ? false : true);
            }
            return segs;
        }
        catch (ex) {
            //this.page.onError(ex);
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
        await this.manualUpdateProps(oldData, { from, to });
    }
    @prop()
    lineStart: string | number = 'none';
    @prop()
    lineEnd: string | number = 'none';
    @prop()
    lineType: 'straight' | 'curve' | 'line' = 'curve';
    async getBoardEditCommand(): Promise<{ name: string; value?: any; }[]> {
        var cs: { name: string; value?: any; }[] = [];
        cs.push({ name: 'lineStart', value: this.lineStart });
        cs.push({ name: 'lineEnd', value: this.lineEnd });
        cs.push({ name: 'lineType', value: this.lineType });
        cs.push({ name: 'strokeWidth', value: this.pattern.getSvgStyle()?.strokeWidth || 1 });
        cs.push({ name: 'strokeDasharray', value: this.pattern.getSvgStyle()?.strokeDasharray || 'none' })
        cs.push({ name: 'fillColor', value: this.pattern.getSvgStyle()?.stroke || '#000' });
        cs.push({ name: 'fillOpacity', value: this.pattern.getSvgStyle()?.strokeOpacity || 1 })
        return cs;
    }
    async setBoardEditCommand(name: string, value: any) {
        if (name == 'fillColor') {
            await this.pattern.setSvgStyle({ stroke: value })
        }
        else if (name == 'fillOpacity') {
            await this.pattern.setSvgStyle({ strokeOpacity: value })
        }
        else if (name == 'lineType') {
            var props = { [name]: value } as Record<string, any>;
            if (this.lineType != 'line' && value == 'line')
                props.points = [];
            await this.updateProps(props, BlockRenderRange.self);
        }
        else if (['lineStart', 'lineEnd'].includes(name)) {
            await this.updateProps({ [name]: value }, BlockRenderRange.self);
        }
        else if (['strokeWidth', 'strokeDasharray'].includes(name)) {
            await this.pattern.setSvgStyle({ [name]: value });
        }
    } 
    getVisiblePolygon() {
        var gm = this.globalWindowMatrix;
        var poly = new Polygon(...(this.segments.toArray(seg => seg ? gm.transform(seg.point) : undefined)));
        return poly;
    }
    getVisibleBound(): Rect {
        if (this.el) {
            var v = this.el.querySelector('.visible')
            if (v) return Rect.fromEle(this.el.querySelector('.visible') as HTMLElement)
            else Rect.fromEle(this.el);
        }
    }
    async didMounted() {
        this.forceManualUpdate();
    }
    async get(args?: { syncBlock: boolean },
        options?: { emptyChilds?: boolean }) {
        var segs = this.segments;
        if (!(segs?.length > 0)) return null;
        return await super.get(args, options)
    }
    checkPointIn(point: Point) {
        point = this.globalWindowMatrix.inverseTransform(point);
        var segs = this.segments;
        var strokeWidth = this.realPx(10);
        var r = Segment.pointIsInSegment(point, segs, strokeWidth);
        return r;
    }
}

@view('/line')
export class LineView extends BlockView<Line> {
    renderView() {
        var w = this.block.pattern.getSvgStyle()?.strokeWidth || 1;
        var segs = this.block.segments;
        if (segs?.length == 0 || !segs) return <div style={this.block.visibleStyle}></div>
        var rect = Segment.getBound(segs);
        if(!rect) return <div style={this.block.visibleStyle}></div>
        var re = rect.extend(Math.max(30, w * 6, 100));
        var style = this.block.visibleStyle;
        style.padding = 0;
        return <div className="sy-block-line" style={style}>
            <svg shapeRendering={'geometricPrecision'} viewBox={`${re.x} ${re.y} ${re.width} ${re.height}`} style={{
                width: re.width,
                height: re.height,
                transform: `translate(${re.x}px,${re.y}px)`
            }}>
                {renderLine(this.block)}
            </svg>
        </div>
    }
}