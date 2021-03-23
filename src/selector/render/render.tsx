import { Component } from "react";
import { Selector } from "..";
import React from 'react';
import ReactDOM from 'react-dom';

import { Anchor } from "../anchor";

import { Icon } from "../../component/icon";
import Tooltip from "rc-tooltip";
import { TextInput } from "./textarea";
export class SelectorView extends Component<{ selector: Selector }>{
    constructor(props) {
        super(props);
        this.props.selector.view = this;
    }
    get selector() {
        return this.props.selector;
    }
    el: HTMLDivElement;
    componentDidMount() {
        this.el = ReactDOM.findDOMNode(this) as HTMLDivElement;
    }
    // textarea: HTMLTextAreaElement;
    // cursorEle: HTMLDivElement;
    // cursorTimer;
    // openCursor() {
    //     var self = this;
    //     if (self.cursorEle) {
    //         self.cursorEle.style.visibility = 'visible';
    //         if (typeof this.cursorTimer != 'undefined') {
    //             clearInterval(this.cursorTimer);
    //             delete this.cursorTimer;
    //         }
    //         if (typeof this.cursorTimer == 'undefined')
    //             this.cursorTimer = setInterval(function () {
    //                 if (self.cursorEle)
    //                     self.cursorEle.style.visibility = self.cursorEle.style.visibility == 'hidden' ? "visible" : "hidden"
    //             }, 7e2);
    //     }
    // }
    // closeCursor() {
    //     if (this.cursorTimer) {
    //         clearInterval(this.cursorTimer);
    //         if (this.cursorEle)
    //             this.cursorEle.style.visibility = 'hidden';
    //         delete this.cursorTimer;
    //     }
    // }
    // renderCursor() {
    //     if (this.selector.isOnlyAnchor) {
    //         if (this.selector.cursorAnchor) {
    //             var cursorStyle: Record<string, any> = {};
    //             var parentBound = this.bound;
    //             if (this.selector.cursorAnchor.isText) {
    //                 try {
    //                     var location = this.selector.cursorAnchor.point;
    //                     var fontStyle = TextEle(this.selector.cursorAnchor.el);
    //                     cursorStyle = {
    //                         top: location.y - parentBound.top,
    //                         left: location.x - parentBound.left,
    //                         color: fontStyle.color,
    //                         height: fontStyle.lineHeight,
    //                         visibility: 'visible'
    //                     }
    //                     this.openCursor();
    //                 }
    //                 catch (e) {
    //                     this.selector.page.onError(e);
    //                     throw e;
    //                 }
    //             }
    //             else {
    //                 this.closeCursor();
    //                 cursorStyle = {
    //                     visibility: 'hidden'
    //                 };
    //             }
    //             return <div className='kanhai-selector-cursor' style={cursorStyle} ref={e => this.cursorEle = e}></div>
    //         }
    //     }
    // }
    // renderRects() {
    //     if (this.selector.isOnlyAnchor && this.selector.cursorAnchor && !this.selector.cursorAnchor.isText) {
    //         var parentBound = this.bound;
    //         var rects: { anchor: Anchor, style: { left: number, top: number, width: number, height: number } }[] = [];
    //         var contentEl: HTMLElement = this.selector.cursorAnchor.block.el;
    //         if (this.selector.cursorAnchor.block.isPart) {
    //             var content = this.selector.cursorAnchor.block.findPart((name, e) => e.type == BlockType.solid);
    //             if (content) contentEl = content.el;
    //         }
    //         var bound = contentEl.getBoundingClientRect();
    //         rects.push({
    //             anchor: this.selector.cursorAnchor,
    //             style: {
    //                 left: bound.left - parentBound.left,
    //                 top: bound.top - parentBound.top,
    //                 width: bound.width,
    //                 height: bound.height
    //             }
    //         })
    //         return <div className='kanhai-selector-rects'>
    //             {rects.map(x => {
    //                 return <div key={x.anchor.block.id} className='kanhai-selector-rects-rect' style={x.style}></div>
    //             })}
    //         </div>
    //     }
    // }
    // operatorElement: HTMLElement;
    // renderOperators() {
    //     var style: Record<string, any> = {};
    //     if (this.selector.page.overBlock) {
    //         var block = this.selector.page.overBlock;
    //         if (block.isLine) {
    //             block = block.closest(x => !x.isLine);
    //         }
    //         var el = block.el as HTMLElement;
    //         var elBound = el.getBoundingClientRect();
    //         var parentBound = this.bound;
    //         style = Object.assign(style, {
    //             top: elBound.top - parentBound.top,
    //             left: elBound.left - parentBound.left - 24
    //         });
    //     }
    //     else style = { display: 'none' };
    //     return <div className='kanhai-selector-operators' ref={e => this.operatorElement = e} style={style}>
    //         <Tooltip overlay={
    //             <div>
    //                 <span>点击</span><span>打开菜单</span><br />
    //                 <span>拖拽</span><span>可移动位置</span><br />
    //             </div>
    //         }
    //             placement="bottom"
    //             arrowContent={<div className="rc-tooltip-arrow-inner"></div>}
    //         >
    //             <span onMouseDown={e => this.selector.onOperatorMousedown(e.nativeEvent)}><Icon icon='th-large:fa' ></Icon></span>
    //         </Tooltip>
    //     </div>
    // }
    // textareaBlur(event: FocusEvent) {
    //     var self = this;
    //     var relatedTarget = event.relatedTarget;
    //     if (!relatedTarget || relatedTarget && !self.selector.page.el.contains(relatedTarget as HTMLDivElement))
    //         self.selector.page.onBlur(event);
    // }
    // get bound() {
    //     return this.el.getBoundingClientRect();
    // }
    /***
     * 选择器渲染
     * kanhai-selector-cursor 光标
     * textarea 模拟的输入框
     * kanhai-selector-selections 选区，可以有多块选区
     * kanhai-selector-box 一个矩形选择框，呈现一个矩形用于选择一定范围内的block
     * kanhai-selector-rects 实体内容的block选择，如图像，可以有多个,可能还需要考虑旋转
     * kanhai-selector-operators 选中后弹出的操作按钮，如notion上面的拖动按钮或向上向下插入光标
     * kanhai-selector-drops 表示用户输入@或转义符触发一个下拉框选项
     * 
     */
    textInput: TextInput;
    render() {
        return <div className='sy-selector'>
            <TextInput ref={e => this.textInput = e} selectorView={this}></TextInput>
        </div>
        // return <div className='kanhai-selector'
        //     onMouseEnter={e => this.selector.onMouseEnter(e.nativeEvent)}
        //     onMouseLeave={e => this.selector.onMouseLeave(e.nativeEvent)}
        // >
        //     {this.el && this.renderCursor()}
        //     <div className='kanhai-selector-selections'></div>
        //     <div className='kanhai-selector-box'></div>
        //     {this.el && this.renderRects()}
        //     {this.el && this.renderOperators()}
        //     <div className='kanhai-selector-drops'></div>
        //     <textarea ref={e => this.textarea = e}
        //         onPaste={e => this.selector.onPaster(e.nativeEvent)}
        //         onBlur={e => this.textareaBlur(e.nativeEvent)}
        //         onKeyDown={this.selector.onKeydown.bind(this.selector)}></textarea>
        // </div>
    }
    renderSelection() {
        this.selector.selections.each(sel => {
            if (sel.isEmpty) {

            }
            else if (sel.isOnlyAnchor) {
                var onlyAnchor = sel.onlyAnchor;
                onlyAnchor.visible();
            }
            else {

            }
        })
    }
}