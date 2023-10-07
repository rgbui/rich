import { Kit } from "../..";
import { useBoardEditTool } from "../../../../extensions/board.edit.tool";
import { Block } from "../../../block";
import { Matrix } from "../../../common/matrix";
import { Point } from "../../../common/vector/point";
import { ActionDirective } from "../../../history/declare";
export async function openBoardEditTool(kit: Kit) {
    if (kit.picker.blocks.length > 0) {
        while (true) {
            var r = await useBoardEditTool(kit.picker.blocks);
            if (r) {
                if (r.name && r.name.indexOf("grid-") > -1) {
                    await onGridAlign(kit, kit.picker.blocks, r.name, r.value);
                }
                else {
                    await kit.page.onAction(ActionDirective.onBoardEditProp, async () => {
                        await kit.picker.blocks.eachAsync(async (block) => {
                            if (r.name)
                                await block.setBoardEditCommand(r.name, r.value);
                            else for (let n in r) {
                                await block.setBoardEditCommand(n, r[n]);
                            }
                        })
                    });
                }
                kit.picker.onRePicker();
            } else break;
        }
    }
}

export async function onGridAlign(kit: Kit, blocks: Block[], command: string, value: string) {
    await kit.page.onAction('onGridAlign', async () => {
        if (command == 'grid-align') {
            var b = blocks.first().getVisibleBound();
            for (let i = 1; i < blocks.length; i++) {
                var block = blocks[i]
                var cb = block.getVisibleBound();
                var gm = block.globalWindowMatrix;
                var from: Point;
                var to: Point;
                if (value == 'left') {
                    from = gm.inverseTransform(cb.leftTop);
                    to = gm.inverseTransform(b.leftTop.setY(cb.top));
                }
                else if (value == 'center') {
                    from = gm.inverseTransform(cb.topCenter);
                    to = gm.inverseTransform(b.topCenter.setY(cb.top));
                }
                else if (value == 'right') {
                    from = gm.inverseTransform(cb.rightTop);
                    to = gm.inverseTransform(b.rightTop.setY(cb.top));
                }
                var moveMatrix = new Matrix();
                moveMatrix.translateMove(from, to)
                var newMatrix = block.currentMatrix.clone();
                newMatrix.append(moveMatrix);
                newMatrix.append(block.selfMatrix.inverted());
                await block.updateMatrix(block.matrix, newMatrix);
                block.moveMatrix = new Matrix();
            }
        }
        else if (command == 'grid-valign') {
            var b = blocks.first().getVisibleBound();
            for (let i = 1; i < blocks.length; i++) {
                var block = blocks[i]
                var cb = block.getVisibleBound();
                var gm = block.globalWindowMatrix;
                var from: Point;
                var to: Point;
                if (value == 'top') {
                    from = gm.inverseTransform(cb.leftTop);
                    to = gm.inverseTransform(b.leftTop.setX(cb.left));
                }
                else if (value == 'middle') {
                    from = gm.inverseTransform(cb.topCenter);
                    to = gm.inverseTransform(b.topCenter.setX(cb.left));
                }
                else if (value == 'bottom') {
                    from = gm.inverseTransform(cb.leftBottom);
                    to = gm.inverseTransform(b.leftBottom.setX(cb.left));
                }
                var moveMatrix = new Matrix();
                moveMatrix.translateMove(from, to)
                var newMatrix = block.currentMatrix.clone();
                newMatrix.append(moveMatrix);
                newMatrix.append(block.selfMatrix.inverted());
                await block.updateMatrix(block.matrix, newMatrix);
                block.moveMatrix = new Matrix();
            }
        }
        else if (command == 'grid-distribute') {
            if (value == 'y') {
                var first = blocks.first().getVisibleBound();
                var second = blocks[1].getVisibleBound();
                var d = second.top - first.bottom;
                var h = first.height + d + second.height;
                for (let i = 2; i < blocks.length; i++) {
                    var block = blocks[i];
                    var cb = block.getVisibleBound();
                    var gm = block.globalWindowMatrix;
                    var cb = block.getVisibleBound();
                    var gm = block.globalWindowMatrix;
                    var from: Point;
                    var to: Point;
                    from = gm.inverseTransform(cb.leftTop);
                    to = gm.inverseTransform(cb.leftTop.setY(h + d));
                    var moveMatrix = new Matrix();
                    moveMatrix.translateMove(from, to)
                    var newMatrix = block.currentMatrix.clone();
                    newMatrix.append(moveMatrix);
                    newMatrix.append(block.selfMatrix.inverted());
                    await block.updateMatrix(block.matrix, newMatrix);
                    block.moveMatrix = new Matrix();
                    h += d;
                    h += cb.height;
                }
            }
            else if (value == 'x') {
                var first = blocks.first().getVisibleBound();
                var second = blocks[1].getVisibleBound();
                var d = second.left - first.left;
                var h = first.width + d + second.width;
                for (let i = 2; i < blocks.length; i++) {
                    var block = blocks[i];
                    var cb = block.getVisibleBound();
                    var gm = block.globalWindowMatrix;
                    var cb = block.getVisibleBound();
                    var gm = block.globalWindowMatrix;
                    var from: Point;
                    var to: Point;
                    from = gm.inverseTransform(cb.leftTop);
                    to = gm.inverseTransform(cb.leftTop.setX(h + d));
                    var moveMatrix = new Matrix();
                    moveMatrix.translateMove(from, to)
                    var newMatrix = block.currentMatrix.clone();
                    newMatrix.append(moveMatrix);
                    newMatrix.append(block.selfMatrix.inverted());
                    await block.updateMatrix(block.matrix, newMatrix);
                    block.moveMatrix = new Matrix();
                    h += d;
                    h += cb.width;
                }
            }
        }
    });
}