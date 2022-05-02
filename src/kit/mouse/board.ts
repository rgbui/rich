
// import { Kit } from "..";
// import { Pen } from "../../../blocks/board/pen";
// import { forceCloseBoardEditTool, useBoardEditTool } from "../../../extensions/board.edit.tool";
// import { getBoardTool } from "../../../extensions/board.tool";

// import { util } from "../../../util/util";
// import { Block } from "../../block";
// import { BlockUrlConstant } from "../../block/constant";
// import { MouseDragger } from "../../common/dragger";
// import { Matrix } from "../../common/matrix";
// import { Point } from "../../common/vector/point";
// import { Polygon } from "../../common/vector/polygon";
// import { ActionDirective } from "../../history/declare";
// import { PageLayoutType } from "../../page/declare";
// import { loadPaper } from "../../paper";


// export async function useBoardTool(kit: Kit) {
//     while (true) {
//         var r = await useBoardEditTool(kit.picker.blocks);
//         if (r) {
//             await kit.page.onAction(ActionDirective.onBoardEditProp, async () => {
//                 await kit.picker.blocks.eachAsync(async (block) => {
//                     if (r.name)
//                         await block.setBoardEditCommand(r.name, r.value);
//                     else for (let n in r) {
//                         await block.setBoardEditCommand(n, r[n]);
//                     }
//                 })
//             });
//             kit.picker.onRePicker();
//         } else break;
//     }
// }
// export function SelectorBoardBlock(kit: Kit, block: Block | undefined, event: MouseEvent) {
//     var isBoardSelector = false;
//     if (block?.isFreeBlock) {
//         isBoardSelector = true;
//         var isPicker: boolean = false;
//         if (kit.page.keyboardPlate.isShift()) {
//             //连选
//             kit.picker.onShiftPicker([block]);
//             kit.explorer.onClearAnchorAndSelection();
//         }
//         else {
//             //不连选
//             if (kit.picker.blocks.some(s => s === block)) {
//                 //说明包含
//                 isPicker = true;
//             }
//             else {
//                 //说明不包含
//                 kit.picker.onPicker([block]);
//                 kit.explorer.onClearAnchorAndSelection();
//             }
//         }
//         forceCloseBoardEditTool();
//         MouseDragger({
//             event,
//             move(ev, data) {
//                 kit.picker.onMove(Point.from(event), Point.from(ev));
//             },
//             async moveEnd(ev, isMove, data) {
//                 if (isMove) kit.picker.onMoveEnd(Point.from(event), Point.from(ev));
//                 if (!isMove) {
//                     if (ev.button == 2) {
//                         if (kit.picker.blocks.length > 1) {
//                             kit.page.onOpenMenu(kit.picker.blocks, ev);
//                         }
//                         else {
//                             kit.picker.blocks[0].onContextmenu(ev);
//                         }
//                         return;
//                     }
//                     else {
//                         if (isPicker && kit.picker.blocks.length == 1) {
//                             //这里对block进入聚焦编辑
//                             // var block = kit.picker.blocks[0];
//                             // var anchor = block.visibleAnchor(Point.from(event));
//                             // if (!(anchor && anchor.block.isAllowMouseAnchor)) return;
//                             // kit.explorer.onFocusAnchor(anchor);
//                             return;
//                         }
//                     }
//                 }
//                 await useBoardTool(kit);
//             }
//         })
//     }
//     else if (!block && kit.page.pageLayout.type == PageLayoutType.board) {
//         if (!kit.page.keyboardPlate.isShift()) kit.picker.onPicker([]);
//         isBoardSelector = true;
//         kit.explorer.onClearAnchorAndSelection();
//         var isShift = kit.explorer.page.keyboardPlate.isShift();
//         var ma = kit.page.matrix.clone();
//         var gm = kit.page.globalMatrix.clone();
//         var fromP = gm.inverseTransform(Point.from(event));
//         forceCloseBoardEditTool()
//         MouseDragger({
//             event,
//             moveStart() {
//                 if (isShift) kit.selector.setStart(Point.from(event));
//             },
//             move(ev, data) {
//                 if (isShift) {
//                     kit.selector.setMove(Point.from(ev));
//                     /**
//                      * 这里通过选区来计算之间的经过的块
//                      */
//                     var bs = kit.page.searchBoardBetweenRect(event, ev);
//                     bs.removeAll(g => !g.isFreeBlock);
//                     kit.picker.onPicker(bs);
//                 }
//                 else {
//                     var na = ma.clone();
//                     var toP = gm.inverseTransform(Point.from(ev));
//                     na.translateMove(fromP, toP);
//                     kit.page.onSetMatrix(na);
//                 }
//             },
//             moveEnd(ev, isMove, data) {
//                 if (isMove) {
//                     kit.selector.close()
//                 }
//                 else {
//                     if (ev.button == 2) {
//                         kit.page.onContextMenu(ev);
//                     }
//                 }
//             }
//         })
//     }
//     return isBoardSelector;
// }


