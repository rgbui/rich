
import { BaseComponent } from "../base/component";
import React, { ChangeEvent } from 'react';
import { TextSpan } from "./textspan";

import { observable, prop, url, view } from "../factory/observable";
import { ChildsArea, TextArea } from "../base/appear";
import { BlockCssName, FontCss } from "../pattern/css";
import { CssSelectorType } from "../pattern/type";
import { BlockRenderRange } from "../base/enum";

@url('/todo')
export class ToDo extends TextSpan {
    init() {
        this.pattern.declare<FontCss>('checked', CssSelectorType.pseudo, {
            cssName: BlockCssName.font,
            textDecoration: 'line-through'
        });
    }
    @prop()
    checked: boolean = false;
    @observable('onChange')
    onChange(event: Event) {
        var input = event.target as HTMLInputElement;
        this.onUpdateProps({ checked: input.checked }, BlockRenderRange.self);
    }
    get patternState() {
        if (this.checked == true) return 'checked';
        return 'default';
    }
}
@view('/todo')
export class ToDoView extends BaseComponent<ToDo>{
    render() {

        if (this.block.childs.length > 0) {
            return <span className='sy-block-todo' style={this.block.visibleStyle}>
                <input onMouseDown={e => e.nativeEvent.stopPropagation()} type='checkbox' checked={this.block.checked} onChange={e => this.block.onChange(e.nativeEvent)} />
                <span ref={e => this.block.childsEl = e} className='sy-appear-text-line'><ChildsArea childs={this.block.childs}></ChildsArea></span>
            </span>
        }
        else {
            return <span className='sy-block-todo' style={this.block.visibleStyle}>
                <input onMouseDown={e => e.nativeEvent.stopPropagation()} type='checkbox' checked={this.block.checked} onChange={e => this.block.onChange(e.nativeEvent)} />
                <span className='sy-appear-text-line'><TextArea html={this.block.htmlContent}></TextArea></span>
            </span>
        }
    }
}