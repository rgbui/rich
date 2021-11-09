import { TextInput } from ".";
import { KeyboardCode } from "../../common/keys";
import { Anchor } from "../selection/anchor";
import { ClearInputStore, ForceInputStore, ForceStore } from "./store";
import { InputHandle, onPreKeydown } from "./handle/input";
import { backspaceDeleteHandle } from "./handle/back.delete";
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
                        return await backspaceDeleteHandle(this);
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
    public deleteInputText: string;
    public cursorTextElement: HTMLElement;
    public cursorStartAt: number;
    /***
     * 表示在这个光标处可以输入了
     * 如果不执行该方法，可能输入就没有任何文字
     */
    async onStartInput(this: TextInput, anchor: Anchor) {
        await ForceStore()
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