import { Kit } from "..";
import { Block } from "../../block";
import { MouseDragger } from "../../common/dragger";
import { Point } from "../../common/vector/point";
import { onAutoScroll, onAutoScrollStop } from "../../common/scroll";
import { TextEle } from "../../common/text.ele";
import { PageLayoutType } from "../../layout/declare";
import { CreateBoardBlock, IsBoardTextAnchorBlock, SelectorBoardBlock } from "./board";
function triggerCreateAnchor(kit: Kit, block: Block, event: MouseEvent) {
    if (!block) return;
    if (!block.exists(g => g.isSupportAnchor, true)) return;
    var anchor = block.visibleAnchor(Point.from(event));
    if (!(anchor && anchor.block.isAllowMouseAnchor)) return;
    /**
    * shift连选
    */
    if (kit.page.keyboardPlate.isShift() && kit.explorer.hasAnchor) {
        if (anchor.isText && kit.page.isInlineAnchor(anchor, kit.explorer.activeAnchor))
            kit.explorer.onShiftFocusAnchor(anchor);
        else if (!anchor.equal(kit.explorer.activeAnchor)) {
            var blocks = kit.page.searchBlocksBetweenAnchor(kit.explorer.activeAnchor, anchor, { rowOrCol: true, lineBlock: true });
            if (Array.isArray(blocks) && blocks.length > 0) {
                kit.explorer.onSelectBlocks(blocks);
            }
            else kit.explorer.onFocusAnchor(anchor);
        }
        else kit.explorer.onFocusAnchor(anchor);
    }
    else {
        kit.explorer.onFocusAnchor(anchor);
    }
    return anchor;
}
function dblClick(kit: Kit, event: MouseEvent) {
    if (kit.explorer.isOnlyAnchor && kit.explorer.activeAnchor.isText && kit.mouse.lastMouseupDate && Date.now() - kit.mouse.lastMouseupDate < 700) {
        if (kit.mouse.lastMouseupEvent && Point.from(kit.mouse.lastMouseupEvent).nearBy(Point.from(event), 0)) {
            var block = kit.explorer.activeAnchor.block;
            var contentBlock = block.closest(x => !x.isLine);
            if (contentBlock && contentBlock.exists(g => g.appearAnchors.some(s => s.isText)), true) {
                var contentBlockRect = contentBlock.getVisibleContentBound();
                if (contentBlockRect.conatin(Point.from(event))) {
                    kit.explorer.onBlockTextRange(contentBlock);
                }
            }
        }
    }
    kit.mouse.lastMouseupEvent = event;
    kit.mouse.lastMouseupDate = Date.now();
}
async function createTailBlock(kit: Kit, event: MouseEvent) {
    if (kit.page.pageLayout.type != PageLayoutType.board) {
        var pageContentBound = TextEle.getContentBound(kit.page.contentEl);
        if (event.clientY > pageContentBound.y + pageContentBound.height && !kit.explorer.hasSelectionRange) {
            if (!(kit.explorer.activeAnchor?.block?.isPageLastBlock && kit.explorer.activeAnchor?.block?.isEmptyTextSpan)) {
                await kit.page.onCreateTailTextSpan();
            }
        }
    }
}
export async function mousedown(kit: Kit, event: MouseEvent) {
    event.preventDefault();
    onAutoScrollStop();
    var block = kit.page.getBlockInMouseRegion(event);
    var isBloard = kit.page.pageLayout.type != PageLayoutType.board ? false : true;
    if (!block && !isBloard) {
        block = kit.page.getPageEmptyAreaBlock(event);
    }
    if (block?.isLine) block = block.closest(x => !x.isLine);
    if ((await CreateBoardBlock(kit, block, event))) return;
    if (!IsBoardTextAnchorBlock(kit, block, event) && (await SelectorBoardBlock(kit, block, event))) return;

    var anchor = triggerCreateAnchor(kit, block, event);
    var downPoint = Point.from(event);
    if (!anchor) kit.explorer.onCancelSelection();
    MouseDragger({
        event,
        dis: 5,
        moveStart() {
            kit.selector.setStart(Point.from(event));
        },
        move(ev, data) {
            var movePoint = Point.from(ev)
            function cacSelector(dis: number) {
                var hasTextRange: boolean = false;
                if (anchor) {
                    var moveBlock = kit.page.getBlockFromPoint(movePoint);
                    if (moveBlock) {
                        var moveAnchor = moveBlock.visibleAnchor(movePoint);
                        if (moveAnchor && kit.page.isInlineAnchor(moveAnchor, anchor)) {
                            kit.explorer.onShiftFocusAnchor(moveAnchor);
                            hasTextRange = true;
                        }
                    }
                }
                if (!hasTextRange) {
                    downPoint.y -= dis;
                    kit.selector.setStart(downPoint);
                    kit.selector.setMove(movePoint);
                    var blocks = kit.page.searchBlocksBetweenMouseRect(downPoint, movePoint, { fromBlock: block, lineBlock: true });
                    if (Array.isArray(blocks) && blocks.length > 0) {
                        kit.explorer.onSelectBlocks(blocks);
                    }
                    else kit.explorer.onCancelSelection();
                }
                else kit.selector.close();
            };
            onAutoScroll({
                el: kit.page.root,
                point: movePoint,
                callback(fir, dis) {
                    if (fir) cacSelector(0)
                    else if (fir == false && dis != 0) cacSelector(dis);
                }
            })
        },
        async moveEnd(ev, isMove, data) {
            if (isMove) {
                onAutoScrollStop();
                kit.selector.close();
            }
            dblClick(kit, ev);
            await createTailBlock(kit, ev);
            if (kit.explorer.isOnlyAnchor) kit.textInput.onFocus();
            if (kit.explorer.hasTextRange) await kit.explorer.onOpenTextTool(event);
        }
    })
}




