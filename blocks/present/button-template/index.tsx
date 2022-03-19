import { Block } from "../../../src/block";
import React from 'react';
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { BlockDisplay, BlockRenderRange } from "../../../src/block/enum";
import { ChildsArea, TextArea, TextLineChilds } from "../../../src/block/view/appear";
import { TextTurns } from "../../../src/block/turn/text";
import { ActionDirective } from "../../../src/history/declare";
import { Button } from "../../../component/view/button";
import ChevronDown from "../../../src/assert/svg/chevronDown.svg";
import { Icon } from "../../../component/view/icon";
import "./style.less";

@url('/button/template')
export class ButtonTemplate extends Block {
    blocks: { childs: Block[], subChilds: Block[] } = { childs: [], subChilds: [] };
    @prop()
    expand: boolean = true;
    @prop()
    text: string = '';
    display = BlockDisplay.block;
    /**
     * 当子元素处于折叠状态时，
     * 其对应的subChilds就不应搜到了，不参于编辑
     */
    get blockKeys() {
        var keys = Object.keys(this.blocks);
        if (this.expand == false) keys.remove('subChilds');
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
    get childKey() {
        return 'subChilds';
    }
    getChilds(key: string) {
        if (this.expand == false && key == 'subChilds') return [];
        return super.getChilds(key);
    }
    async addTemplateInstance(event: React.MouseEvent) {
        var bs = await this.blocks.subChilds.asyncMap(async (block) => await block.cloneData());
        await this.page.onAction(ActionDirective.onButtonTemplateCreateInstance, async () => {
            var at = this.at;
            await this.parent.appendArrayBlockData(bs, at + 1, this.parent.childKey);
        })
    }
    get isSupportTextStyle(): boolean {
        return false;
    }
    async openSettings() {
        this.onUpdateProps({ expand: true }, BlockRenderRange.self)
    }
    async onSave() {
        this.onUpdateProps({ expand: false }, BlockRenderRange.self)
    }
}
@view('/button/template')
export class ButtonTemplateView extends BlockView<ButtonTemplate>{
    renderTemplate() {
        if (this.block.expand != true) return <></>;
        return <div className="sy-button-template-box">
            <div className="sy-button-template-box-head">
                <TextArea rf={e => this.block.elementAppear({ el: e, prop: 'text' })} html={this.block.text} placeholder={'键入文字或"/"选择'}></TextArea>
            </div>
            <div className="sy-button-template-box-content">
                <ChildsArea childs={this.block.blocks.subChilds}></ChildsArea>
            </div>
            <div className="sy-button-template-box-footer">
                <Button onClick={e => this.block.onSave()}>保存</Button>
            </div>
        </div>
    }
    render() {
        return <div className='sy-button-template' style={this.block.visibleStyle} >
            <div className="sy-button-template-btn">
                <a onMouseDown={e =>this.block.addTemplateInstance(e)}>+{this.block.text}</a>
            </div>
            <div className="sy-button-template-settings">
                <Icon mousedown={e => this.block.openSettings()} icon={ChevronDown}></Icon>
            </div>
            {this.block.expand == true && this.renderTemplate()}
        </div>
    }
}