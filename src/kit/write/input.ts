import { PageWrite } from ".";
import { useAtSelector } from "../../../extensions/at";
import { useBlockSelector } from "../../../extensions/block";
import { InputTextPopSelectorType } from "../../../extensions/common/input.pop";
import { InputDetector } from "../../../extensions/input.detector/detector";
import { DetectorOperator } from "../../../extensions/input.detector/rules";
import { usePageLinkSelector } from "../../../extensions/link/page";
import { AppearAnchor } from "../../block/appear";
import { AppearVisibleCursorPoint } from "../../block/appear/visible.seek";
import { ActionDirective } from "../../history/declare";
import { InputStore } from "./store";

async function inputPopCallback(write: PageWrite, ...args: any) {
    var blockData = args[0];
    var sel = window.getSelection();
    var offset = sel.focusOffset;
    var content = write.inputPop.aa.textContent;
    var textContent = content.slice(0, write.inputPop.offset) + content.slice(offset);
    write.inputPop.aa.textNode.textContent = textContent;
    await write.onInputPopCreateBlock(write.inputPop.offset, blockData);
    write.inputPop = null;
}

/**
 * 输入弹窗
 */
export async function inputPop(write: PageWrite, aa: AppearAnchor, event: React.FormEvent) {
    var ev = event.nativeEvent as InputEvent;
    var sel = window.getSelection();
    var offset = sel.focusOffset;
    if (!write.inputPop) {
        var data = ev.data;
        var textContent = aa.textContent;
        var data2 = textContent.slice(offset - 1, offset + 1);
        if (data == '/' || data == '、') {
            write.inputPop = {
                rect: AppearVisibleCursorPoint(aa),
                type: InputTextPopSelectorType.BlockSelector,
                offset: offset - 1,
                aa,
                selector: (await useBlockSelector())
            };
        }
        else if (data == '@') {
            write.inputPop = {
                rect: AppearVisibleCursorPoint(aa),
                type: InputTextPopSelectorType.AtSelector,
                offset: offset - 1,
                aa,
                selector: (await useAtSelector())
            };
        }
        else if (data2 == '[[' || data2 == '【【') {
            write.inputPop = {
                rect: AppearVisibleCursorPoint(aa),
                type: InputTextPopSelectorType.LinkeSelector,
                offset: offset - 2,
                aa,
                selector: (await usePageLinkSelector())
            };
        }
        // else if(data2=='{{'){

        // }
        // else if(data2=='(('){

        // }
        // else if(data=='#'){

        // }
    }
    if (write.inputPop) {
        var popVisible = await write.inputPop.selector.open(write.inputPop.rect, aa.textContent.slice(write.inputPop.offset, offset), (...data) => {
            inputPopCallback(write, ...data);
        });
        console.log(write.inputPop.rect, aa.textContent, offset, aa.textContent.slice(write.inputPop.offset, offset), popVisible);
        if (!popVisible) write.inputPop = null;
        else return true;
    }
    return false;
}
/**
 * 对输入的内容进行检测
 * @returns 
 */
export async function inputDetector(write: PageWrite, aa: AppearAnchor, event: React.FormEvent) {
    var sel = window.getSelection();
    var offset = sel.focusOffset;
    var rest = aa.textContent.slice(offset);
    var mr = InputDetector(aa.textContent.slice(0, offset), { rowStart: aa.isRowStart });
    if (mr) {
        var rule = mr.rule;
        switch (rule.operator) {
            case DetectorOperator.firstLetterCreateBlock:
                write.kit.page.onAction(ActionDirective.onInputDetector, async () => {
                    var row = aa.block.closest(x => !x.isLine);
                    var newBlock = await row.visibleUpCreateBlock(rule.url, { createSource: 'InputBlockSelector' })
                    newBlock.mounted(() => {
                        write.onFocusBlockAnchor(newBlock, { last: true });
                    });
                });
                break;
            case DetectorOperator.firstLetterTurnBlock:
                write.kit.page.onAction(ActionDirective.onInputDetector, async () => {
                    var row = aa.block.closest(x => !x.isLine);
                    var newBlock = await row.turn(rule.url);
                    newBlock.mounted(() => {
                        write.onFocusBlockAnchor(newBlock, { last: true });
                    });
                });
                break;
            case DetectorOperator.inputCharReplace:
                var content = aa.textContent.slice(0, offset - mr.matchValue.length) + mr.value + aa.textContent.slice(offset);
                aa.textNode.textContent = content;
                var newOffset = offset - mr.matchValue.length + mr.value.length;
                sel.setPosition(aa.textNode, newOffset);
                await InputStore(aa, content, write.startAnchorText);
                break;
            case DetectorOperator.letterReplaceCreateBlock:
                var content = aa.textContent.slice(0, offset - mr.matchValue.length) + mr.value + aa.textContent.slice(offset);
                aa.textNode.textContent = content;
                var newOffset = offset - mr.matchValue.length + mr.value.length;
                sel.setPosition(aa.textNode, newOffset);
                await InputStore(aa, content, write.startAnchorText, true, async () => {
                    var newBlock = await aa.block.visibleRightCreateBlock(newOffset, rule.url, { content: mr.matchValue })
                    if (rule.style) newBlock.pattern.setStyles(rule.style)
                    newBlock.mounted(() => {
                        write.onFocusBlockAnchor(newBlock, { last: true });
                    });
                });
                break;
        }
        return true;
    }
    return false;
}
export async function inputLineTail(write: PageWrite, aa: AppearAnchor, event: React.FormEvent) {
    return false;
}