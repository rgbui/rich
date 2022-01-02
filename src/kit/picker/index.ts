import { Kit } from "..";
import { Block } from "../../block";
import { Matrix } from "../../common/matrix";
import { Rect } from "../../common/point";
import { BlockPickerView } from "./view";

export class BlockPicker {
    kit: Kit;
    view: BlockPickerView;
    constructor(kit: Kit) {
        this.kit = kit;
    }
    visible: boolean = false;
    blockRanges: { block: Block, rect: Rect, matrix: Matrix }[] = [];
    onPicker(blocks: Block[]) {
        this.blockRanges = blocks.map(block => {
            return { block, rect: Rect.fromEle(block.el), matrix: block.globalWindowMatrix }
        });
        this.visible = true;
        this.view.forceUpdate();
    }
    onMove(matrix: Matrix) {
        this.blockRanges.forEach((bl) => {
            bl.block.moveMatrix = matrix;
            bl.matrix = bl.block.globalWindowMatrix.appended(matrix);
            bl.block.forceUpdate()
        });
        this.view.forceUpdate();
    }
    onMoveEnd(matrix: Matrix) {
        this.blockRanges.forEach((bl) => {
            bl.block.matrix.append(matrix);
            bl.block.moveMatrix = new Matrix();
            bl.matrix = bl.block.globalWindowMatrix;
            bl.block.forceUpdate()
        });
        this.view.forceUpdate();
    }
}