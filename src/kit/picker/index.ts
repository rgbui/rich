
import React from "react";
import { Kit } from "..";
import { Line, PortLocation } from "../../../blocks/board/line/line";
import { forceCloseBoardEditTool } from "../../../extensions/board.edit.tool";
import { useShapeSelector } from "../../../extensions/shapes/box";
import { util } from "../../../util/util";
import { Block } from "../../block";
import { AppearAnchor } from "../../block/appear";
import { BlockUrlConstant } from "../../block/constant";
import { BlockRenderRange } from "../../block/enum";
import { BoardBlockSelector, BoardPointType } from "../../block/partial/board";
import { MouseDragger } from "../../common/dragger";
import { Matrix } from "../../common/matrix";
import { Point, PointArrow, Rect } from "../../common/vector/point";
import { ActionDirective } from "../../history/declare";
import { openBoardEditTool } from "../operator/board/edit";
import { BlockPickerView } from "./view";
import { setBoardBlockCache } from "../../page/common/cache";
import { GridMap } from "../../page/grid";
import { CacAlignLines } from "./common";
import lodash from "lodash";
import { Segment } from "../../block/svg/segment";
import { BoardDrag } from "../operator/board";

export class BlockPicker {
    kit: Kit;
    view: BlockPickerView;
    constructor(kit: Kit) {
        this.kit = kit;
    }
    visible: boolean = false;
    blocks: Block[] = [];
    alighLines: {
        arrow: 'x' | 'y';
        start: Point;
        end: Point;
    }[] = [];
    onPicker(blocks: Block[], openEditTool = false) {
        this.blocks = blocks;
        this.alighLines = [];
        this.visible = true;
        if (this.view)
            this.view.forceUpdate();
        if (openEditTool == true) {
            openBoardEditTool(this.kit);
        }
    }
    onRePicker() {
        this.alighLines = [];
        this.blocks.forEach(bl => {
            bl.updateRenderLines();
        });
        if (this.view)
            this.view.forceUpdate();
    }
    onShiftPicker(blocks: Block[]) {
        blocks.each(b => {
            if (!this.blocks.some(g => g == b)) this.blocks.push(b)
        })
        this.visible = true;
        this.view.forceUpdate();
    }
    onCancel() {
        this.visible = false;
        this.blocks = [];
        if (this.view) this.view.forceUpdate();
        forceCloseBoardEditTool();
    }
    onMoveStart(point: Point) {
        this.alighLines = [];
        this.blocks.forEach(bl => {
            bl.boardMoveStart(point);
        });
        if (this.blocks.length == 1 && this.blocks[0].url !== BlockUrlConstant.Line) {
            this.moveRect = this.blocks[0].getVisibleBound();
        }
        else this.moveRect = undefined;
    }
    moveRect: Rect;
    onMove(from: Point, to: Point, gm?: GridMap) {
        var gs: {
            ox: number;
            oy: number;
            lines: {
                arrow: 'x' | 'y';
                start: Point;
                end: Point;
            }[];
        }
        if (gm && this.blocks.length == 1 && this.moveRect)
            gs = CacAlignLines(this.blocks[0], gm, from, to, this.moveRect);
        if (typeof gs?.ox == 'number' || typeof gs?.oy == 'number') {
            if (gs.ox) to.x = gs.ox + to.x;
            if (gs.oy) to.y = gs.oy + to.y;
        }
        this.blocks.forEach(bl => {
            if (bl.isBoardCanMove())
                bl.boardMove(from, to);
        });
        this.alighLines = gs?.lines || [];
        this.alighLines.forEach(ag => {
            ag.start = this.kit.page.windowMatrix.inverseTransform(ag.start);
            ag.end = this.kit.page.windowMatrix.inverseTransform(ag.end);
        })
        this.view.forceUpdate();
    }
    async onMoveEnd(from: Point, to: Point, gm?: GridMap) {
        var gs: {
            ox: number;
            oy: number;
            lines: {
                arrow: 'x' | 'y';
                start: Point;
                end: Point;
            }[];
        }
        if (gm && this.blocks.length == 1 && this.moveRect)
            gs = CacAlignLines(this.blocks[0], gm, from, to, this.moveRect);
        if (typeof gs?.ox == 'number' || typeof gs?.oy == 'number') {
            if (gs.ox) to.x = gs.ox + to.x;
            if (gs.oy) to.y = gs.oy + to.y;
        }
        this.alighLines = [];
        this.moveRect = null;
        await this.kit.page.onAction(ActionDirective.onMove, async () => {
            await this.blocks.eachAsync(async (bl) => {
                /**
                 * this.currentMatrix*moveMatrix=newMatrix*this.selfMatrix;
                 */
                await bl.boardMoveEnd(from, to)
            });
        })
        this.view.forceUpdate();
    }
    onResizeBlock(block: Block, arrows: PointArrow[], event: React.MouseEvent) {
        event.stopPropagation();
        block.onResizeBoardSelector(arrows, event);
    }
    async onCreateBlockConnect(block: Block, arrows: PointArrow[], event: React.MouseEvent) {
        event.stopPropagation();
        var fra: Block = block ? block.frameBlock : this.kit.page.getPageFrame();
        var lineBlock: Block;
        var isMounted: boolean = false;
        var gm = fra.globalWindowMatrix;
        var pe = Point.from(event)
        var re = gm.inverseTransform(pe);
        var self = this;
        this.onCancel();
        async function createConnectLine() {
            await fra.page.onAction(ActionDirective.onBoardToolCreateBlock, async () => {
                var data = { url: BlockUrlConstant.Line } as Record<string, any>;
                data.from = { x: arrows[1], y: arrows[0], blockId: block.id };
                data.to = { x: re.x, y: re.y };
                lineBlock = await self.kit.page.createBlock(data.url, data, fra);
                await setBoardBlockCache(lineBlock);
                block.conectLine(lineBlock);
                lineBlock.mounted(() => {
                    isMounted = true;
                });
                self.kit.boardLine.onStartConnectOther(lineBlock);
                lineBlock.parent.forceUpdate();
            })
        }

        MouseDragger({
            event,
            moveStart() {
                forceCloseBoardEditTool()
                createConnectLine();
            },
            move(ev, data) {
                if (lineBlock) {
                    var tr = gm.inverseTransform(Point.from(ev));
                    (lineBlock as any).to = { x: tr.x, y: tr.y };
                    if (isMounted) lineBlock.forceUpdate();
                }
            },
            async moveEnd(ev, isMove, data) {
                var newBlock: Block;
                if (!lineBlock) {
                    await createConnectLine();
                }
                if (isMove) {
                    if (self.kit.boardLine.over) {
                        await self.kit.page.onAction('onBoardToolConnectBlockAfter', async () => {
                            await lineBlock.updateProps({
                                to: {
                                    blockId: self.kit.boardLine.over.block.id,
                                    x: self.kit.boardLine.over.selector.arrows[1],
                                    y: self.kit.boardLine.over.selector.arrows[0]
                                }
                            });
                        })
                        self.kit.boardLine.over.block.conectLine(lineBlock);
                    }
                    else {
                        var s;
                        s = await useShapeSelector({ roundPoint: Point.from(ev) });
                        await self.kit.page.onAction('onBoardToolConnectBlockAfter', async () => {
                            if (s) {
                                var ma = new Matrix();
                                re = gm.inverseTransform(Point.from(ev));
                                ma.translate(re.x, re.y);
                                var cd = await block.cloneData();
                                cd.matrix = ma.getValues();
                                cd.svg = s.svg;
                                cd.svgName = s.name;
                                var shapeBlock = await fra.page.createBlock(BlockUrlConstant.Shape, cd, fra);
                                await setBoardBlockCache(shapeBlock);
                                var pickers = shapeBlock.getBlockBoardSelector([BoardPointType.pathConnectPort]);
                                var otherArrow = arrows.includes(PointArrow.right) ? PointArrow.left : PointArrow.right
                                if (arrows.includes(PointArrow.top) || arrows.includes(PointArrow.bottom))
                                    otherArrow = arrows.includes(PointArrow.top) ? PointArrow.bottom : PointArrow.top
                                var p2 = pickers.find(g => g.arrows.includes(otherArrow))
                                await lineBlock.updateProps({
                                    to: {
                                        blockId: shapeBlock.id,
                                        x: p2.arrows[0],
                                        y: p2.arrows[1]
                                    }
                                });
                                shapeBlock.conectLine(lineBlock);
                                newBlock = shapeBlock;
                            }
                            else {
                                var tr = gm.inverseTransform(Point.from(ev));
                                await lineBlock.updateProps({
                                    to: { x: tr.x, y: tr.y }
                                });
                            }
                        })
                    }
                }
                else {
                    await self.kit.page.onAction('onBoardToolConnectBlockAfter', async () => {
                        var ma = block.matrix.clone();
                        var wd = fra.realPx(100);
                        if (arrows.includes(PointArrow.right)) {
                            ma.translate(block.fixedWidth + wd, 0)
                        }
                        else if (arrows.includes(PointArrow.left)) {
                            ma.translate(0 - (block.fixedWidth + wd), 0)
                        }
                        else if (arrows.includes(PointArrow.top)) {
                            ma.translate(0, 0 - (block.fixedHeight + wd))
                        }
                        else if (arrows.includes(PointArrow.bottom)) {
                            ma.translate(0, block.fixedHeight + wd)
                        }
                        var cloneData = await block.cloneData();
                        cloneData.matrix = ma.getValues();
                        var cloneBlock = await fra.page.createBlock(cloneData.url, cloneData, fra);
                        var pickers = cloneBlock.getBlockBoardSelector([BoardPointType.pathConnectPort]);
                        var otherArrow = arrows.includes(PointArrow.right) ? PointArrow.left : PointArrow.right
                        if (arrows.includes(PointArrow.top) || arrows.includes(PointArrow.bottom))
                            otherArrow = arrows.includes(PointArrow.top) ? PointArrow.bottom : PointArrow.top
                        var p2 = pickers.find(g => g.arrows.includes(otherArrow))
                        await lineBlock.updateProps({
                            to: {
                                blockId: cloneBlock.id,
                                x: p2.arrows[0],
                                y: p2.arrows[1]
                            }
                        });
                        cloneBlock.conectLine(lineBlock);
                        newBlock = cloneBlock;
                    })
                }
                if (isMounted) lineBlock.forceUpdate()
                self.kit.boardLine.onEndConnectOther();
                if (newBlock) self.kit.picker.onPicker([newBlock])
                else self.kit.picker.onPicker([lineBlock])
            }
        });
    }
    async onSplitLinePort(block: Line, selector: BoardBlockSelector, event: React.MouseEvent) {
        event.stopPropagation();
        var gm = block.globalWindowMatrix;
        var po: PortLocation;
        var self = this;
        MouseDragger({
            event,
            moveStart(ev) {
                forceCloseBoardEditTool()
                var tr = gm.inverseTransform(Point.from(ev));
                po = { x: tr.x, y: tr.y } as PortLocation;
                block.points.insertAt(selector.data.at, po);
                self.onRePicker();
                block.forceUpdate();
            },
            move(ev, data) {
                if (po) {
                    var tr = gm.inverseTransform(Point.from(ev));
                    po.x = tr.x;
                    po.y = tr.y;
                    self.onRePicker();
                    block.forceUpdate();
                }
            },
            async moveEnd(ev, isMove, data) {
                if (isMove) {
                    var ps = block.points.find(g => g != po);
                    block.onManualUpdateProps({ points: ps }, { points: block.points }, { range: BlockRenderRange.self });
                    self.onRePicker();
                    block.forceUpdate();
                    await openBoardEditTool(self.kit);
                }
            }
        });
    }
    async onBrokenLinePort(block: Line, selector: BoardBlockSelector, event: React.MouseEvent) {
        event.stopPropagation();
        var gm = block.globalWindowMatrix;
        var po: Point;
        var self = this;
        var segs = block.segments.map(s => s.clone())
        var oldSegs = block.segments.map(s => s.clone())
        var current = segs[selector.data.at];
        var next = segs[selector.data.at + 1];
        var isX = Math.abs(current.point.x - next.point.x) > Math.abs(current.point.y - next.point.y);
        var isStart = selector.data.at == 0 ? true : false;
        var tr = gm.inverseTransform(Point.from(event));
        po = new Point(tr.x, tr.y);
        MouseDragger({
            event,
            moveStart(ev) {
                forceCloseBoardEditTool()
                if (selector.type == BoardPointType.brokenLinePort) {

                }
                else {
                    if (isX) {
                        if (isStart) {
                            segs.insertAt(selector.data.at + 1, Segment.create(new Point(po.x, current.point.y)));
                            segs.insertAt(selector.data.at + 2, Segment.create(po));
                        }
                        else {
                            segs.insertAt(selector.data.at + 1, Segment.create(po));
                            segs.insertAt(selector.data.at + 2, Segment.create(new Point(po.x, current.point.y)));
                        }
                    }
                    else {
                        if (isStart) {
                            segs.insertAt(selector.data.at + 1, Segment.create(new Point(current.point.x, po.y)));
                            segs.insertAt(selector.data.at + 2, Segment.create(po));
                        }
                        else {
                            segs.insertAt(selector.data.at + 1, Segment.create(po));
                            segs.insertAt(selector.data.at + 2, Segment.create(new Point(current.point.x, po.y)));
                        }
                    }
                    block.points = segs.slice(1, -1).map(c => c.point);
                    console.log(block.points);
                }
                self.onRePicker();
                block.forceUpdate();
            },
            move(ev, data) {
                var newTr = gm.inverseTransform(Point.from(ev));
                current = lodash.cloneDeep(oldSegs[selector.data.at]);
                next = lodash.cloneDeep(oldSegs[selector.data.at + 1]);
                var dx = newTr.x - po.x;
                var dy = newTr.y - po.y;
                if (selector.type == BoardPointType.brokenLinePort) {
                    if (isX) {
                        current.point.y += dy;
                        next.point.y += dy;
                    }
                    else {
                        current.point.x += dx;
                        next.point.x += dx;
                    }
                    segs[selector.data.at] = current;
                    segs[selector.data.at + 1] = next;
                    block.points = segs.slice(1, -1).map(c => c.point);
                }
                else {
                    var segs_c = segs.map(s => s.clone());
                    if (isX) {
                        if (isStart) {
                            segs_c[selector.data.at + 2].point.x += dx;
                            segs_c[selector.data.at + 2].point.y += dy;
                            segs_c[selector.data.at + 1].point.x = segs_c[selector.data.at + 2].point.x;
                            segs_c[selector.data.at + 3].point.y = segs_c[selector.data.at + 2].point.y;
                        }
                        else {
                            segs_c[selector.data.at + 1].point.x += dx;
                            segs_c[selector.data.at + 1].point.y += dy;
                            segs_c[selector.data.at + 0].point.y = segs_c[selector.data.at + 1].point.y;
                            segs_c[selector.data.at + 2].point.x = segs_c[selector.data.at + 1].point.x;
                        }
                    }
                    else {
                        if (isStart) {
                            segs_c[selector.data.at + 2].point.x += dx;
                            segs_c[selector.data.at + 2].point.y += dy;
                            segs_c[selector.data.at + 1].point.y = segs_c[selector.data.at + 2].point.y;
                            segs_c[selector.data.at + 3].point.x = segs_c[selector.data.at + 2].point.x;
                        }
                        else {
                            segs_c[selector.data.at + 1].point.x += dx;
                            segs_c[selector.data.at + 1].point.y += dy;
                            segs_c[selector.data.at + 0].point.x = segs_c[selector.data.at + 1].point.x;
                            segs_c[selector.data.at + 2].point.y = segs_c[selector.data.at + 1].point.y;
                        }
                    }
                    block.points = segs_c.slice(1, -1).map(c => c.point);
                    console.log(block.points);
                }
                self.onRePicker();
                block.forceUpdate();
            },
            async moveEnd(ev, isMove, data) {
                if (isMove) {
                    var newTr = gm.inverseTransform(Point.from(ev));
                    current = lodash.cloneDeep(oldSegs[selector.data.at]);
                    next = lodash.cloneDeep(oldSegs[selector.data.at + 1]);
                    var dx = newTr.x - po.x;
                    var dy = newTr.y - po.y;
                    if (selector.type == BoardPointType.brokenLinePort) {
                        if (isX) {
                            current.point.y += dy;
                            next.point.y += dy;
                        }
                        else {
                            current.point.x += dx;
                            next.point.x += dx;
                        }
                        segs[selector.data.at] = current;
                        segs[selector.data.at + 1] = next;
                        var bps = segs.slice(1, -1).map(c => c.point);
                        var d = 5;
                        // 新的点集
                        const newPoints = [bps[0]];
                        for (let i = 1; i < bps.length - 1; i++) {
                            const p1 = bps[i - 1];
                            const p2 = bps[i];
                            const p3 = bps[i + 1];
                            // 检查是否形成垂直或水平线段
                            const isHorizontal = Math.abs(p1.y - p2.y) < d && Math.abs(p2.y - p3.y) < d;
                            const isVertical = Math.abs(p1.x - p2.x) < d && Math.abs(p2.x - p3.x) < d;
                            if (!isHorizontal && !isVertical) {
                                newPoints.push(p2);
                            }
                        }
                        // 添加最后一个点
                        newPoints.push(bps[bps.length - 1]);
                        block.points = newPoints;
                        await block.onManualUpdateProps({ points: lodash.cloneDeep(oldSegs.map(s => s.point)) }, { points: block.points }, { range: BlockRenderRange.self });
                    }
                    else {
                        var segs_c = segs.map(s => s.clone());
                        if (isX) {
                            if (isStart) {
                                segs_c[selector.data.at + 2].point.x += dx;
                                segs_c[selector.data.at + 2].point.y += dy;
                                segs_c[selector.data.at + 1].point.x = segs_c[selector.data.at + 2].point.x;
                                segs_c[selector.data.at + 3].point.y = segs_c[selector.data.at + 2].point.y;
                            }
                            else {
                                segs_c[selector.data.at + 1].point.x += dx;
                                segs_c[selector.data.at + 1].point.y += dy;
                                segs_c[selector.data.at + 0].point.y = segs_c[selector.data.at + 1].point.y;
                                segs_c[selector.data.at + 2].point.x = segs_c[selector.data.at + 1].point.x;
                            }
                        }
                        else {
                            if (isStart) {
                                segs_c[selector.data.at + 2].point.x += dx;
                                segs_c[selector.data.at + 2].point.y += dy;
                                segs_c[selector.data.at + 1].point.y = segs_c[selector.data.at + 2].point.y;
                                segs_c[selector.data.at + 3].point.x = segs_c[selector.data.at + 2].point.x;
                            }
                            else {
                                segs_c[selector.data.at + 1].point.x += dx;
                                segs_c[selector.data.at + 1].point.y += dy;
                                segs_c[selector.data.at + 0].point.x = segs_c[selector.data.at + 1].point.x;
                                segs_c[selector.data.at + 2].point.y = segs_c[selector.data.at + 1].point.y;
                            }
                        }
                        block.points = segs_c.slice(1, -1).map(c => c.point);
                        await block.onManualUpdateProps({ points: lodash.cloneDeep(oldSegs.map(s => s.point)) }, { points: block.points }, { range: BlockRenderRange.self });
                    }
                    self.onRePicker();
                    block.forceUpdate();
                    await openBoardEditTool(self.kit);
                }
            }
        });
    }
    async onMovePortBlock(block: Line, selector: BoardBlockSelector, event: React.MouseEvent) {
        event.stopPropagation();
        var gm = block.globalWindowMatrix;
        var self = this;
        if (selector.data.at == 0 || selector.data.at == block.points.length + 1) {
            var oldData = {
                from: util.clone(block.from),
                to: util.clone(block.to)
            };
            this.kit.boardLine.onStartConnectOther(block);
            var key = selector.data.at == 0 ? "from" : "to";
            MouseDragger({
                event,
                moveStart() {
                    forceCloseBoardEditTool()
                },
                async moving(ev, data, isEnd) {
                    var point = gm.inverseTransform(Point.from(ev));
                    block[key] = { x: point.x, y: point.y };
                    if (isEnd) {
                        if (self.kit.boardLine.over) {
                            block[key] = {
                                blockId: self.kit.boardLine.over.block.id,
                                x: self.kit.boardLine.over.selector.arrows[1],
                                y: self.kit.boardLine.over.selector.arrows[0]
                            };
                        }
                        await block.onUpdateLine(block.from, block.to, oldData);
                        self.kit.boardLine.onEndConnectOther();
                        await openBoardEditTool(self.kit);
                        self.onRePicker();
                        return;
                    }
                    block.forceUpdate();
                    self.view.forceUpdate();
                }
            });
        }
        else {
            var oldProps = { points: util.clone(block.points) };
            var point = block.points[selector.data.at - 1];
            var pre = block.points[selector.data.at - 2];
            var next = block.points[selector.data.at];
            MouseDragger({
                event,
                moveStart() {
                    forceCloseBoardEditTool()
                },
                async moving(ev, data, isEnd) {
                    var current = gm.inverseTransform(Point.from(ev));
                    point.x = current.x;
                    point.y = current.y;
                    if (isEnd) {
                        var r = block.realPx(10);
                        if (pre && new Point(pre.x as number, pre.y as number).nearBy(new Point(point.x as number, point.y as number), r)) {
                            block.points.remove(g => g === pre);
                        }
                        if (next && new Point(next.x as number, next.y as number).nearBy(new Point(point.x as number, point.y as number), r)) {
                            block.points.remove(g => g === next);
                        }
                        await block.onManualUpdateProps(oldProps, { points: block.points }, { range: BlockRenderRange.self });
                        await openBoardEditTool(self.kit);
                        self.onRePicker();
                        return;
                    }
                    block.forceUpdate();
                    self.view.forceUpdate();
                }
            });
        }
    }
    async onRotateBlock(block: Block, selector: BoardBlockSelector, event: React.MouseEvent) {
        event.stopPropagation();
        var center: Point = selector.data.center;
        var gm = block.globalWindowMatrix.clone();
        var re = gm.inverseTransform(Point.from(event));
        var d = 180 / Math.PI;
        var angle = Math.atan2(re.y - center.y, re.x - center.x) * d + 180;
        var ma = block.moveMatrix;
        var self = this;
        MouseDragger({
            event,
            moveStart() {
                forceCloseBoardEditTool();
            },
            moving(ev, data, isEnd, isMove) {
                var pos = gm.inverseTransform(Point.from(ev));
                var toAngle = Math.atan2(pos.y - center.y, pos.x - center.x) * d + 180;
                var r = toAngle - angle;
                if (Math.abs(r) > 180) {
                    if (toAngle < angle) r = toAngle + 360 - angle
                    else r = toAngle - 360 - angle;
                }
                var mc = ma.clone();
                mc.rotate(r, center);

                var willMatrix = block.currentMatrix.clone();
                willMatrix.append(mc);
                willMatrix.append(block.selfMatrix.inverted());
                if (Math.abs(willMatrix.getRotation()) < 5) {
                    var da = willMatrix.getRotation() - 5;
                    r += da;
                    mc = ma.clone();
                    mc.rotate(r, center);
                }
                if (isEnd && isMove == false) {
                    var cr = block.matrix.getRotation();
                    if (Math.abs(cr) > 1) {
                        mc = ma.clone();
                        mc.rotate(0 - cr, center);
                    }
                    else mc = new Matrix();
                }
                block.moveMatrix = mc;
                block.updateRenderLines();
                block.view.forceUpdate();
                self.view.forceUpdate();
                if (isEnd) {
                    block.page.onAction(ActionDirective.onRotate, async () => {
                        var newMatrix = block.currentMatrix.clone();
                        newMatrix.append(block.moveMatrix);
                        newMatrix.append(block.selfMatrix.inverted());
                        await block.updateMatrix(block.matrix, newMatrix);
                        block.moveMatrix = new Matrix();
                    })
                }
            },
            async moveEnd() {
                await openBoardEditTool(self.kit);
            }
        });
    }
    async onPickerMousedown(block: Block, selector: BoardBlockSelector, event: React.MouseEvent) {
        event.stopPropagation();
        await block.onPickerMousedown(selector, event);
    }
    async onMousedownAppear(aa: AppearAnchor, event: React.MouseEvent) {
        event.stopPropagation();
        event.preventDefault();
        var sel = window.getSelection();
        var rowBlock = aa.block.closest(x => x.isBlock);
        if (!this.blocks.some(s => s == rowBlock)) {
            setTimeout(() => {
                sel.collapse(aa.block.page.viewEl);
            }, 10);
        }
        BoardDrag(this.kit, rowBlock, event);
    }
}