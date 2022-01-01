import { Kit } from "..";
import { getBoardTool } from "../../../extensions/board.tool";
import { util } from "../../../util/util";
import { Block } from "../../block";
import { BlockUrlConstant } from "../../block/constant";
import { MouseDragger } from "../../common/dragger";
import { Matrix } from "../../common/matrix";
import { ActionDirective } from "../../history/declare";
export class PageBoard {
    constructor(public kit: Kit) { }
    get page() {
        return this.kit.page;
    }
    async mousedown(block: Block | undefined, event: MouseEvent) {
        var self = this;
        var toolBoard = await getBoardTool();
        console.log(block, event);
        if (toolBoard.isSelector) {
            var fra: Block = block ? block.frameBlock : this.kit.page.getPageFrame();
            var re = fra.el.getBoundingClientRect();
            var url = toolBoard.currentSelector.url;
            console.log(url);
            if (url == '/note' || url == '/shape' || url == BlockUrlConstant.Frame) {
                await fra.onAction(ActionDirective.onBatchDragBlockDatas, async () => {
                    var data = toolBoard.currentSelector.data || {};
                    var ma = new Matrix();
                    ma.translate(event.clientX - re.left, event.clientY - re.top);
                    data.matrix = ma.getValues();
                    var newBlock = await this.kit.page.createBlock(toolBoard.currentSelector.url, data, fra);
                    toolBoard.clearSelector();
                    newBlock.mounted(() => {
                        this.mousedown(newBlock, event);
                    })
                });
            }
            else if (url == '/line') {
                var newBlock: Block;
                var isMounted: boolean = false;
                await fra.onAction(ActionDirective.onBatchDragBlockDatas, async () => {
                    var data = toolBoard.currentSelector.data || {};
                    var ma = new Matrix();
                    ma.translate(event.clientX - re.left, event.clientY - re.top);
                    data.matrix = ma.getValues();
                    data.from = { x: event.clientX, y: event.clientY };
                    data.to = util.clone(data.from);
                    newBlock = await this.kit.page.createBlock(toolBoard.currentSelector.url, data, fra);
                    toolBoard.clearSelector();
                    newBlock.mounted(() => {
                        isMounted = true;
                    })
                });
                MouseDragger({
                    event,
                    move: (ev, data) => {
                        if (newBlock) {
                            (newBlock as any).to = { x: ev.clientX, y: ev.clientY };
                            if (isMounted)
                                newBlock.forceUpdate();
                        }
                    },
                    moveEnd(ev, isMove, data) {
                        if (newBlock) {
                            (newBlock as any).to = { x: ev.clientX, y: ev.clientY };
                            newBlock.fixedWidth = ev.clientX - event.clientX;
                            newBlock.fixedHeight = ev.clientY - event.clientY;
                            if (isMounted)
                                newBlock.forceUpdate();
                        }
                    }
                })
            }
            else if (url == '/shape') {

            }
            else if (url == '/pen') {

            }
            else if (url == '/frame') {

            }
        }
        else {
            if (block) this.kit.picker.onPicker([block]);
            else this.kit.picker.onPicker([]);
            if (this.kit.picker.blockRanges.length > 0)
                MouseDragger({
                    event,
                    move: (ev, data) => {
                        var matrix = new Matrix();
                        matrix.translate(ev.clientX - event.clientX, ev.clientY - event.clientY)
                        self.kit.picker.onMove(matrix);
                    },
                    moveEnd(ev, isMove, data) {
                        var matrix = new Matrix();
                        matrix.translate(ev.clientX - event.clientX, ev.clientY - event.clientY)
                        self.kit.picker.onMoveEnd(matrix);
                    }
                })
        }
    }
}