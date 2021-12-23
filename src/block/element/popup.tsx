import React from 'react';
import { BlockView } from "../view";
import { url, view } from "../factory/observable";
import { Block } from '..';
import ReactDOM from 'react-dom';
import { ChildsArea } from '../view/appear';
@url('/popup')
export class Popup extends Block {
    get isView() {
        return true;
    }
}
/*** 在一个页面上，从视觉上有多个视图块，
 * 如每个页面都有一个初始的内容视图，不可拖动
 *  但页面可以会有弹层等一些其它的视图
 */
@view('/popup')
export class PopupView extends BlockView<Popup>{
    popupEl: HTMLElement;
    constructor(props) {
        super(props);
        this.popupEl = document.body.appendChild(document.createElement('div'));
    }
    render() {
        return ReactDOM.createPortal(<div className='sy-block-popup'>
            <ChildsArea childs={this.block.childs}></ChildsArea>
        </div>, this.popupEl);
    }
}
