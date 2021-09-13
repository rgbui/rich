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
 * @param this
 * @param event 
 * @returns  如果返回true，说明被处理占用了
 */
export async function onPreKeydown(this: TextInput, event: KeyboardEvent) {
    var blockSelectorResult = (await useBlockSelector()).onKeydown(event);
    if (blockSelectorResult) {
        if (!(typeof blockSelectorResult == 'boolean')) {
            await InputBlockSelectorAfter(this, blockSelectorResult.block, blockSelectorResult.matchValue);
            return true;
        }
    }
    return false;
}
/**
 * 
 * @param this 
 * @param cursorStartAt 
 * @param cursorTextElement 
 * 
 */
export async function InputHandle(this: TextInput)
{
    /**
     * 对当前的value进行处理，处理后保存且写入到element中
     */
    var anchor = this.explorer.activeAnchor;
    var value = this.textarea.value;
    (await useBlockSelector()).open(anchor.bound.leftBottom, value, async (block, matchValue) => {
        await InputBlockSelectorAfter(this, block, matchValue);
    });
    if (await InputDetectorHandle(this)) return true;
    await InputStore(anchor.block, anchor.elementAppear.prop, value, this.cursorStartAt);
}
export async function InputDetectorHandle(tp: TextInput) {
    var anchor = tp.explorer.activeAnchor;
    var value = tp.textarea.value;
    var mr = InputDetector(value, anchor, {
        at: tp.cursorStartAt,
        rowStart: anchor.block.isLine && anchor.block.at == 0 ? true : false
    });
    if (mr) {
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
                break;
            case DetectorOperator.letterReplaceCreateBlock:
                tp.cursorTextElement.innerHTML = value;
                anchor.at = tp.cursorStartAt + value.length;
                tp.textarea.value = value;
                var action = async () => {
                    var newBlock = await this.page.createBlock(rule.url, { content: mr.matchValue }, block.parent, block.at + 1);
                    newBlock.mounted(() => {
                        tp.explorer.onFocusAnchor(newBlock.visibleBackAnchor);
                    });
                }
                await InputStore(block, anchor.elementAppear.prop, mr.value, tp.cursorStartAt, true, action);
                break;
        }
        return true;
    }
    else return false;
}

export async function InputBlockSelectorAfter(tp: TextInput, blockData: BlockSelectorItem, matchValue: string) {
    var anchor = tp.explorer.activeAnchor;
    var block = anchor.block;
    this.cursorTextElement.innerHTML = matchValue;
    this.textarea.value = matchValue;
    await InputStore(anchor.block, anchor.elementAppear.prop, matchValue, this.cursorStartAt, true, async () => {
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
                this.explorer.onFocusAnchor(anchor);
        });
    });
}
export async function InputAtSelector(this: TextInput) {
    var anchor = this.explorer.activeAnchor;
    var value = this.textarea.value;
    var r = (await useBlockSelector()).open(anchor.bound.leftBottom, value, (block, matchValue) => {

    });
    return r;
}
