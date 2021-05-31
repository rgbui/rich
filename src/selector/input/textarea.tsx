import React from 'react';
import { Selector } from '..';
import { dom } from '../../common/dom';
import { KeyboardCode } from '../../common/keys';
import { Point } from '../../common/point';
import { Anchor } from '../selection/anchor';
export class TextInput extends React.Component<{ selector: Selector }> {
    constructor(props) {
        super(props);
    }
    get selector() {
        return this.props.selector;
    }
    get explorer() {
        return this.selector.explorer;
    }
    get blockSelector() {
        return this.selector.page.blockSelector;
    }
    textarea: HTMLTextAreaElement;
    async onPaster(event: ClipboardEvent) {
        event.preventDefault();
        var items: { mine: 'file' | 'html' | 'text', content: string | File }[] = [];
        var files: File[] = Array.from(event.clipboardData.files);
        var html = event.clipboardData.getData('text/html');
        if (html) {
            var ma = html.match(/\<[a-zA-Z\d\-]+[\s\S]*?>/);
            if (ma) {
                items.push({ mine: 'html', content: html });
            }
            else items.push({ mine: 'text', content: html });
        }
        else {
            var text = event.clipboardData.getData('text/plain');
            if (text) {
                items.push({ mine: 'text', content: event.clipboardData.getData('text/plain') });
            }
        }
        if (files.length == 0 && !items.exists(g => g.mine == 'html')) {
            //在当前的位置处复制内容
        }
        else if (files.length == 1) {
            //暂时只遇到只有一个文件的，此时复制的文件有两种来源
            //1. 本地文件的复制（从剪贴版上面） 2. 复制网络上面的图片
            if (items.exists(g => g.mine == 'html')) {
                //这里可以提取上传的文件的网址
            }
            else {
                //这个可能是本地的文件名（貌似在mac上，如果复制多张图片，会有多张图片的名称）

            }
        }
        else {
            // 这里是得复制的网页内容，但也有可能是word
        }
        console.log(files, items);
    }
    /***
     * keydown会触发多次（如果手不松，会一直触发，所以整个过程前非是完整的keydown-keyup
     * 可能会是keydown-keydown-keydown-keyup
     * keydown-input keydown-input keydown-input-keyup
     * 注意keydown是要输入，input是输入完成，keyup不一定会触发
     */
    onKeydown(event: KeyboardEvent) {
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
    private isWillInput: boolean = false;
    onInput(event: KeyboardEvent) {
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
                        anchor.block.onInputText(this.inputTextAt,
                            value.replace(/(\/、)[^/、]*$/, ""),
                            true,
                            async () => {
                                this.selector.page.onRememberUpdate();
                                var newBlock = await anchor.block.visibleDownCreateBlock(blockData.url);
                                newBlock.mounted(() => {
                                    var contentBlock = newBlock.find(g => !g.isLayout);
                                    if (contentBlock) {
                                        var newAnchor = contentBlock.visibleHeadAnchor;
                                        this.explorer.onReplaceSelection(newAnchor);
                                    }
                                });
                                this.selector.page.onExcuteUpdate();
                            }
                        )
                    })
                }
                else if (this.blockSelector.isVisible == true) {
                    this.blockSelector.onInputFilter(value);
                }
                else {
                    anchor.block.onInputText(this.inputTextAt, value);
                }
                this.followAnchor(anchor);
                if (value) anchor.removeEmpty();
            }
        }
    }
    private deleteInputText = '';
    async onInputDeleteText() {
        var anchor = this.explorer.activeAnchor;
        if (anchor.isText) {
            anchor.inputting();
            if (anchor.at == 0) {
                //说明当前的block已经删完了，此时光标应该向前移,移到上面一行
                this.selector.onKeyArrow(KeyboardCode.ArrowLeft);
                var block = anchor.block;
                if (block.isEmpty && !block.isPart) {
                    this.selector.page.onObserveUpdate(async () => {
                        await block.onDelete();
                    });
                }
                this.onStartInput(this.explorer.activeAnchor);
                this.followAnchor(this.explorer.activeAnchor);
                return;
            }
            else if (anchor.at > 0) {
                var dm = dom(anchor.view);
                var textNode = dm.prevFind(g => {
                    if (g instanceof Text) return true; else return false;
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
                                await block.onInputDeleteText(this.inputTextAt, this.deleteInputText, true, async () => {
                                    if (block.isEmpty && !block.isPart) {
                                        await this.selector.page.onObserveUpdate(async () => {
                                            var pa = block.parent;
                                            await block.delete();
                                            await pa.deleteLayout();
                                        });
                                    }
                                });
                                this.onStartInput(this.explorer.activeAnchor);
                                this.followAnchor(this.explorer.activeAnchor);
                                return;
                            }
                        }
                    }
                    await anchor.block.onInputDeleteText(this.inputTextAt, this.deleteInputText, anchor.at == 0 ? true : false);
                    if (anchor.at == 0 && block.isEmpty) {
                        anchor.setEmpty();
                    }
                    this.followAnchor(anchor);
                }
                else throw new Error('not found text');
            }
        }
    }
    onFocus() {
        if (document.activeElement !== this.textarea) {
            this.textarea.focus();
        }
    }
    onBlur() {
        if (document.activeElement === this.textarea) {
            this.textarea.blur();
        }
    }
    private inputTextNode: HTMLElement;
    private inputTextAt: number;
    onStartInput(anchor: Anchor) {
        this.onBlur();
        this.onFocus();
        this.textarea.value = '';
        delete this.inputTextNode;
        this.deleteInputText = '';
        if (anchor.isText) {
            this.inputTextAt = anchor.at;
            anchor.block.onInputStart();
        }
    }
    render() {
        return <div className='sy-selector-textinput'><textarea
            ref={e => this.textarea = e}
        ></textarea></div>
    }
    followAnchor(anchor: Anchor) {
        var bound = anchor.bound;
        var point = Point.from(bound);
        this.textarea.style.top = point.y + 'px';
        this.textarea.style.left = point.x + 'px';
        this.textarea.style.height = bound.height + 'px';
    }
    private _paster;
    private _keydown;
    private _input;
    componentDidMount() {
        this.textarea.addEventListener('keydown', this._keydown = this.onKeydown.bind(this));
        this.textarea.addEventListener('input', this._input = this.onInput.bind(this));
        this.textarea.addEventListener('paste', this._paster = this.onPaster.bind(this));
    }
    componentWillUnmount() {
        this.textarea.removeEventListener('keydown', this._keydown);
        this.textarea.removeEventListener('input', this._input);
        this.textarea.removeEventListener('paste', this._paster);
    }
}