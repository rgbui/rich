
import { BlockView } from "../../src/block/view";
import React from 'react';
import { prop, url, view } from "../../src/block/factory/observable";
import { ChildsArea, TextArea, TextLineChilds } from "../../src/block/view/appear";
import { BlockDisplay, BlockRenderRange } from "../../src/block/enum";
import { TextTurns } from "../../src/block/turn/text";
import "./style.less";
import { Block } from "../../src/block";
import { CheckboxSquareSvg, CheckSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { BlockChildKey } from "../../src/block/constant";
import { dom } from "../../src/common/dom";
import { DropDirection } from "../../src/kit/handle/direction";
import { lst } from "../../i18n/store";

@url('/todo')
export class ToDo extends Block {
    init() {
        super.init();
    }
    blocks: { childs: Block[], subChilds: Block[] } = { childs: [], subChilds: [] };
    get allBlockKeys() {
        return [BlockChildKey.childs, BlockChildKey.subChilds];
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
        return TextTurns.blockDatas()
    }
    async getWillTurnData(url: string) {
        return await TextTurns.turn(this, url);
    }
    get isBackspaceAutomaticallyTurnText() {
        return true;
    }
    async getPlain(this: Block) {
        if (this.childs.length > 0) return await this.getChildsPlain();
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
    get contentEl() {
        if (this.el)
            return this.el.querySelector('[data-block-content]') as HTMLElement;
        else return this.el;
    }
    async getHtml() {
        var quote = '';
        if (this.childs.length > 0) quote = `<p><input type='checkbox' ${this.checked ? " checked " : ""} />${(await this.childs.asyncMap(async c => c.getHtml())).join('')}</p>`
        else quote = `<p><input type='checkbox'  ${this.checked ? " checked " : ""} />${this.content}</p>`;
        if (this.subChilds.length > 0) {
            quote += (await this.childs.asyncMap(async c => c.getHtml())).join('')
        }
        return quote;
    }
    dropEnter(this: Block, direction: DropDirection) {
        var el = this.contentEl;
        var dire = DropDirection[direction];
        var className = 'shy-block-drag-over-' + dire;
        if (!el.classList.contains(className)) {
            dom(el).removeClass(g => g.startsWith('shy-block-drag-over'));
            el.classList.add(className);
        }
    }
    dropLeave(this: Block) {
        var el = this.contentEl;
        dom(el).removeClass(g => g.startsWith('shy-block-drag-over'));
    }
    async getMd() {
        var ps: string[] = [];
        if (this.childs.length > 0) ps.push(`[]  ` + (await this.childs.asyncMap(async c => { return await c.getMd() })).join(""))
        else ps.push('[]  ' + this.content)
        return ps.join('  ');
    }
}
@view('/todo')
export class ToDoView extends BlockView<ToDo>{
    renderView() {
        if (this.block.childs.length > 0) {
            return <div style={this.block.visibleStyle}>
                <div className='sy-block-todo' data-block-content style={this.block.contentStyle}>
                    <div className="sy-block-todo-checkbox-wrapper" style={{ height: this.block.page.lineHeight, width: this.block.page.lineHeight }}>
                        <div className={'sy-block-todo-checkbox' + (this.block.checked ? " checked" : "")} onMouseDown={e => this.block.onChange(!this.block.checked, e)}>
                            <Icon
                                size={(this.block.page.smallFont ? 14 : 16) + (this.block.checked ? -2 : 0)}
                                icon={this.block.checked ? CheckSvg : CheckboxSquareSvg} ></Icon>
                        </div>
                    </div>
                    <span style={{ lineHeight: this.block.page.lineHeight }}>
                        <TextLineChilds rf={e => this.block.childsEl = e} childs={this.block.childs}></TextLineChilds>
                    </span>
                </div>
                <div className='sy-block-todo-subs' style={{ paddingLeft: 20 }}>
                    <ChildsArea childs={this.block.blocks.subChilds}></ChildsArea>
                </div>
            </div>
        }
        else {
            return <div>
                <div style={this.block.visibleStyle}>
                    <div className='sy-block-todo' data-block-content style={this.block.contentStyle} >
                        <div className="sy-block-todo-checkbox-wrapper" style={{ height: this.block.page.lineHeight, width: this.block.page.lineHeight }}>
                            <div className={'sy-block-todo-checkbox' + (this.block.checked ? " checked" : "")} onMouseDown={e => this.block.onChange(!this.block.checked, e)}>
                                <Icon
                                    size={(this.block.page.smallFont ? 14 : 16) + (this.block.checked ? -2 : 0)}
                                    icon={this.block.checked ? CheckSvg : CheckboxSquareSvg} ></Icon>
                            </div>
                        </div>
                        <span className='sy-block-todo-text' style={{ lineHeight: this.block.page.lineHeight }} ><TextArea block={this.block} placeholder={lst('待办事项')}
                            prop='content'
                        ></TextArea>
                        </span>
                    </div>
                </div>
                <div className='sy-block-todo-subs' style={{ paddingLeft: 20 }}>
                    <ChildsArea childs={this.block.blocks.subChilds}></ChildsArea>
                </div>
            </div>
        }
    }
}