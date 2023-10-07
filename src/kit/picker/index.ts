
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
import { Point, PointArrow } from "../../common/vector/point";
import { ActionDirective } from "../../history/declare";
import { openBoardEditTool } from "../operator/board/edit";
import { BlockPickerView } from "./view";
import { setBoardBlockCache } from "../../page/common/cache";

export class BlockPicker {
    kit: Kit;
    view: BlockPickerView;
    constructor(kit: Kit) {
        this.kit = kit;
    }
    visible: boolean = false;
    blocks: Block[] = [];
    onPicker(blocks: Block[], openEditTool = false) {
        this.blocks = blocks;
        this.visible = true;
        if (this.view)
            this.view.forceUpdate();
        if (openEditTool == true) {
            openBoardEditTool(this.kit);
        }
    }
    onRePicker() {
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
        this.blocks.forEach(bl => {
            bl.boardMoveStart(point);
        });
    }
    onMove(from: Point, to: Point) {
        this.blocks.forEach(bl => {
            if (bl.isBoardCanMove())
                bl.boardMove(from, to);
        });
        this.view.forceUpdate();
    }
    async onMoveEnd(from: Point, to: Point) {
        await this.kit.page.onAction(ActionDirective.onMove, async () => {
            if (this.kit.page.keyboardPlate.isAlt()) {
                var bs = await this.blocks.asyncMap(async c => await c.clone());
                await this.blocks.eachAsync(async b => {
                    b.setBoardMoveMatrix(new Matrix());
                })
                await bs.eachAsync(async b => {
                    await b.boardMoveEnd(from, to);
                });
                this.kit.page.addUpdateEvent(async () => {
                    this.onPicker(bs);
                })
            }
            else {
                await this.blocks.eachAsync(async (bl) => {
                    /**
                     * this.currentMatrix*moveMatrix=newMatrix*this.selfMatrix;
                     */
                    await bl.boardMoveEnd(from, to)
                });
            }
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
        }
        await fra.page.onAction(ActionDirective.onBoardToolCreateBlock, async () => {
            await new Promise((resolve: (value: any) => void, reject) => {
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
                                await lineBlock.updateProps({
                                    to: {
                                        blockId: self.kit.boardLine.over.block.id,
                                        x: self.kit.boardLine.over.selector.arrows[1],
                                        y: self.kit.boardLine.over.selector.arrows[0]
                                    }
                                });
                                self.kit.boardLine.over.block.conectLine(lineBlock);
                            }
                            else {
                                var s;
                                if (block.url == BlockUrlConstant.Shape) {
                                    s = await useShapeSelector({ roundPoint: Point.from(ev) });
                                    if (s) {
                                        var ma = new Matrix();
                                        re = gm.inverseTransform(Point.from(ev));
                                        ma.translate(re.x, re.y);
                                        var cd = await block.cloneData();
                                        cd.matrix = ma.getValues();
                                        cd.svg = s.svg;
                                        cd.svgName = s.name;
                                        var shapeBlock = await fra.page.createBlock(BlockUrlConstant.Shape, cd, fra);
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
                                }
                                if (!s) {
                                    var tr = gm.inverseTransform(Point.from(ev));
                                    await lineBlock.updateProps({
                                        to: { x: tr.x, y: tr.y }
                                    });
                                }
                            }
                        }
                        else {
                            var ma = block.matrix.clone();
                            if (arrows.includes(PointArrow.right)) {
                                ma.translate(block.fixedWidth + 100, 0)
                            }
                            else if (arrows.includes(PointArrow.left)) {
                                ma.translate(0 - (block.fixedWidth + 100), 0)
                            }
                            else if (arrows.includes(PointArrow.top)) {
                                ma.translate(0, 0 - (block.fixedHeight + 100))
                            }
                            else if (arrows.includes(PointArrow.bottom)) {
                                ma.translate(0, block.fixedHeight + 100)
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
                        }
                        if (isMounted) lineBlock.forceUpdate()
                        self.kit.boardLine.onEndConnectOther();
                        self.kit.page.addUpdateEvent(async () => {
                            if (newBlock) self.kit.picker.onPicker([newBlock])
                            else self.kit.picker.onPicker([lineBlock])
                        })
                        resolve(true);
                    }
                });
            })
        })
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
                moving(ev, data, isEnd) {
                    var point = gm.inverseTransform(Point.from(ev));
                    block[key] = { x: point.x, y: point.y };
                    block.forceUpdate();
                    self.view.forceUpdate();
                    if (isEnd) {
                        if (self.kit.boardLine.over) {
                            block[key] = {
                                blockId: self.kit.boardLine.over.block.id,
                                x: self.kit.boardLine.over.selector.arrows[1],
                                y: self.kit.boardLine.over.selector.arrows[0]
                            };
                        }
                        block.onUpdateLine(block.from, block.to, oldData);
                    }
                },
                async moveEnd() {
                    self.kit.boardLine.onEndConnectOther();
                    await openBoardEditTool(self.kit);
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
                        var r = block.realPx(5);
                        if (pre && new Point(pre.x as number, pre.y as number).nearBy(new Point(point.x as number, point.y as number), r)) {
                            block.points.remove(g => g === pre);
                        }
                        if (next && new Point(next.x as number, next.y as number).nearBy(new Point(point.x as number, point.y as number), r)) {
                            block.points.remove(g => g === next);
                        }
                        block.onManualUpdateProps(oldProps, { points: block.points });
                        await openBoardEditTool(self.kit);
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
        var sel = window.getSelection();
        var rowBlock = aa.block.closest(x => x.isBlock);
        if (!this.blocks.some(s => s == rowBlock)) {
            setTimeout(() => {
                sel.collapse(aa.block.page.viewEl);
                // sel.removeAllRanges();
            }, 10);
        }
        this.kit.picker.onPicker([rowBlock]);
        var self = this;
        var gm = rowBlock.panelGridMap;
        MouseDragger({
            event,
            dis: 5,
            moveStart() {
                gm.start();
                forceCloseBoardEditTool()
            },
            move(ev, data) {
                self.onMove(Point.from(event), Point.from(ev));
            },
            moveEnd(ev, isMove, data) {
                if (isMove) {
                    gm.over()
                    self.onMoveEnd(Point.from(event), Point.from(ev));
                }
            }
        })
        if (this.kit.picker.blocks.length > 0)
            await openBoardEditTool(this.kit);
    }
}