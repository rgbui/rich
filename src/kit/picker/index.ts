
import { Kit } from "..";
import { Block } from "../../block";
import { MouseDragger } from "../../common/dragger";
import { Matrix } from "../../common/matrix";
import { Rect } from "../../common/vector/point";
import { ActionDirective } from "../../history/declare";
import { BlockPickerView } from "./view";

export class BlockPicker {
    kit: Kit;
    view: BlockPickerView;
    constructor(kit: Kit) {
        this.kit = kit;
    }
    visible: boolean = false;
    blocks: { block: Block, rect: Rect, matrix: Matrix }[] = [];
    onPicker(blocks: Block[]) {
        this.blocks = blocks.map(block => {
            var matrix = block.globalWindowMatrix;
            var scale = matrix.getScaling().x;
            var w, h;
            if (typeof block.fixedWidth == 'undefined') {
                var r = block.getVisibleBound();
                w = r.width / scale;
                h = r.height / scale;
            }
            else {
                w = block.fixedWidth;
                h = block.fixedHeight;
            }
            return { block, rect: new Rect(0, 0, w, h), matrix }
        });
        this.visible = true;
        this.view.forceUpdate();
    }
    onShiftPicker(blocks: Block[]) {
        blocks.each(b => {
            if (!this.blocks.some(s => s.block === b)) {
                this.blocks.push({ block: b, rect: Rect.fromEle(b.el), matrix: b.globalWindowMatrix })
            }
        });
        this.visible = true;
        this.view.forceUpdate();
    }
    onCancel() {
        this.visible = false;
        this.view.forceUpdate();
    }
    onMove(matrix: Matrix) {
        this.blocks.forEach((bl) => {
            bl.block.moveMatrix = matrix;
            bl.matrix = bl.block.globalWindowMatrix.appended(matrix);
            bl.block.forceUpdate()
        });
        this.view.forceUpdate();
    }
    onMoveEnd(matrix: Matrix) {
        this.blocks.forEach((bl) => {
            bl.block.matrix.append(matrix);
            bl.block.moveMatrix = new Matrix();
            bl.matrix = bl.block.globalWindowMatrix;
            bl.block.forceUpdate()
        });
        this.view.forceUpdate();
    }
    onResizeBlock(br: {
        block: Block,
        rect: Rect,
        matrix: Matrix
    },
        arrow: string,
        event: React.MouseEvent) {
        var matrix = br.matrix.clone();
        var blockMatrix = br.block.matrix;
        var block = br.block;
        var w = br.block.fixedWidth;
        var h = br.block.fixedHeight;
        var self = this;
        var rect = br.rect.clone();
        arrow = arrow.toLowerCase();
        MouseDragger({
            event,
            moving(ev, data, isEnd) {
                var r = rect.clone();
                var ma = new Matrix();
                var dx = ev.clientX - event.clientX;
                var dy = ev.clientY - event.clientY;
                var bw = w;
                var bh = h;
                var minW = 50;
                var minH = 50;
                if (arrow.indexOf('top') > -1) {
                    if (bh - dy < minH) dy = bh - minH;
                }
                else if (arrow.indexOf("bottom") > -1) {
                    if (bh + dy < minH) dy = minH - bh;
                }
                if (arrow.indexOf('left') > -1) {
                    if (bw - dx < minW) dx = bw - minW;
                }
                else if (arrow.indexOf('right') > -1) {
                    if (bw + dx < minW) dx = minW - bw;
                }
                if (arrow.indexOf('top') > -1) {
                    r.top += dy;
                    ma.translate(0, dy);
                    bh -= dy;
                    r.height -= dy;
                }
                else if (arrow.indexOf("bottom") > -1) {
                    bh += dy;
                    r.height += dy;
                }
                if (arrow.indexOf('left') > -1) {
                    r.left += dx;
                    ma.translate(dx, 0);
                    bw -= dx;
                    r.width -= dx;
                }
                else if (arrow.indexOf('right') > -1) {
                    bw += dx;
                    r.width += dx;
                }


                br.rect = r;
                br.matrix = matrix.appended(ma);
                block.matrix = blockMatrix.appended(ma);
                block.fixedHeight = bh;
                block.fixedWidth = bw;
                block.forceUpdate();
                self.view.forceUpdate();
                if (isEnd) {
                    block.onAction(ActionDirective.onResizeBlock, async () => {
                        if (!blockMatrix.equals(block.matrix)) block.updateMatrix(blockMatrix, block.matrix);
                        block.manualUpdateProps(
                            { fixedWidth: w, fixedHeight: h },
                            { fixedWidth: block.fixedWidth, fixedHeight: block.fixedHeight }
                        )
                    })
                }
                else {
                    block.fixedWidth = w;
                    block.fixedHeight = h;
                    block.matrix = blockMatrix;
                    br.matrix = matrix;
                    br.rect = r;
                }
            }
        });
    }
    onCreateBlockConnect(br: { block: Block, rect: Rect, matrix: Matrix }, arrow: string, event: React.MouseEvent) {
        MouseDragger({
            event,
            moveStart() { },
            move() { },
            moveEnd() { }
        });
    }
}