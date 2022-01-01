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
    blockRanges: { block: Block, rect: Rect }[] = [];
    onPicker(blocks: Block[]) {
        this.blockRanges = blocks.map(block => {
            return { block, rect: Rect.fromEle(block.el) }
        });
        this.visible = true;
        this.view.forceUpdate();
    }
    onMove(matrix: Matrix) {
        this.blockRanges.eachAsync(async (bl) => {
            bl.block.moveMatrix = matrix;
            bl.block.forceUpdate()
        })
    }
    onMoveEnd(matrix: Matrix) {
        this.blockRanges.eachAsync(async (bl) => {
            bl.block.matrix.append(matrix);
            bl.block.moveMatrix = new Matrix();
            bl.block.forceUpdate()
        })
    }
}