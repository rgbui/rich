
import { BaseComponent } from "../base/component";
import React, { ChangeEvent } from 'react';
import { TextSpan } from "./textspan";

import { observable, prop, url, view } from "../factory/observable";
import { ChildsArea, TextArea } from "../base/appear";
@url('/todo')
export class ToDo extends TextSpan {
    @prop()
    checked: boolean = false;
    @observable('onChange')
    onChange(event: Event) {
        var input = event.target as HTMLInputElement;
        //this.setState({ checked: input.checked });
    }
}
@view('/todo')
export class ToDoView extends BaseComponent<ToDo>{
    render() {
        var style: Record<string, any> = {
            textDecoration: this.block.checked ? 'line-through' : 'none'
        }
        if (this.block.childs.length > 0) {
            return <span className='sy-block-todo' style={this.block.visibleStyle}>
                <input onMouseDown={e => e.nativeEvent.stopPropagation()} type='checkbox' checked={this.block.checked} onChange={e => this.block.onChange(e.nativeEvent)} />
                <span style={style} ref={e => this.block.childsEl = e}><ChildsArea childs={this.block.childs}></ChildsArea></span>
            </span>
        }
        else {
            return <span className='sy-block-todo' style={this.block.visibleStyle}>
                <input type='checkbox' checked={this.block.checked} onChange={e => this.block.onChange(e.nativeEvent)} />
                <span style={style}> <TextArea html={this.block.htmlContent}></TextArea></span>
            </span>
        }
    }
}