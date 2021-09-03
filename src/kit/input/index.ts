
import { Point } from '../../common/point';
import { Anchor } from '../selection/anchor';
import { TextInput$Paster } from './paste';
import { TextInput$Write } from './write';
import { Kit } from '..';
import { TextInputView } from './view';
import { Events } from '../../../util/events';
import { Mix } from '../../../util/mix';

export class TextInput extends Events {
    kit: Kit;
    constructor(kit: Kit) {
        super();
        this.__init_mixs();
        this.kit = kit;
    }

    get explorer() {
        return this.kit.explorer;
    }
    get page() {
        return this.kit.page;
    }
    view: TextInputView;
    get textarea() {
        return this.view.textarea;
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
    followAnchor(anchor: Anchor) {
        if (anchor) {
            var bound = anchor.bound;
            var point = Point.from(bound);
            this.textarea.style.top = point.y + 'px';
            this.textarea.style.left = (point.x + 0) + 'px';
            this.textarea.style.height = bound.height + 'px';
        }
    }
}
export interface TextInput extends TextInput$Write { }
export interface TextInput extends TextInput$Paster { }
export interface TextInput extends Mix { }
Mix(TextInput, TextInput$Write, TextInput$Paster)
