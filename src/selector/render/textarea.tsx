import React from 'react';
import { SelectorView } from './render';
export class TextInput extends React.Component<{ selectorView: SelectorView }> {
    constructor(props) {
        super(props);
    }
    get selectorView() {
        return this.props.selectorView;
    }
    get selector() {
        return this.selectorView.selector;
    }
    textarea: HTMLTextAreaElement;
    onPaster(event: ClipboardEvent) {
        if (event.clipboardData.files && event.clipboardData.files.length > 0) {
            /**
             * 复制文件
             */
        }
        else {

        }
    }
    private isKeydown: boolean = false;
    onKeydown(event: KeyboardEvent) {
        this.isKeydown = false;
        switch (event.key) {
            case 'ArrowDown':
            case 'ArrowUp':
            case 'ArrowLeft':
            case 'ArrowRight':
                if (this.selector.hasSelectionRange) {
                    return this.selector.onCancelSelection();
                }
                else if (this.selector.isOnlyOneAnchor) {
                    return this.selector.onKeyArrow(event.key);
                }
                break;
            case 'Enter':
                if (this.selector.hasSelectionRange) {

                }
                else if (this.selector.isOnlyOneAnchor) {
                    if (this.selector.activeAnchor.isText) {
                        if (this.selector.activeAnchor.isEnd) {
                            //换行接着创建一个新的block
                            return this.selector.onCreateBlockByEnter();
                        }
                    }
                }
                break;
            case 'Delete':
            case 'Backspace':
                if (this.selector.hasSelectionRange) {
                    //删除选区
                    return this.selector.onKeyDelete()
                }
                else if (this.selector.isOnlyOneAnchor) {
                    if (this.selector.activeAnchor.isText) {
                        if (!this.textarea.value)
                            return this.selector.onKeyDelete();
                    }
                    else return this.selector.onKeyDelete()
                }
                break;
        }
        this.isKeydown = true;
    }
    onKeyup(event: KeyboardEvent) {
        if (this.isKeydown == true) {
            var value = this.textarea.value;
        }
    }
    onBlur(event: FocusEvent) {
        var self = this;
        var relatedTarget = event.relatedTarget;
        if (!relatedTarget || relatedTarget && !self.selector.page.el.contains(relatedTarget as HTMLDivElement))
            self.selector.page.onBlur(event);
    }
    onFocus() {
        if (document.activeElement !== this.textarea) {
            this.textarea.focus();
        }
    }
    render() {
        return <div className='sy-selector-textinput'><textarea
            ref={e => this.textarea = e}
            onPaste={e => this.onPaster(e.nativeEvent)}
            onBlur={e => this.onBlur(e.nativeEvent)}
            onKeyDown={e => this.onKeydown(e.nativeEvent)}
            onKeyUp={e => this.onKeyup(e.nativeEvent)}
        ></textarea></div>
    }
}