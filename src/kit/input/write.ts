import { TextInput } from ".";
import { dom } from "../../common/dom";
import { KeyboardCode } from "../../common/keys";
import { ExceptionType, Exception } from "../../error/exception";
import { Anchor } from "../selection/anchor";
import { ClearInputStore, ForceInputStore, ForceStore } from "./store";
import { InputHandle, onPreKeydown } from "./handle";
export class TextInput$Write {
    /***
     * keydown会触发多次（如果手不松，会一直触发，所以整个过程前非是完整的keydown-keyup
     * 可能会是keydown-keydown-keydown-keyup
     * keydown-input keydown-input keydown-input-keyup
     * 注意keydown是要输入，input是输入完成，keyup不一定会触发
     */
    async onKeydown(this: TextInput, event: KeyboardEvent) {
        this.isWillInput = false;
        var r = await onPreKeydown(this, event);
        if (r == true) {
            event.preventDefault();
            return;
        }
        if (this.explorer.hasSelectionRange) {
            switch (event.key) {
                case KeyboardCode.ArrowDown:
                case KeyboardCode.ArrowUp:
                case KeyboardCode.ArrowLeft:
                case KeyboardCode.ArrowRight:
                    await ForceStore();
                    return await this.kit.explorer.onCancelSelection();
                case KeyboardCode.Enter:
                case KeyboardCode.Delete:
                case KeyboardCode.Backspace:
                    await ForceStore();
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
                    await ForceStore();
                    event.preventDefault();
                    return this.kit.explorer.onCursorMove(event.key);
                case KeyboardCode.Enter:
                    if (!this.page.keyboardPlate.isShift() && this.explorer.activeAnchor.isText && this.explorer.activeAnchor.isEnd) {
                        await ForceStore();
                        await this.explorer.onEnter();
                        event.preventDefault();
                        return
                    }
                    else if (this.explorer.activeAnchor.isText && this.explorer.activeAnchor.block.multiLines == false) {
                        await ForceStore();
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
                        await ForceInputStore();
                        return await this.onInputDeleteText();
                    }
                    break;
            }
        }
        this.isWillInput = true;
    }
    private isWillInput: boolean;
    async onInput(this: TextInput, event: KeyboardEvent) {
        if (this.isWillInput) {
            var anchor = this.explorer.activeAnchor;
            if (anchor && anchor.isActive) {
                anchor.inputting();
                if (!this.cursorTextElement) {
                    this.cursorTextElement = document.createElement('span');
                    anchor.view.parentNode.insertBefore(this.cursorTextElement, anchor.view);
                }
                await InputHandle(this);
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
                        this.onStartInput(this.explorer.activeAnchor);
                        await this.onInputDeleteText();
                    }
                    else {
                        this.kit.explorer.onCursorMove(KeyboardCode.ArrowLeft);
                        this.onStartInput(this.explorer.activeAnchor);
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
                                this.onStartInput(this.explorer.activeAnchor);
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
                    //await this.willDeleteStore(block, this.textAt, this.deleteInputText, anchor.at == 0 ? true : false, action);
                    this.followAnchor(this.explorer.activeAnchor);
                } else throw new Exception(ExceptionType.notFoundTextEle);
            }
        }
        else {
            this.kit.explorer.onCursorMove(KeyboardCode.ArrowLeft);
            this.onStartInput(this.explorer.activeAnchor);
            await block.onDelete()
        }
    }
    public cursorTextElement: HTMLElement;
    public cursorStartAt: number;
    /***
     * 表示在这个光标处可以输入了
     * 如果不执行该方法，可能输入就没有任何文字
     */
    onStartInput(this: TextInput, anchor: Anchor) {
        this.onFocus();
        this.isWillInput = false;
        this.textarea.value = '';
        delete this.cursorTextElement;
        this.deleteInputText = '';
        ClearInputStore();
        if (anchor?.isText) {
            this.cursorStartAt = anchor.at;
        }
        else delete this.cursorStartAt;
        this.followAnchor(anchor);
        this.kit.emit('willInput');
    }
}