
import { BaseComponent } from "../base/component";
import React, { ChangeEvent } from 'react';
import { TextSpan } from "../common/textspan";
import { observable } from "../base/observable";
export class ToDo extends TextSpan {
    @observable
    checked: boolean = false;
    onChange(event: ChangeEvent<HTMLInputElement>) {
        this.checked = event.target.checked;
    }
}
export class ToDoView extends BaseComponent<ToDo>{
    render() {
        var style: Record<string, any> = {
            textDecoration: this.block.checked ? 'line-through' : 'none'
        }
        return <span className='block-todo' >
            <input type='checkbox' checked={this.block.checked} onChange={this.block.onChange.bind(this.block)} />
            <span style={style}>{this.block.content}</span>
        </span>
    }
}