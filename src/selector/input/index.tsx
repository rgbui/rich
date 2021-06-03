import React from 'react';
import { Selector } from '..';

import { Point } from '../../common/point';
import { util } from '../../util/util';
import { Anchor } from '../selection/anchor';
import { TextInput$Paster } from './paste';
import { TextInput$Write } from './write';

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
        this.textarea.addEventListener('paste', this._paster = this.onPaste.bind(this));
    }
    componentWillUnmount() {
        this.textarea.removeEventListener('keydown', this._keydown);
        this.textarea.removeEventListener('input', this._input);
        this.textarea.removeEventListener('paste', this._paster);
    }
}

export interface TextInput extends TextInput$Write { }
util.inherit(TextInput, TextInput$Write);
export interface TextInput extends TextInput$Paster { }
util.inherit(TextInput, TextInput$Paster);