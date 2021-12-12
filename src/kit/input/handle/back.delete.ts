import { TextInput } from "..";
import { dom } from "../../../common/dom";
import { KeyboardCode } from "../../../common/keys";
import { Point } from "../../../common/point";
import { Exception, ExceptionType } from "../../../error/exception";
import { Anchor } from "../../selection/anchor";
import { InputDeleteStore } from "../store";
export async function backspaceDeleteHandle(tp: TextInput) {
    var anchor = tp.explorer.activeAnchor;
    anchor.inputting();
    if (await backspaceSolidBlock(tp)) return;
    else if (await backspaceCrossBlock(tp)) return;
    else if (await backspaceBlock(tp)) return;
}
export async function backspaceSolidBlock(tp: TextInput) {
    var anchor = tp.explorer.activeAnchor;
    if (anchor.isSolid) {
        var block = anchor.block;
        tp.kit.explorer.onCursorMove(KeyboardCode.ArrowLeft);
        tp.onStartInput(tp.explorer.activeAnchor);
        await block.onDelete()
        return true;
    }
}
export async function backspaceCrossBlock(tp: TextInput) {
    var anchor = tp.explorer.activeAnchor;
    if (anchor.isText && anchor.at == 0) {
        var block = anchor.block;
        var prevAnchor = anchor.prevAnchor;
        if (prevAnchor) {
            if (tp.kit.page.textAnchorIsAdjoin(anchor, prevAnchor)) {
                tp.explorer.onFocusAnchor(prevAnchor);
                tp.onStartInput(tp.explorer.activeAnchor);
                await backspaceDeleteHandle(tp);
            }
            else {
                var rowBlock = block.closest(x => x.isBlock);
                if (rowBlock.isBackspaceAutomaticallyTurnText) {
                    await tp.kit.page.onBackTurn(rowBlock, (newBlock) => {
                        tp.explorer.onFocusAnchor(newBlock.visibleHeadAnchor)
                    });
                }
                else {
                    tp.kit.explorer.onCursorMove(KeyboardCode.ArrowLeft)
                    if (rowBlock.isCanAutomaticallyDeleted) await rowBlock.onDelete()
                    else {
                        /**
                         * 这里判断是否为跨行
                         * 如果跨行，那么此时block所在的行的内容是否合并到新行中
                         ***/
                        var preBlock = prevAnchor.block.closest(x => x.isBlock);
                        if (preBlock && rowBlock.isLikeTextSpan && preBlock.isLikeTextSpan) {
                            //这里合并文本
                            var oldAnchorPos = tp.kit.explorer.activeAnchor.bound;
                            await tp.kit.page.onCombineLikeTextSpan(preBlock, rowBlock, async () => {
                                tp.kit.page.addUpdateEvent(async () => {
                                    var newAnchor = preBlock.visibleAnchor(Point.from(oldAnchorPos));
                                    tp.kit.explorer.onFocusAnchor(newAnchor);
                                })
                            });
                        }
                    }
                }
            }
        }
        else {
            /**
             * 此时光标无法再回退了
             * 这应该是文档的第一行首位元素
             */
            tp.page.onBackspaceToTopPage();
        }
        return true;
    }
}
export async function backspaceBlock(tp: TextInput) {
    var anchor = tp.explorer.activeAnchor;
    if (anchor.isText && anchor.at > 0) {
        var block = anchor.block;
        var dm = dom(anchor.view);
        var textNode = dm.prevFind(g => {
            if (g instanceof Text) return true;
            else return false;
        }) as Text;
        if (textNode) {
            var value = textNode.textContent;
            tp.deleteInputText = value.slice(value.length - 1) + tp.deleteInputText;
            textNode.textContent = value.slice(0, value.length - 1);
            anchor.at -= 1;
            if (textNode.textContent.length == 0) {
                dom(textNode).removeEmptyNode();
            }
            var action: () => Promise<void>;
            if (anchor.at == 0) {
                action = async () => {
                    var existsDelete: boolean = false;
                    if (anchor.block.isLine) {
                        var newAnchor: Anchor = anchor.prevAnchor;
                        if (newAnchor && newAnchor.block.isLine && tp.page.isInlineAnchor(anchor.prevAnchor, anchor)) {
                            if (block.isTextContentBlockEmpty) {
                                await block.delete();
                                existsDelete = true;
                            }
                            tp.explorer.onFocusAnchor(newAnchor);
                        }
                        else if (block.isTextContentBlockEmpty) {
                            var rowBlock = block.closest(x => x.isBlock);
                            await block.delete();
                            existsDelete = true;
                            tp.explorer.onFocusAnchor(rowBlock.visibleHeadAnchor);
                        }
                    }
                    var checkEmpty = () => {
                        var currentAnchor = tp.explorer.activeAnchor;
                        if (currentAnchor) {
                            if (anchor.block != currentAnchor.block) {
                                tp.explorer.onFocusAnchor(currentAnchor);
                            }
                            if (currentAnchor.at == 0 && currentAnchor.elementAppear.isEmpty) currentAnchor.setEmpty();
                            else currentAnchor.removeEmpty();
                        }
                    }
                    if (existsDelete == true) tp.page.addUpdateEvent(async () => {
                        checkEmpty();
                    })
                    else checkEmpty();
                }
            }
            await InputDeleteStore(block, anchor.elementAppear, tp.cursorStartAt, tp.deleteInputText, anchor.at == 0 ? true : false, action);
            tp.followAnchor(tp.explorer.activeAnchor);
        } else throw new Exception(ExceptionType.notFoundTextEle);
        return true;
    }
}