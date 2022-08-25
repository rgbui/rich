
import { BlockView } from "../../src/block/view";
import React from 'react';
import { prop, url, view } from "../../src/block/factory/observable";
import { TextArea, TextLineChilds } from "../../src/block/view/appear";
import { BlockDisplay, BlockRenderRange } from "../../src/block/enum";
import { langProvider } from "../../i18n/provider";
import { LangID } from "../../i18n/declare";
import { TextTurns } from "../../src/block/turn/text";
import "./style.less";
import { Block } from "../../src/block";
import { CheckboxSquareSvg, CheckSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";

@url('/todo')
export class ToDo extends Block {
    init() {
        super.init();
    }
    @prop()
    checked: boolean = false;
    onChange(checked: boolean, event: React.MouseEvent) {
        event.stopPropagation();
        this.onUpdateProps({ checked }, { range: BlockRenderRange.self });
    }
    get isContinuouslyCreated() {
        return true
    }
    get appearAnchors() {
        if (this.childs.length > 0) return []
        return this.__appearAnchors;
    }
    display = BlockDisplay.block;
    async onGetTurnUrls() {
        return TextTurns.urls
    }
    async getWillTurnData(url: string) {
        return await TextTurns.turn(this, url);
    }
    get isBackspaceAutomaticallyTurnText() {
        return true;
    }
    async getPlain(this: Block) {
        if (this.childs.length > 0)
            return await this.getChildsPlain();
        else return this.content;
    }
    get visibleStyle() {
        var style = super.visibleStyle;
        if (this.checked == true) {
            style.color = 'rgba(55,53,47,0.65)';
            style.textDecoration = 'line-through';
        }
        return style;
    }
}
@view('/todo')
export class ToDoView extends BlockView<ToDo>{
    render() {
        if (this.block.childs.length > 0) {
            return <div style={this.block.visibleStyle}><div className='sy-block-todo' style={this.block.contentStyle}>
                <div className="sy-block-todo-checkbox-wrapper" style={{ height: this.block.page.lineHeight, width: this.block.page.lineHeight }}>
                    <div className={'sy-block-todo-checkbox' + (this.block.checked ? " checked" : "")} onMouseDown={e => this.block.onChange(!this.block.checked, e)}>
                        <Icon size={this.block.checked ? 14 : 16} icon={this.block.checked ? CheckSvg : CheckboxSquareSvg} ></Icon>
                    </div>
                </div>
                <TextLineChilds rf={e => this.block.childsEl = e} childs={this.block.childs}></TextLineChilds>
            </div>
            </div>
        }
        else {
            return <div style={this.block.visibleStyle}><div className='sy-block-todo' style={this.block.contentStyle} >
                <div className="sy-block-todo-checkbox-wrapper" style={{ height: this.block.page.lineHeight, width: this.block.page.lineHeight }}>
                    <div className={'sy-block-todo-checkbox' + (this.block.checked ? " checked" : "")} onMouseDown={e => this.block.onChange(!this.block.checked, e)}>
                        <Icon size={this.block.checked ? 14 : 16} icon={this.block.checked ? CheckSvg : CheckboxSquareSvg} ></Icon>
                    </div>
                </div>
                <span className='sy-block-todo-text'><TextArea block={this.block} placeholder={langProvider.getText(LangID.todoPlaceholder)}
                    prop='content'
                ></TextArea>
                </span>
            </div>
            </div>
        }
    }
}