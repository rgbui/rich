import { Block } from "../../../src/block";
import React from 'react';
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { BlockDisplay, BlockRenderRange } from "../../../src/block/enum";
import { ChildsArea, TextArea } from "../../../src/block/view/appear";
import { TextTurns } from "../../../src/block/turn/text";
import { Button } from "../../../component/view/button";
import { Icon } from "../../../component/view/icon";
import "./style.less";
import { Divider } from "../../../component/view/grid";
import { EditSvg } from "../../../component/svgs";
import { BlockFactory } from "../../../src/block/factory/block.factory";
import { ActionDirective } from "../../../src/history/declare";
import { BlockAppear } from "../../../src/block/appear";

@url('/button/template')
export class ButtonTemplate extends Block {
    blocks: { childs: Block[] } = { childs: [] };
    expand: boolean = false;
    @prop()
    content = '添加待办事项';
    display = BlockDisplay.block;
    /**
     * 当子元素处于折叠状态时，
     * 其对应的subChilds就不应搜到了，不参于编辑
     */
    get blockKeys() {
        var keys = Object.keys(this.blocks);
        if (this.expand == false) keys.remove('childs');
        return keys;
    }
    get multiLines() {
        return false;
    }
    get appearAnchors() {
        if (this.childs.length > 0) return []
        return this.__appearAnchors;
    }
    async onGetTurnUrls() {
        return [];
    }
    async getWillTurnData(url: string) {
        return await TextTurns.turn(this, url);
    }
    getChilds(key: string) {
        if (this.expand == false && key == 'subChilds') return [];
        return super.getChilds(key);
    }
    async addTemplateInstance(event: React.MouseEvent) {
        var bs = await this.blocks.childs.asyncMap(async (block) => await block.cloneData());
        await this.page.onAction(ActionDirective.onButtonTemplateCreateInstance, async () => {
            var at = this.at;
            await this.parent.appendArrayBlockData(bs, at + 1, this.parent.childKey);
        })
    }
    get isSupportTextStyle(): boolean {
        return false;
    }
    async openSettings() {
        this.expand = !this.expand;
        this.view.forceUpdate()
    }
    async onSave() {
        this.onUpdateProps({ expand: false }, { range: BlockRenderRange.self })
    }
    async didMounted(): Promise<void> {
        if (this.blocks.childs.length == 0) {
            this.initButtonTemplate();
        }
    }
    async initButtonTemplate() {
        this.blocks.childs.push(await BlockFactory.createBlock('/todo', this.page, { content: '待办' }, this));
    }
}
@view('/button/template')
export class ButtonTemplateView extends BlockView<ButtonTemplate>{
    renderTemplate() {
        if (this.block.expand != true) return <></>;
        return <div className="sy-button-template-box">
            <div className="sy-button-template-box-head">
                <span>编辑模板按钮</span>
                <Button onClick={e => this.block.onSave()}>保存</Button>
            </div>
            <Divider></Divider>
            <div className="sy-button-template-box-label">模板名称</div>
            <div className="sy-button-template-box-title">
                <TextArea block={this.block} prop='content' default='添加待办事项' placeholder={'添加待办事项'}></TextArea>
            </div>
            <Divider></Divider>
            <div className="sy-button-template-box-label">模板内容</div>
            <div className="sy-button-template-box-content">
                <ChildsArea childs={this.block.blocks.childs}></ChildsArea>
            </div>
        </div>
    }
    render() {
        return <div style={this.block.visibleStyle}><div className='sy-button-template' >
            <div className='sy-button-template-wrapper' onMouseDown={e => e.stopPropagation()} >
                <a className="sy-button-template-btn" onMouseDown={e => this.block.addTemplateInstance(e)}>+{this.block.content || '添加待办事项'}</a>
                <div className='sy-button-template-operator'><Icon onMousedown={e => this.block.openSettings()} icon={EditSvg}></Icon></div>
            </div>
            {this.block.expand == true && this.renderTemplate()}
        </div></div>
    }
}