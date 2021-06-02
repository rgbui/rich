import { TextInput } from ".";
import { dom } from "../../common/dom";
import { KeyboardCode } from "../../common/keys";
import { Point } from "../../common/point";
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
        /***blockSelector拉截 */
        if (this.blockSelector.isVisible) {
            if (this.blockSelector.interceptKey(event) == true) {
                return;
            }
        }
        switch (event.key) {
            case KeyboardCode.ArrowDown:
            case KeyboardCode.ArrowUp:
            case KeyboardCode.ArrowLeft:
            case KeyboardCode.ArrowRight:
                event.preventDefault();
                if (this.explorer.hasSelectionRange) {
                    return this.selector.onCancelSelection();
                }
                else if (this.explorer.isOnlyOneAnchor) {
                    return this.selector.onKeyArrow(event.key);
                }
                break;
            case KeyboardCode.Enter:
                if (!this.selector.page.keyboardPlate.isShift()) {
                    if (this.explorer.hasSelectionRange) {

                    }
                    else if (this.explorer.isOnlyOneAnchor
                        && this.explorer.activeAnchor.isText
                        && this.explorer.activeAnchor.isEnd
                    ) {
                        event.preventDefault();
                        //换行接着创建一个新的block
                        return this.selector.onCreateBlockByEnter();
                    }
                }
                break;
            case KeyboardCode.Delete:
            case KeyboardCode.Backspace:
                if (this.explorer.hasSelectionRange) {
                    //删除选区
                    return this.selector.onKeyDelete()
                }
                else if (this.explorer.isOnlyOneAnchor) {
                    if (this.explorer.activeAnchor.isText) {
                        if (!this.textarea.value)
                            return this.onInputDeleteText();
                    }
                    else return this.selector.onKeyDelete()
                }
                break;
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
                if (!this.inputTextNode) {
                    this.inputTextNode = document.createElement('span');
                    anchor.view.parentNode.insertBefore(this.inputTextNode, anchor.view);
                }
                this.inputTextNode.innerHTML = value;
                anchor.at = this.inputTextAt + value.length;
                anchor.view.style.display = 'inline';
                if (value.endsWith('@')) {
                    //说明用户有输入@符的意图，那么这里弹出一个下拉框供用户选择
                }
                else if (value.endsWith('/') || value.endsWith('、')) {
                    //说明用户有插入某个元素的意图 
                    var bound = anchor.view.getBoundingClientRect();
                    var point = new Point(bound.left, bound.top + bound.height);
                    this.blockSelector.open(point, value);
                    this.blockSelector.only('select', async (blockData) => {
                        anchor.block.onStoreInputText(this.inputTextAt,
                            value.replace(/[\/、][^/、]*$/, ""),
                            true,
                            async () => {
                                await this.selector.page.onObserveUpdate(async () => {
                                    var newBlock = await anchor.block.visibleDownCreateBlock(blockData.url);
                                    newBlock.mounted(() => {
                                        var contentBlock = newBlock.find(g => !g.isLayout);
                                        if (contentBlock) {
                                            var newAnchor = contentBlock.visibleHeadAnchor;
                                            this.explorer.onReplaceSelection(newAnchor);
                                        }
                                    });
                                })
                            }
                        )
                    })
                }
                else if (this.blockSelector.isVisible == true) {
                    this.blockSelector.onInputFilter(value);
                }
                else {
                    anchor.block.onStoreInputText(this.inputTextAt, value);
                }
                this.followAnchor(anchor);
                if (value) anchor.removeEmpty();
            }
        }
    }
    deleteInputText: string;
    async onInputDeleteText(this: TextInput,) {
        var anchor = this.explorer.activeAnchor;
        if (anchor.isText) {
            anchor.inputting();
            if (anchor.at == 0) {
                var block = anchor.block;
                //说明当前的block已经删完了，此时光标应该向前移,移到上面一行
                this.selector.onKeyArrow(KeyboardCode.ArrowLeft);
                if (block.isEmpty && !block.isPart) {
                    this.selector.page.onObserveUpdate(async () => {
                        await block.onDelete();
                    });
                }
                this.onWillInput(this.explorer.activeAnchor);
                this.followAnchor(this.explorer.activeAnchor);
                return;
            }
            else if (anchor.at > 0) {
                var dm = dom(anchor.view);
                var textNode = dm.prevFind(g => {
                    if (g instanceof Text) return true;
                    else return false;
                });
                if (textNode) {
                    if (textNode instanceof Text) {
                        var value = textNode.textContent;
                        this.deleteInputText = value.slice(value.length - 1) + this.deleteInputText;
                        textNode.textContent = value.slice(0, value.length - 1);
                        anchor.at -= 1;
                        if (textNode.textContent.length == 0) {
                            textNode.remove();
                        }
                    }
                    if (anchor.at == 0) {
                        var block = anchor.block;
                        var prevAnchor = anchor.block.visiblePrevAnchor;
                        if (prevAnchor && prevAnchor.isText) {
                            var ob = anchor.textEl.getBoundingClientRect();
                            var nb = prevAnchor.textEl.getBoundingClientRect();
                            if (Math.abs(nb.left + nb.width - ob.left) < 10) {
                                this.explorer.onReplaceSelection(prevAnchor);
                                await block.onStoreInputDeleteText(this.inputTextAt, this.deleteInputText, true, async () => {
                                    if (block.isEmpty && !block.isPart) {
                                        await this.selector.page.onObserveUpdate(async () => {
                                            var pa = block.parent;
                                            await block.delete();
                                            await pa.deleteLayout();
                                        });
                                    }
                                });
                                this.onWillInput(this.explorer.activeAnchor);
                                this.followAnchor(this.explorer.activeAnchor);
                                return;
                            }
                        }
                    }
                    await anchor.block.onStoreInputDeleteText(this.inputTextAt, this.deleteInputText, anchor.at == 0 ? true : false);
                    if (anchor.at == 0 && block.isEmpty) {
                        anchor.setEmpty();
                    }
                    this.followAnchor(anchor);
                }
                else throw new Error('not found text');
            }
        }
    }
    inputTextNode: HTMLElement;
    inputTextAt: number;
    /***
     * 表示在这个光标处可以输入了
     * 如果不执行该方法，可能输入就没有任何文字
     */
    onWillInput(this: TextInput, anchor: Anchor) {
        this.onFocus();
        anchor.block.onWillInput();
        this.isWillInput = false;
        this.textarea.value = '';
        delete this.inputTextNode;
        this.deleteInputText = '';
        if (anchor.isText) {
            this.inputTextAt = anchor.at;
        }
    }
}