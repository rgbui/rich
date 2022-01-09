
import { Kit } from "..";
import { util } from "../../../util/util";
import { Block } from "../../block";
import { MouseDragger } from "../../common/dragger";
import { Matrix } from "../../common/matrix";
import { Point, PointArrow, Rect } from "../../common/vector/point";
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
    onMove(from: Point, to: Point) {
        this.blocks.forEach((bl) => {
            var matrix = new Matrix();
            matrix.translateMove(bl.globalWindowMatrix.inverseTransform(from), bl.globalWindowMatrix.inverseTransform(to))
            bl.moveMatrix = matrix;
            bl.forceUpdate()
        });
        this.view.forceUpdate();
    }
    onMoveEnd(from: Point, to: Point) {
        this.blocks.forEach((bl) => {
            var matrix = new Matrix();
            matrix.translateMove(bl.globalWindowMatrix.inverseTransform(from), bl.globalWindowMatrix.inverseTransform(to))
            bl.matrix.append(matrix);
            bl.moveMatrix = new Matrix();
            bl.forceUpdate()
        });
        this.view.forceUpdate();
    }
    onResizeBlock(block: Block,
        arrows: PointArrow[],
        event: React.MouseEvent) {
        event.stopPropagation();
        var matrix = block.matrix.clone();
        var gm = block.globalWindowMatrix.clone();
        var w = block.fixedWidth;
        var h = block.fixedHeight;
        var self = this;
        var fp = gm.inverseTransform(Point.from(event));
        var s = gm.getScaling().x;
        var minW = 50 / s;
        var minH = 50 / s;
        MouseDragger({
            event,
            moving(ev, data, isEnd) {
                var tp = gm.inverseTransform(Point.from(ev));
                var ma = new Matrix();
                var [dx, dy] = tp.diff(fp);
                var bw = w;
                var bh = h;
                if (arrows.includes(PointArrow.top)) {
                    if (bh - dy < minH) dy = bh - minH;
                }
                else if (arrows.includes(PointArrow.bottom)) {
                    if (bh + dy < minH) dy = minH - bh;
                }
                if (arrows.includes(PointArrow.left)) {
                    if (bw - dx < minW) dx = bw - minW;
                }
                else if (arrows.includes(PointArrow.right)) {
                    if (bw + dx < minW) dx = minW - bw;
                }
                if (arrows.includes(PointArrow.top)) {
                    ma.translate(0, dy);
                    bh -= dy;
                }
                else if (arrows.includes(PointArrow.bottom)) {
                    bh += dy;
                }
                if (arrows.includes(PointArrow.left)) {

                    ma.translate(dx, 0);
                    bw -= dx;
                }
                else if (arrows.includes(PointArrow.right)) {
                    bw += dx;
                }
                block.matrix = matrix.appended(ma);
                block.fixedHeight = bh;
                block.fixedWidth = bw;
                block.forceUpdate();
                self.view.forceUpdate();
                if (isEnd) {
                    block.onAction(ActionDirective.onResizeBlock, async () => {
                        if (!matrix.equals(block.matrix)) block.updateMatrix(matrix, block.matrix);
                        block.manualUpdateProps(
                            { fixedWidth: w, fixedHeight: h },
                            { fixedWidth: block.fixedWidth, fixedHeight: block.fixedHeight }
                        )
                    })
                }
            }
        });
    }
    async onCreateBlockConnect(block: Block, arrows: PointArrow[], event: React.MouseEvent) {
        event.stopPropagation();
        var fra: Block = block ? block.frameBlock : this.kit.page.getPageFrame();
        var newBlock: Block;
        var isMounted: boolean = false;
        var gm = fra.globalWindowMatrix;

        // await fra.onAction(ActionDirective.onBoardToolCreateBlock, async () => {
        //     var data = { url: '/line' } as Record<string, any>;
        //     var ma = new Matrix();
        //     ma.translate(ev.clientX - re.left, ev.clientY - re.top);
        //     data.matrix = ma.getValues();
        //     data.from = { x: event.clientX, y: event.clientY, blockId: block.id };
        //     data.to = util.clone(data.from);
        //     newBlock = await this.kit.page.createBlock(data.url, data, fra);
        //     newBlock.mounted(() => {
        //         isMounted = true;
        //     })
        // });
        // MouseDragger({
        //     event,
        //     moveStart() { },
        //     move() { },
        //     moveEnd() { }
        // });
    }
}