
import { BaseComponent } from "../base/component";
import React, { ChangeEvent } from 'react';
import { TextSpan } from "./textspan";
import { BlockType } from "../base/enum";
import { observable, prop, url, view } from "../factory/observable";
@url('/todo')
export class ToDo extends TextSpan {
    get leftPart() {
        return this.findPart((n, e) => e.type == BlockType.text)
    }
    get rightPart() {
        return this.findPart((n, e) => e.type == BlockType.text)
    }
    @prop()
    checked: boolean = false;
    @observable('onChange')
    onChange(event: ChangeEvent<HTMLInputElement>) {
        this.setState({ checked: event.target.checked });
    }
}

@view('/todo')
export class ToDoView extends BaseComponent<ToDo>{
    render() {
        var style: Record<string, any> = {
            textDecoration: this.block.checked ? 'line-through' : 'none'
        }
        this.block.setPart('default', null, BlockType.text);
        if (this.block.childs.length > 0) {
            return <span className='block-todo' >
                <input type='checkbox' ref={e => this.block.setPart('content', e, BlockType.solid)} checked={this.block.checked} onChange={this.block.onChange.bind(this.block)} />
                <span style={style} >{this.block.childs.map(x =>
                    <x.viewComponent key={x.id} block={x}></x.viewComponent>
                )}</span>
            </span>
        }
        else {
            return <span className='block-todo' >
                <input type='checkbox' ref={e => this.block.setPart('content', e, BlockType.solid)} checked={this.block.checked} onChange={this.block.onChange.bind(this.block)} />
                <span style={style} ref={e => this.block.setPart('default', e, BlockType.text)}
                    dangerouslySetInnerHTML={this.block.htmlContent}></span>
            </span>
        }
    }
}