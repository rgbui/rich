import { TextInput } from ".";
import { Block } from "../../block";
import { dom } from "../../common/dom";
import { KeyboardCode } from "../../common/keys";
import { TextEle } from "../../common/text.ele";
import { ExceptionType, Exception } from "../../error/exception";
import { Anchor } from "../selection/anchor";

export class TextInput$Write {
    /***
     * keydown会触发多次（如果手不松，会一直触发，所以整个过程前非是完整的keydown-keyup
     * 可能会是keydown-keydown-keydown-keyup
     * keydown-input keydown-input keydown-input-keyup
     * 注意keydown是要输入，input是输入完成，keyup不一定会触发
     */
    onKeydown(this: TextInput, event: KeyboardEvent) {
        this.isWillInput = false;
        var isIntercept = this.kit.emit('keydown', event);
        if (isIntercept) return;
        if (this.explorer.hasSelectionRange) {
            switch (event.key) {
                case KeyboardCode.ArrowDown:
                case KeyboardCode.ArrowUp:
                case KeyboardCode.ArrowLeft:
                case KeyboardCode.ArrowRight:
                    return this.kit.explorer.onCancelSelection();
                    break;
                case KeyboardCode.Enter:
                    return this.kit.explorer.onCancelSelection();
                    break;
                case KeyboardCode.Delete:
                case KeyboardCode.Backspace:
                    return this.kit.explorer.onDeleteSelection();
                    break;
            }
        }
        else if (this.explorer.isOnlyAnchor) {
            switch (event.key) {
                case KeyboardCode.ArrowDown:
                case KeyboardCode.ArrowUp:
                case KeyboardCode.ArrowLeft:
                case KeyboardCode.ArrowRight:
                    return this.kit.explorer.onCursorMove(event.key);
                case KeyboardCode.Enter:
                    if (!this.page.keyboardPlate.isShift() && this.explorer.activeAnchor.isText && this.explorer.activeAnchor.isEnd)
                        return this.explorer.onEnter()
                    break;
                case KeyboardCode.Delete:
                case KeyboardCode.Backspace:
                    if (this.explorer.activeAnchor.isText) {
                        if (!this.textarea.value) return this.onInputDeleteText();
                    }
                    else return this.kit.explorer.onDeleteAnchor()
                    break;
            }
        }
        this.isWillInput = true;
    }
    isWillInput: boolean;
    onInput(this: TextInput, event: KeyboardEvent) {
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
                    this.kit.emit('inputting', value, anchor);
                }
                catch (ex) {
                    this.kit.page.onError(ex);
                }
                /**
                 * 将要保存，但不会立码保存，一般是停止输入700ms，会触发保存，
                 * 实际上一直输，会一直不保存的
                 */
                this.willInputStore(anchor.block, value, this.textAt);
                if (value) anchor.removeEmpty();
                this.followAnchor(anchor);
            }
        }
    }
    private deleteInputText: string;
    async onInputDeleteText(this: TextInput) {
        var anchor = this.explorer.activeAnchor;
        if (anchor.isText) {
            var block = anchor.block;
            anchor.inputting();
            if (anchor.at == 0) {
                var prevAnchor = block.visiblePrevAnchor;
                if (this.kit.page.textAnchorIsAdjoin(anchor, prevAnchor)) {
                    this.explorer.onFocusAnchor(prevAnchor);
                    if (block.isCanAutomaticallyDeleted) await block.onDelete()
                    this.onWillInput(this.explorer.activeAnchor);
                    await this.onInputDeleteText();
                }
                else {
                    //没有挨近
                    /**
                     * 这里主要是判断前面的一个block与当前的block是否处于换行的，
                     * 如果处于换行的，可能要合并内容(可以暂时先不做)
                     * 
                     */
                    this.kit.explorer.onCursorMove(KeyboardCode.ArrowLeft);
                    if (block.isCanAutomaticallyDeleted) await block.onDelete()
                    this.onWillInput(this.explorer.activeAnchor);
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
                        textNode.remove();
                    }
                    var action: () => Promise<void>;
                    if (anchor.at == 0) {
                        var prevAnchor = block.visiblePrevAnchor;
                        if (this.kit.page.textAnchorIsAdjoin(prevAnchor, anchor)) {
                            this.explorer.onFocusAnchor(prevAnchor);
                            this.onWillInput(this.explorer.activeAnchor);
                            if (block.isCanAutomaticallyDeleted)
                                action = async () => {
                                    await block.delete();
                                }
                        }
                    }
                    this.willDeleteStore(block, this.textAt, value, anchor.at == 0 ? true : false, action);
                    if (anchor.at == 0 && block.isEmpty) anchor.setEmpty();
                    else anchor.removeEmpty();
                    this.followAnchor(this.explorer.activeAnchor);
                } else throw new Exception(ExceptionType.notFoundTextEle);
            }
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
        this.clearInputTime();
        this.kit.emit('willInput');
        if (anchor && anchor.isText) {
            this.textAt = anchor.at;
        }
        this.followAnchor(anchor);
    }
    /**
     * 通过输入命令选择block，在选择后，
     * 返回blockData及当前应该输入的文本（会过滤掉当前命令的文本）
     * @param this 
     * @param blockData 插入的block
     * @param value 当前输入的值（过滤掉命令的值），当前的文本值是在emit('inputting')是传出去的
     */
    onBlockSelectorInsert(this: TextInput, blockData: { url: string }, value: string) {
        var anchor = this.explorer.activeAnchor;
        var at = this.textAt;
        var block = anchor.block;
        this.textNode.innerHTML = value;
        anchor.at = this.textAt + value.length;
        this.willInputStore(block, value, at, true, async () => {
            var newBlock = await block.visibleDownCreateBlock(blockData.url);
            newBlock.mounted(() => {
                var contentBlock = newBlock.find(g => !g.isLayout);
                if (contentBlock) {
                    var newAnchor = contentBlock.visibleHeadAnchor;
                    this.explorer.onFocusAnchor(newAnchor);
                }
            });
        });
    }
    private delayInputTime;
    private clearInputTime() {
        if (this.delayInputTime) {
            clearTimeout(this.delayInputTime);
            this.delayInputTime = null;
        }
    }
    private lastInputText: string;
    willInputStore(this: TextInput, block: Block, value: string, at: number, force: boolean = false, action?: () => Promise<void>) {
        this.clearInputTime();
        var self = this;
        function store() {
            block.content = TextEle.getTextContent(block.textEl);
            self.lastInputText = value;
            block.onInputText(value, at, self.lastInputText ? at + self.lastInputText.length : at, action)
        }
        if (force == true) store()
        else
            this.delayInputTime = setTimeout(() => {
                store()
            }, 7e2);
    }
    private delayDeleteTime;
    private lastDeleteText: string;
    private clearDeleteTime() {
        if (this.delayDeleteTime) {
            clearTimeout(this.delayDeleteTime);
            delete this.delayDeleteTime;
        }
    }
    willDeleteStore(this: TextInput, block: Block, from: number, text: string, force: boolean = false, action?: () => Promise<void>) {
        this.clearDeleteTime();
        var excute = () => {
            block.content = TextEle.getTextContent(block.textEl);
            var size = this.lastDeleteText ? this.lastDeleteText.length : 0;
            this.lastDeleteText = text;
            this.clearDeleteTime();
            block.onDeleteText(text.slice(0, text.length - size), from - size, from - text.length, action)
        }
        /***
            * 这里需要将当前的变化通知到外面，
            * 当然用户在输的过程中，该方法会不断的执行，所以通知需要加一定的延迟，即用户停止几秒钟后默认为输入
            */
        if (force == false) this.delayDeleteTime = setTimeout(async () => { await excute() }, 7e2);
        else excute();
    }
}