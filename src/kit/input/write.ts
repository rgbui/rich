import { TextInput } from ".";
import { Block } from "../../block";
import { BlockUrlConstant } from "../../block/constant";
import { dom } from "../../common/dom";
import { KeyboardCode } from "../../common/keys";
import { TextEle } from "../../common/text.ele";
import { ExceptionType, Exception } from "../../error/exception";
import { BlockSelectorItem } from "../../../extensions/block/delcare";
import { blockStore } from "../../../extensions/block/store";
import { DetectorOperator, DetectorRule } from "../../../extensions/input.detector/detector";
import { ActionDirective } from "../../history/declare";
import { Anchor } from "../selection/anchor";
export class TextInput$Write {
    /***
     * keydown会触发多次（如果手不松，会一直触发，所以整个过程前非是完整的keydown-keyup
     * 可能会是keydown-keydown-keydown-keyup
     * keydown-input keydown-input keydown-input-keyup
     * 注意keydown是要输入，input是输入完成，keyup不一定会触发
     */
    async onKeydown(this: TextInput, event: KeyboardEvent) {
        this.isWillInput = false;
        var isIntercept = this.kit.emit('keydown', event);
        if (isIntercept) {
            await this.willForceStore();
            event.preventDefault();
            return;
        }
        if (this.explorer.hasSelectionRange) {
            switch (event.key) {
                case KeyboardCode.ArrowDown:
                case KeyboardCode.ArrowUp:
                case KeyboardCode.ArrowLeft:
                case KeyboardCode.ArrowRight:
                    await this.willForceStore();
                    return await this.kit.explorer.onCancelSelection();
                case KeyboardCode.Enter:
                case KeyboardCode.Delete:
                case KeyboardCode.Backspace:
                    await this.willForceStore();
                    event.preventDefault();
                    return await this.kit.explorer.onDeleteSelection();
            }
        }
        else if (this.explorer.isOnlyAnchor) {
            switch (event.key) {
                case KeyboardCode.ArrowDown:
                case KeyboardCode.ArrowUp:
                case KeyboardCode.ArrowLeft:
                case KeyboardCode.ArrowRight:
                    await this.willForceStore();
                    event.preventDefault();
                    return this.kit.explorer.onCursorMove(event.key);
                case KeyboardCode.Enter:
                    if (!this.page.keyboardPlate.isShift() && this.explorer.activeAnchor.isText && this.explorer.activeAnchor.isEnd) {
                        await this.willForceStore();
                        await this.explorer.onEnter();
                        event.preventDefault();
                        return
                    }
                    else if (this.explorer.activeAnchor.isText && this.explorer.activeAnchor.block.multiLines == false) {
                        await this.willForceStore();
                        /**
                         * 对于支持行的block，将会被截断
                         */
                        await this.explorer.onEnterCutOff();
                        event.preventDefault();
                        return
                    }
                    break;
                case KeyboardCode.Delete:
                case KeyboardCode.Backspace:
                    if (!this.textarea.value) {
                        await this.willForceInputStore();
                        return await this.onInputDeleteText();
                    }
                    break;
            }
        }
        this.isWillInput = true;
    }
    private isWillInput: boolean;
    async onInput(this: TextInput, event: KeyboardEvent) {
        if (this.isWillInput == true) {
            var value = this.textarea.value;
            var anchor = this.explorer.activeAnchor;
            if (anchor && anchor.isActive) {
                anchor.inputting();
                if (!this.textNode) {
                    this.textNode = document.createElement('span');
                    anchor.view.parentNode.insertBefore(this.textNode, anchor.view);
                }
                this.textNode.innerHTML = value;
                anchor.at = this.textAt + value.length;
                try {
                    this.kit.emit('inputting', value, anchor, { start: this.textAt });
                }
                catch (ex) {
                    this.kit.page.onError(ex);
                }
                /**
                 * 将要保存，但不会立码保存，一般是停止输入700ms，会触发保存，
                 * 实际上一直输，会一直不保存的
                 */
                await this.willInputStore(anchor.block, value, this.textAt);
                if (value) anchor.removeEmpty();
                this.followAnchor(anchor);
            }
        }
    }
    private deleteInputText: string;
    /**
     * 
     * 设计处进过程 https://github.com/rgbui/rich/issues/3#issuecomment-868976326
     * @param this 
     * 
     */
    async onInputDeleteText(this: TextInput) {
        var anchor = this.explorer.activeAnchor;
        var block = anchor.block;
        anchor.inputting();
        if (anchor.isText) {
            if (anchor.at == 0) {
                var prevAnchor = block.visiblePrevAnchor;
                if (prevAnchor) {
                    if (this.kit.page.textAnchorIsAdjoin(anchor, prevAnchor)) {
                        this.explorer.onFocusAnchor(prevAnchor);
                        this.onWillInput(this.explorer.activeAnchor);
                        await this.onInputDeleteText();
                    }
                    else {
                        this.kit.explorer.onCursorMove(KeyboardCode.ArrowLeft);
                        this.onWillInput(this.explorer.activeAnchor);
                        if (block.isCanAutomaticallyDeleted) await block.onDelete()
                        else {
                            /**
                             * 这里判断是否为跨行
                             * 如果跨行，那么此时block所在的行的内容是否合并到新行中
                             ***/
                        }
                    }
                }
                else {
                    /**
                     * 此时光标无法再回退了
                     * 这应该是文档的第一行首位元素
                     */

                }
            }
            else if (anchor.at > 0) {
                var dm = dom(anchor.view);
                var textNode = dm.prevFind(g => {
                    if (g instanceof Text) return true;
                    else return false;
                }) as Text;
                if (textNode) {
                    var value = textNode.textContent;
                    this.deleteInputText = value.slice(value.length - 1) + this.deleteInputText;
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
                                var newAnchor: Anchor;
                                if (block.prev) newAnchor = block.prev.visibleBackAnchor;
                                else if (block.next) newAnchor = block.next.visibleHeadAnchor;
                                var pa = block.parent;
                                if (block.isCanAutomaticallyDeleted) { await block.delete(); existsDelete = true; }
                                if (!newAnchor) newAnchor = pa.visibleHeadAnchor;
                                this.explorer.onFocusAnchor(newAnchor);
                                this.onWillInput(this.explorer.activeAnchor);
                            }
                            var checkEmpty = () => {
                                var currentAnchor = this.explorer.activeAnchor;
                                this.explorer.onFocusAnchor(currentAnchor);
                                if (currentAnchor.at == 0 && currentAnchor.elementAppear.isEmpty) currentAnchor.setEmpty();
                                else currentAnchor.removeEmpty();
                            }
                            if (existsDelete == true) this.page.onUpdated(async () => {
                                checkEmpty();
                            })
                            else checkEmpty();
                        }
                    }
                    await this.willDeleteStore(block, this.textAt, this.deleteInputText, anchor.at == 0 ? true : false, action);
                    this.followAnchor(this.explorer.activeAnchor);
                } else throw new Exception(ExceptionType.notFoundTextEle);
            }
        }
        else {
            this.kit.explorer.onCursorMove(KeyboardCode.ArrowLeft);
            this.onWillInput(this.explorer.activeAnchor);
            await block.onDelete()
        }
    }
    private textNode: HTMLElement;
    private textAt: number;
    /***
     * 表示在这个光标处可以输入了
     * 如果不执行该方法，可能输入就没有任何文字
     */
    onWillInput(this: TextInput, anchor: Anchor) {
        this.onFocus();
        this.isWillInput = false;
        this.textarea.value = '';
        delete this.textNode;
        this.deleteInputText = '';
        delete this.lastDeleteText;
        delete this.lastInputText;
        this.clearInputTime();
        this.clearDeleteTime();
        if (anchor && anchor.isText) {
            this.textAt = anchor.at;
        }
        else delete this.textAt;
        this.followAnchor(anchor);
        this.kit.emit('willInput');
    }
    /**
     * 通过输入命令选择block，在选择后，
     * 返回blockData及当前应该输入的文本（会过滤掉当前命令的文本）
     * @param this 
     * @param blockData 插入的block
     * @param value 当前输入的值（过滤掉命令的值），当前的文本值是在emit('inputting')是传出去的
     */
    onBlockSelectorInsert(this: TextInput, blockData: BlockSelectorItem, value: string): Promise<Block> {
        var anchor = this.explorer.activeAnchor;
        var at = this.textAt;
        var block = anchor.block;
        if (this.textNode) {
            if (typeof value == 'undefined') {
                value = this.textNode.innerHTML;
            }
            this.textNode.innerHTML = value;
        }
        anchor.at = this.textAt + (value ? value.length : 0);
        return new Promise((resolve, reject) => {
            this.willInputStore(block, value, at, true, async () => {
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
                    resolve(newBlock);
                    var anchor = newBlock.visibleHeadAnchor;
                    if (anchor && (anchor.isSolid || anchor.isText))
                        this.explorer.onFocusAnchor(anchor);
                });
            });
        })

    }
    async onInputDetector(this: TextInput, rule: DetectorRule, value: string, lastValue?: string) {
        var anchor = this.explorer.activeAnchor;
        var block = anchor.block;
        switch (rule.operator) {
            case DetectorOperator.firstLetterCreateBlock:
                this.page.onAction(ActionDirective.onInputDetector, async () => {
                    var newBlock = await block.turn(rule.url);
                    var newRowBlock = await newBlock.visibleDownCreateBlock(BlockUrlConstant.TextSpan);
                    newRowBlock.mounted(() => {
                        this.explorer.onFocusAnchor(newRowBlock.visibleHeadAnchor);
                    });
                });
                break;
            case DetectorOperator.firstLetterTurnBlock:
                this.page.onAction(ActionDirective.onInputDetector, async () => {
                    block.updateProps({ content: value });
                    var newBlock = await block.turn(rule.url);
                    newBlock.mounted(() => {
                        this.explorer.onFocusAnchor(newBlock.visibleHeadAnchor);
                    });
                });
                break;
            case DetectorOperator.inputCharReplace:
                this.textNode.innerHTML = value;
                anchor.at = this.textAt + value.length;
                this.textarea.value = value;
                await this.willInputStore(block, value, this.textAt, true);
                break;
            case DetectorOperator.letterReplaceCreateBlock:
                this.textNode.innerHTML = value;
                anchor.at = this.textAt + value.length;
                this.textarea.value = value;
                var action = async () => {
                    var newBlock = await this.page.createBlock(rule.url, { content: lastValue }, block.parent, block.at + 1);
                    newBlock.mounted(() => {
                        this.explorer.onFocusAnchor(newBlock.visibleBackAnchor);
                    });
                }
                this.willInputStore(block, value, this.textAt, true, action);
                break;
        }
    }
    private delayInputTime;
    private clearInputTime() {
        if (this.delayInputTime) {
            clearTimeout(this.delayInputTime);
            this.delayInputTime = null;
        }
    }
    private lastInputText: string;
    private inputStore: Function;
    async willInputStore(this: TextInput, block: Block, value: string, at: number, force: boolean = false, action?: () => Promise<void>) {
        this.clearInputTime();
        var self = this;
        this.inputStore = async function () {
            delete self.inputStore;
            // block.content = TextEle.getTextContent(block.textEl);
            self.lastInputText = value;
            await block.onInputText(value, at, self.lastInputText ? at + self.lastInputText.length : at, action)
        }
        if (force == true) await this.inputStore()
        else
            this.delayInputTime = setTimeout(async () => {
                if (self.inputStore) await self.inputStore()
            }, 7e2);
    }
    async willForceInputStore() {
        if (this.inputStore) { this.clearInputTime(); await this.inputStore(); }
    }
    private delayDeleteTime;
    private lastDeleteText: string;
    private deleteStore: Function;
    private clearDeleteTime() {
        if (this.delayDeleteTime) {
            clearTimeout(this.delayDeleteTime);
            delete this.delayDeleteTime;
        }
    }
    async willDeleteStore(this: TextInput, block: Block, from: number, text: string, force: boolean = false, action?: () => Promise<void>) {
        this.clearDeleteTime();
        var self = this;
        self.deleteStore = async () => {
            delete self.deleteStore;
            // block.content = TextEle.getTextContent(block.textEl);
            var size = this.lastDeleteText ? this.lastDeleteText.length : 0;
            this.lastDeleteText = text;
            this.clearDeleteTime();
            await block.onDeleteText(text.slice(0, text.length - size), from - size, from - text.length, action)
        }
        /***
            * 这里需要将当前的变化通知到外面，
            * 当然用户在输的过程中，该方法会不断的执行，所以通知需要加一定的延迟，即用户停止几秒钟后默认为输入
            */
        if (force == false) this.delayDeleteTime = setTimeout(async () => { await self.deleteStore() }, 7e2);
        else await self.deleteStore()
    }
    /**
     * 强迫保存,用户输入时候，会有700ms的延迟
     * 如果确定不在输入，那么可以立即保存，否则到700ms会自动保存
     * 
     */
    async willForceStore() {
        if (this.inputStore) { this.clearInputTime(); await this.inputStore(); }
        if (this.deleteStore) { this.clearDeleteTime(); await this.deleteStore(); }
    }
}