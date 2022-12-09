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
import { EditSvg, PlusSvg } from "../../../component/svgs";
import { BlockFactory } from "../../../src/block/factory/block.factory";
import { ActionDirective } from "../../../src/history/declare";
import { BlockChildKey } from "../../../src/block/constant";
import { Input } from "../../../component/view/input";
import { GridMap } from "../../../src/page/grid";

@url('/button/template')
export class ButtonTemplate extends Block {
    blocks: { childs: Block[] } = { childs: [] };
    expand: boolean = false;
    @prop()
    content = '添加待办事项';
    display = BlockDisplay.block;
    get multiLines() {
        return false;
    }
    init() {
        this.gridMap = new GridMap(this)
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
    async addTemplateInstance(event: React.MouseEvent) {
        var bs = await this.blocks.childs.asyncMap(async (block) => await block.cloneData());
        await this.page.onAction(ActionDirective.onButtonTemplateCreateInstance, async () => {
            var at = this.at;
            await this.parent.appendArrayBlockData(bs, at + 1, this.parent.hasSubChilds ? BlockChildKey.subChilds : BlockChildKey.childs);
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
            <div className="sy-button-template-box-title" onMouseDown={e => e.stopPropagation()}>
                <Input  value={this.block.content || '添加待办事项'} placeholder={'添加待办事项'} onChange={e => this.block.onLazyUpdateProps({ content: e },{range:BlockRenderRange.self})}></Input>
            </div>
            <Divider></Divider>
            <div className="sy-button-template-box-label">模板内容</div>
            <div className="sy-button-template-box-content min-h-30">
                <ChildsArea childs={this.block.blocks.childs}></ChildsArea>
            </div>
        </div>
    }
    render() {
        return <div style={this.block.visibleStyle}><div className='sy-button-template' >
            <div className='sy-button-template-wrapper' onMouseDown={e => e.stopPropagation()} >
                <a className="sy-button-template-btn flex" onMouseDown={e => this.block.addTemplateInstance(e)}><Icon size={18} icon={PlusSvg}></Icon><span>{this.block.content || '添加待办事项'}</span></a>
                <div className='sy-button-template-operator size-30 flex-center item-hover round cursor'><Icon size={16} onMousedown={e => this.block.openSettings()} icon={EditSvg}></Icon></div>
            </div>
            {this.block.expand == true && this.renderTemplate()}
        </div></div>
    }
}