
import { BlockView } from "../../src/block/view";
import React from 'react';
import { prop, url, view } from "../../src/block/factory/observable";
import { TextArea, TextLineChilds } from "../../src/block/partial/appear";
import { BlockCssName, FontCss } from "../../src/block/pattern/css";
import { CssSelectorType } from "../../src/block/pattern/type";
import { BlockDisplay, BlockRenderRange } from "../../src/block/enum";
import { TextSpan } from "../../src/block/element/textspan";

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
    onChange(event: Event) {
        var input = event.target as HTMLInputElement;
        this.onUpdateProps({ checked: input.checked }, BlockRenderRange.self);
    }
    get patternState() {
        if (this.checked == true) return 'checked';
        return 'default';
    }
    get isContinuouslyCreated() {
        return true
    }
    get appearElements() {
        if (this.childs.length > 0) return []
        return this.__appearElements;
    }
    display = BlockDisplay.block;
}
@view('/todo')
export class ToDoView extends BlockView<ToDo>{
    render() {
        if (this.block.childs.length > 0) {
            return <span className='sy-block-todo' style={this.block.visibleStyle}>
                <input onMouseDown={e => e.stopPropagation()} type='checkbox' checked={this.block.checked} onChange={e => this.block.onChange(e.nativeEvent)} />
                <TextLineChilds ref={e => this.block.childsEl = e} childs={this.block.childs}></TextLineChilds>
            </span>
        }
        else {
            return <span className='sy-block-todo' style={this.block.visibleStyle}>
                <input onMouseDown={e => e.stopPropagation()} type='checkbox' checked={this.block.checked} onChange={e => this.block.onChange(e.nativeEvent)} />
                <span className='sy-block-todo-text'><TextArea ref={e => this.block.elementAppear({ el: e })} html={this.block.htmlContent}></TextArea></span>
            </span>
        }
    }
}