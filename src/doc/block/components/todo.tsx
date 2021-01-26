
import { BaseComponent } from "../base/component";
import React, { ChangeEvent } from 'react';
import { TextSpan } from "../common/textspan";
import { observable } from "../base/observable";
export class ToDo extends TextSpan {
    display: 'inline-block' = 'inline-block';
    @observable
    checked: boolean = false;
    onChange(event: ChangeEvent<HTMLInputElement>) {
        this.checked = event.target.checked;
    }
    mouseIsInTextArea(event: MouseEvent) {
        var ele = event.target as HTMLDivElement;
        if (ele && ele.tagName && ele.tagName.toLowerCase() == 'span' && !ele.classList.contains('block-todo'))
            return true;
        else return false;
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