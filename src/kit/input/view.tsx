import React from "react";
import { TextInput } from ".";
import { Point } from "../../common/point";
import { Anchor } from "../selection/anchor";


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
    private _paster;
    private _keydown;
    private _input;
    componentDidMount() {
        this.textarea.addEventListener('keydown', this._keydown = this.textInput.onKeydown.bind(this.textInput));
        this.textarea.addEventListener('input', this._input = this.textInput.onInput.bind(this.textInput));
        this.textarea.addEventListener('paste', this._paster = this.textInput.onPaste.bind(this.textInput));
    }
    componentWillUnmount() {
        this.textarea.removeEventListener('keydown', this._keydown);
        this.textarea.removeEventListener('input', this._input);
        this.textarea.removeEventListener('paste', this._paster);
    }
}