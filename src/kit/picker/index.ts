
import { Kit } from "..";
import { Block } from "../../block";
import { MouseDragger } from "../../common/dragger";
import { Matrix } from "../../common/matrix";
import { PointArrow, Rect } from "../../common/vector/point";
import { ActionDirective } from "../../history/declare";
import { BlockPickerView } from "./view";

export class BlockPicker {
    kit: Kit;
    view: BlockPickerView;
    constructor(kit: Kit) {
        this.kit = kit;
    }
    visible: boolean = false;
    blocks: Block[] = [];
    onPicker(blocks: Block[]) {
        this.blocks = blocks;
        this.visible = true;
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
        this.view.forceUpdate();
    }
    onMove(matrix: Matrix) {
        this.blocks.forEach((bl) => {
            // bl.block.moveMatrix = matrix;
            // bl.matrix = bl.block.globalWindowMatrix.appended(matrix);
            // bl.block.forceUpdate()
        });
        this.view.forceUpdate();
    }
    onMoveEnd(matrix: Matrix) {
        this.blocks.forEach((bl) => {
            // bl.block.matrix.append(matrix);
            // bl.block.moveMatrix = new Matrix();
            // bl.matrix = bl.block.globalWindowMatrix;
            // bl.block.forceUpdate()
        });
        this.view.forceUpdate();
    }
    onResizeBlock(block: Block,
        arrows: PointArrow[],
        event: React.MouseEvent) {
        // var matrix = br.matrix.clone();
        // var blockMatrix = br.block.matrix;
        // var block = br.block;
        // var w = block.fixedWidth;
        // var h = block.fixedHeight;
        // var self = this;
        // var rect = br.rect.clone();
        // MouseDragger({
        //     event,
        //     moving(ev, data, isEnd) {
        //         var r = rect.clone();
        //         var ma = new Matrix();
        //         var dx = ev.clientX - event.clientX;
        //         var dy = ev.clientY - event.clientY;
        //         var bw = w;
        //         var bh = h;
        //         var minW = 50;
        //         var minH = 50;
        //         if (arrows.includes(PointArrow.top)) {
        //             if (bh - dy < minH) dy = bh - minH;
        //         }
        //         else if (arrows.includes(PointArrow.bottom)) {
        //             if (bh + dy < minH) dy = minH - bh;
        //         }
        //         if (arrows.includes(PointArrow.left)) {
        //             if (bw - dx < minW) dx = bw - minW;
        //         }
        //         else if (arrows.includes(PointArrow.right)) {
        //             if (bw + dx < minW) dx = minW - bw;
        //         }
        //         if (arrows.includes(PointArrow.top)) {
        //             r.top += dy;
        //             ma.translate(0, dy);
        //             bh -= dy;
        //             r.height -= dy;
        //         }
        //         else if (arrows.includes(PointArrow.bottom)) {
        //             bh += dy;
        //             r.height += dy;
        //         }
        //         if (arrows.includes(PointArrow.left)) {
        //             r.left += dx;
        //             ma.translate(dx, 0);
        //             bw -= dx;
        //             r.width -= dx;
        //         }
        //         else if (arrows.includes(PointArrow.right)) {
        //             bw += dx;
        //             r.width += dx;
        //         }
        //         br.rect = r;
        //         br.matrix = matrix.appended(ma);
        //         block.matrix = blockMatrix.appended(ma);
        //         block.fixedHeight = bh;
        //         block.fixedWidth = bw;
        //         block.forceUpdate();
        //         self.view.forceUpdate();
        //         if (isEnd) {
        //             block.onAction(ActionDirective.onResizeBlock, async () => {
        //                 if (!blockMatrix.equals(block.matrix)) block.updateMatrix(blockMatrix, block.matrix);
        //                 block.manualUpdateProps(
        //                     { fixedWidth: w, fixedHeight: h },
        //                     { fixedWidth: block.fixedWidth, fixedHeight: block.fixedHeight }
        //                 )
        //             })
        //         }
        //         else {
        //             block.fixedWidth = w;
        //             block.fixedHeight = h;
        //             block.matrix = blockMatrix;
        //             br.matrix = matrix;
        //             br.rect = r;
        //         }
        //     }
        // });
    }
    onCreateBlockConnect(block: Block, arrows: PointArrow[], event: React.MouseEvent) {
        MouseDragger({
            event,
            moveStart() { },
            move() { },
            moveEnd() { }
        });
    }
}