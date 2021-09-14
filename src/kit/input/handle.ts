import { TextInput } from ".";
import { useBlockSelector } from "../../../extensions/block";
import { BlockSelectorItem } from "../../../extensions/block/delcare";
import { blockStore } from "../../../extensions/block/store";
import { InputDetector } from "../../../extensions/input.detector/detector";
import { DetectorOperator } from "../../../extensions/input.detector/rules";
import { Block } from "../../block";
import { BlockUrlConstant } from "../../block/constant";
import { ActionDirective } from "../../history/declare";
import { InputStore } from "./store";

/**
 * 
 * @param tp 
 * @param event 
 * @returns 如果返回true，说明被处理占用了
 */
export async function onPreKeydown(tp: TextInput, event: KeyboardEvent) {
    var blockSelectorResult = (await useBlockSelector()).onKeydown(event);
    if (blockSelectorResult) {
        if (!(typeof blockSelectorResult == 'boolean')) {
            await InputBlockSelectorAfter(tp, blockSelectorResult.block, blockSelectorResult.matchValue);
        }
        return true;
    }
    return false;
}
/**
 * 
 * @param tp 
 * @returns 
 */
export async function InputHandle(tp: TextInput) {
    /**
     * 对当前的value进行处理，处理后保存且写入到element中
     */
    var anchor = tp.explorer.activeAnchor;
    var value = tp.textarea.value;
    (await useBlockSelector()).open(anchor.bound.leftBottom, value, async (block, matchValue) => {
        await InputBlockSelectorAfter(tp, block, matchValue);
    });
    if (await InputDetectorHandle(tp)) return true;
    tp.cursorTextElement.innerHTML = value;
    anchor.at = tp.cursorStartAt + value.length;
    await InputStore(anchor.block, anchor.elementAppear.prop, value, tp.cursorStartAt);
    tp.followAnchor(anchor);
}
export async function InputDetectorHandle(tp: TextInput) {
    var anchor = tp.explorer.activeAnchor;
    var value = tp.textarea.value;
    var mr = InputDetector(value, anchor, {
        at: tp.cursorStartAt,
        rowStart: (!anchor.block.prev) && anchor.block.at == 0 ? true : false
    });
    if (mr) {
        console.log('mr', mr);
        var rule = mr.rule;
        var block = anchor.block;
        switch (rule.operator) {
            case DetectorOperator.firstLetterCreateBlock:
                tp.page.onAction(ActionDirective.onInputDetector, async () => {
                    block.updateProps({ [anchor.elementAppear.prop]: '' })
                    var newBlock = await block.turn(rule.url);
                    var newRowBlock = await newBlock.visibleDownCreateBlock(BlockUrlConstant.TextSpan);
                    newRowBlock.mounted(() => {
                        tp.explorer.onFocusAnchor(newRowBlock.visibleHeadAnchor);
                    });
                });
                break;
            case DetectorOperator.firstLetterTurnBlock:
                tp.page.onAction(ActionDirective.onInputDetector, async () => {
                    block.updateProps({ [anchor.elementAppear.prop]: '' });
                    var newBlock = await block.turn(rule.url);
                    newBlock.mounted(() => {
                        tp.explorer.onFocusAnchor(newBlock.visibleHeadAnchor);
                    });
                });
                break;
            case DetectorOperator.inputCharReplace:
                tp.cursorTextElement.innerHTML = mr.value;
                anchor.at = tp.cursorStartAt + mr.value.length;
                tp.textarea.value = mr.value;
                await InputStore(block, anchor.elementAppear.prop, mr.value, tp.cursorStartAt);
                tp.followAnchor(anchor);
                break;
            case DetectorOperator.letterReplaceCreateBlock:
                tp.cursorTextElement.innerHTML = value;
                anchor.at = tp.cursorStartAt + value.length;
                tp.textarea.value = value;
                var action = async () => {
                    var newBlock = await tp.page.createBlock(rule.url, { content: mr.matchValue }, block.parent, block.at + 1);
                    newBlock.mounted(() => {
                        tp.explorer.onFocusAnchor(newBlock.visibleBackAnchor);
                    });
                }
                await InputStore(block, anchor.elementAppear.prop, mr.value, tp.cursorStartAt, true, action);
                tp.followAnchor(anchor);
                break;
        }
        return true;
    }
    else return false;
}

export async function InputBlockSelectorAfter(tp: TextInput, blockData: BlockSelectorItem, matchValue: string) {
    var anchor = tp.explorer.activeAnchor;
    var block = anchor.block;
    tp.cursorTextElement.innerHTML = matchValue;
    tp.textarea.value = matchValue;
    await InputStore(anchor.block, anchor.elementAppear.prop, matchValue, tp.cursorStartAt, true, async () => {
        let extra: Record<string, any> = {};
        if (typeof blockData.operator != 'undefined') {
            extra = await blockStore.open(blockData.operator, anchor.bound);
            if (Object.keys(extra).length == 0) {
                /**
                 * 说明什么也没拿到，那么怎么办呢，
                 * 不怎么办，终止后续的动作
                 */
                return;
            }
        }
        var newBlock: Block;
        if (blockData.isLine) {
            newBlock = await block.visibleRightCreateBlock(blockData.url, extra);
        }
        else {
            newBlock = await block.visibleDownCreateBlock(blockData.url, extra);
        }
        newBlock.mounted(() => {
            var anchor = newBlock.visibleHeadAnchor;
            if (anchor && (anchor.isSolid || anchor.isText))
                tp.explorer.onFocusAnchor(anchor);
        });
    });
}
export async function InputAtSelector(tp: TextInput) {
    var anchor = tp.explorer.activeAnchor;
    var value = tp.textarea.value;
    var r = (await useBlockSelector()).open(anchor.bound.leftBottom, value, (block, matchValue) => {

    });
    return r;
}
