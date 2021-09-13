import React from "react";
import { TextInput } from "..";
import { Point } from "../../../common/point";
import { Anchor } from "../../selection/anchor";

export class TextInputView extends React.Component<{ textInput: TextInput }>{
    constructor(props) {
        super(props);
        this.textInput.view = this;
    }
    textarea: HTMLTextAreaElement;
    get textInput() {
        return this.props.textInput;
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
    render() {
        return <div className='shy-selector-textinput'><textarea
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
    private _paste;
    private _keydown;
    private _input;
    private _compositionstart;
    private _compositionend;
    componentDidMount() {
        this.textarea.addEventListener('keydown', this._keydown = (event) => this.textInput.onKeydown(event));
        this.textarea.addEventListener('input', this._input = (event) => this.textInput.onInput(event));
        this.textarea.addEventListener('paste', this._paste = (event) => this.textInput.onPaste(event));
        // this.textarea.addEventListener('compositionstart', this._compositionstart = (event) => this.textInput.inputProcedure.compositionstart(event));
        // this.textarea.addEventListener('compositionend', this._compositionend = (event) => this.textInput.inputProcedure.compositionend(event));
    }
    componentWillUnmount() {
        this.textarea.removeEventListener('keydown', this._keydown);
        this.textarea.removeEventListener('input', this._input);
        this.textarea.removeEventListener('paste', this._paste);
        // this.textarea.removeEventListener('compositionstart', this._compositionstart);
        // this.textarea.removeEventListener('compositionend', this._compositionend);
    }
}