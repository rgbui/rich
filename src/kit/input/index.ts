
import { Point } from '../../common/point';
import { util } from '../../util/util';
import { Anchor } from '../selection/anchor';
import { TextInput$Paster } from './paste';
import { TextInput$Write } from './write';
import { Kit } from '..';
import { TextInputView } from './view';
import { Events } from '../../util/events';

export class TextInput extends Events {
    kit: Kit;
    constructor(kit: Kit) {
        super();
        this.kit = kit;
    }
    get explorer() {
        return this.kit.explorer;
    }
    get blockSelector() {
        return this.kit.page.blockSelector;
    }
    get page(){
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
        var bound = anchor.bound;
        var point = Point.from(bound);
        this.textarea.style.top = point.y + 'px';
        this.textarea.style.left = point.x + 'px';
        this.textarea.style.height = bound.height + 'px';
    }
}

// export class TextInput extends React.Component<{ selector: Selector }> {
//     constructor(props) {
//         super(props);
//     }
//     get selector() {
//         return this.props.selector;
//     }

//     textarea: HTMLTextAreaElement;

//     render() {
//         return <div className='sy-selector-textinput'><textarea
//             ref={e => this.textarea = e}
//         ></textarea></div>
//     }

//     private _paster;
//     private _keydown;
//     private _input;
//     componentDidMount() {
//         this.textarea.addEventListener('keydown', this._keydown = this.onKeydown.bind(this));
//         this.textarea.addEventListener('input', this._input = this.onInput.bind(this));
//         this.textarea.addEventListener('paste', this._paster = this.onPaste.bind(this));
//     }
//     componentWillUnmount() {
//         this.textarea.removeEventListener('keydown', this._keydown);
//         this.textarea.removeEventListener('input', this._input);
//         this.textarea.removeEventListener('paste', this._paster);
//     }
// }

export interface TextInput extends TextInput$Write { }
util.inherit(TextInput, TextInput$Write);
export interface TextInput extends TextInput$Paster { }
util.inherit(TextInput, TextInput$Paster);