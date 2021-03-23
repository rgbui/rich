import React from 'react';
import { SelectorView } from './render';
export class TextInput extends React.Component<{ selectorView: SelectorView }> {
    constructor(props) {
        super(props);
    }
    textarea: HTMLTextAreaElement;
    onPaster(event: ClipboardEvent) {

    }
    onKeydown(event: KeyboardEvent) {

    }
    onBlur(event: FocusEvent) {

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
        ></textarea></div>
    }
}