// export async function CreateBoardBlock(kit: Kit, block: Block | undefined, event: MouseEvent) {
//     var toolBoard = await getBoardTool();
//     if (toolBoard.isSelector) {
//         var paper = await loadPaper();
//         var fra: Block = block ? block.frameBlock : kit.page.getPageFrame();
//         var gm = fra.globalWindowMatrix;
//         var re = gm.inverseTransform(Point.from(event));
//         var url = toolBoard.currentSelector.url;
//         if (url == '/note' || url == '/flow/mind' || url == BlockUrlConstant.TextSpan || url == BlockUrlConstant.Frame) {
//             await fra.onAction(ActionDirective.onBoardToolCreateBlock, async () => {
//                 var data = toolBoard.currentSelector.data || {};
//                 var ma = new Matrix();
//                 ma.translate(re.x, re.y);
//                 data.matrix = ma.getValues();
//                 var newBlock = await kit.page.createBlock(toolBoard.currentSelector.url, data, fra);
//                 toolBoard.clearSelector();
//                 newBlock.mounted(() => {
//                     if (url == BlockUrlConstant.Frame) {
//                         kit.picker.onPicker([newBlock]);
//                     }
//                     else {
//                         kit.picker.onPicker([newBlock]);
//                         //kit.explorer.onFocusBlockAtAnchor(newBlock);
//                     }
//                 })
//             });
//         }
//         else if (url == '/line') {
//             var newBlock: Block;
//             var isMounted: boolean = false;
//             await fra.onAction(ActionDirective.onBoardToolCreateBlock, async () => {
//                 var data = toolBoard.currentSelector.data || {};
//                 data.from = { x: re.x, y: re.y };
//                 data.to = util.clone(data.from);
//                 newBlock = await kit.page.createBlock(toolBoard.currentSelector.url, data, fra);
//                 newBlock.mounted(() => {
//                     isMounted = true;
//                 })
//             });
//             MouseDragger({
//                 event,
//                 moveStart() {
//                     kit.boardLine.onStartConnectOther();
//                     if (newBlock) kit.boardLine.line = newBlock;
//                 },
//                 move(ev, data) {
//                     if (newBlock) {
//                         kit.boardLine.line = newBlock;
//                         var tr = gm.inverseTransform(Point.from(ev));
//                         (newBlock as any).to = { x: tr.x, y: tr.y };
//                         if (isMounted) newBlock.forceUpdate();
//                     }
//                 },
//                 async moveEnd(ev, isMove, data) {
//                     if (newBlock) {
//                         if (kit.boardLine.over) {
//                             (newBlock as any).to = {
//                                 blockId: kit.boardLine.over.block.id,
//                                 x: kit.boardLine.over.selector.arrows[1],
//                                 y: kit.boardLine.over.selector.arrows[0]
//                             };
//                             kit.boardLine.over.block.conectLine(newBlock);
//                         }
//                         else {
//                             var tr = gm.inverseTransform(Point.from(ev));
//                             (newBlock as any).to = { x: tr.x, y: tr.y };
//                         }
//                         if (isMounted) newBlock.forceUpdate();
//                         kit.picker.onPicker([newBlock]);
//                     }
//                     kit.boardLine.onEndConnectOther();
//                     toolBoard.clearSelector();
//                 }
//             })
//         }
//         else if (url == '/shape') {
//             var newBlock: Block;
//             var isMounted: boolean = false;
//             await fra.onAction(ActionDirective.onBoardToolCreateBlock, async () => {
//                 var data = toolBoard.currentSelector.data || {};
//                 var ma = new Matrix();
//                 ma.translate(re.x, re.y);
//                 data.matrix = ma.getValues();
//                 newBlock = await kit.page.createBlock(toolBoard.currentSelector.url, data, fra);
//                 newBlock.fixedWidth = 0;
//                 newBlock.fixedHeight = 0;
//                 toolBoard.clearSelector();
//                 newBlock.mounted(() => {
//                     isMounted = true;
//                 })
//             });
//             MouseDragger({
//                 event,
//                 move: (ev, data) => {
//                     if (newBlock) {
//                         var tr = gm.inverseTransform(Point.from(ev));
//                         var ma = new Matrix();
//                         ma.translate(Math.min(re.x, tr.x), Math.min(re.y, tr.y));
//                         newBlock.matrix = ma;
//                         newBlock.fixedWidth = Math.abs(tr.x - re.x);
//                         newBlock.fixedHeight = Math.abs(tr.y - re.y);
//                         if (isMounted) newBlock.forceUpdate();
//                     }
//                 },
//                 moveEnd(ev, isMove, data) {
//                     if (newBlock) {
//                         var tr = gm.inverseTransform(Point.from(ev));
//                         var ma = new Matrix();
//                         ma.translate(Math.min(re.x, tr.x), Math.min(re.y, tr.y));
//                         newBlock.matrix = ma;
//                         newBlock.fixedWidth = Math.abs(tr.x - re.x) || 200;
//                         newBlock.fixedHeight = Math.abs(tr.y - re.y) || 200;
//                         if (isMounted) newBlock.forceUpdate();
//                         kit.picker.onPicker([newBlock]);
//                        // kit.explorer.onFocusBlockAtAnchor(newBlock);
//                     }
//                     toolBoard.clearSelector();
//                 }
//             })
//         }
//         else if (url == '/pen') {
//             var newBlock: Block;
//             var isMounted: boolean = false;
//             var path: paper.Path;
//             var points: { x: number, y: number }[] = [];
//             await fra.onAction(ActionDirective.onBoardToolCreateBlock, async () => {
//                 var data = toolBoard.currentSelector.data || {};
//                 newBlock = await kit.page.createBlock(toolBoard.currentSelector.url, data, fra);
//                 points.push(re);
//                 path = new paper.Path({ segments: [{ x: re.x, y: re.y }] });
//                 newBlock.fixedWidth = 0;
//                 newBlock.fixedHeight = 0;
//                 newBlock.mounted(() => {
//                     isMounted = true;
//                 })
//             });
//             MouseDragger({
//                 event,
//                 move(ev, data) {
//                     if (newBlock) {
//                         var tr = gm.inverseTransform(Point.from(ev));
//                         path.add([tr.x, tr.y]);
//                         var ma = new Matrix();
//                         points.push(tr);
//                         var poly = new Polygon(...points);
//                         var bound = poly.bound;
//                         ma.translate(bound.x, bound.y);
//                         newBlock.matrix = ma;
//                         newBlock.fixedWidth = Math.abs(bound.width);
//                         newBlock.fixedHeight = Math.abs(bound.height);
//                         (newBlock as any).pathString = poly.relative(bound.leftTop).pathString(false);
//                         if (isMounted) newBlock.forceUpdate();
//                     }
//                 },
//                 moveEnd(ev, isMove, data) {
//                     if (newBlock) {
//                         path.simplify(100);
//                         var bound = path.bounds;
//                         path.translate(new paper.Point(0 - bound.left, 0 - bound.top))
//                         var ma = new Matrix();
//                         ma.translate(bound.left, bound.top);
//                         newBlock.matrix = ma;
//                         newBlock.fixedWidth = bound.width;
//                         newBlock.fixedHeight = bound.height;
//                         (newBlock as Pen).viewBox = `0 0 ${bound.width} ${bound.height}`;
//                         (newBlock as any).pathString = path.pathData;
//                         path.remove();
//                         if (isMounted) newBlock.forceUpdate();
//                         kit.picker.onPicker([newBlock]);
//                     }
//                     toolBoard.clearSelector();

//                 }
//             })
//         }
//         return true;
//     }
//     return false;
// }
// export function IsBoardTextAnchorBlock(kit: Kit, block: Block | undefined, event: MouseEvent) {
//     if (kit.explorer.hasAnchor && kit.explorer.activeAnchor.isText && kit.picker.blocks.length > 0) {
//         var fb = kit.picker.blocks[0];
//         if (block && fb && fb.exists(g => g == block, true) && block?.exists(g => g == kit.explorer.activeAnchor?.block, true)) {
//             return true;
//         }
//     }
//     return false;
// }