import React from "react";
import { DragHandleSvg, Edit1Svg, SettingsSvg, } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
import { BoxTip } from "../../../component/view/tooltip/box";
import { IconArguments } from "../../../extensions/icon/declare";
import { Block } from "../../../src/block";
import { prop, url, view } from "../../../src/block/factory/observable";
import { DragBlockLine } from "../../../src/kit/handle/line";
import { SolidArea } from "../../../src/block/view/appear";
import { Tip } from "../../../component/view/tooltip/tip";
import { Input } from "../../../component/view/input";
import { Button } from "../../../component/view/button";
import { S } from "../../../i18n/view";
import { FlowView } from "../../../src/flow/view";
import { Flow } from "../../../src/flow";
import { useIconPicker } from "../../../extensions/icon";
import { Rect } from "../../../src/common/vector/point";
import { BlockDirective, BlockRenderRange } from "../../../src/block/enum";
import { BlockView } from "../../../src/block/view";
import { MenuItem } from "../../../component/view/menu/declare";
import { lst } from "../../../i18n/store";
import lodash from "lodash";
import "./style.less";

@url('/button')
export class BlockButton extends Block {
    @prop()
    buttonIcon: IconArguments = null;
    @prop()
    buttonText: string = '';
    @prop()
    ghost: boolean = false;
    @prop()
    buttonSize: 'default' | 'larger' | 'small' = 'default';
    async getMd() {
        return '<button>' + this.buttonText + '</button>'
    }
    init(): void {
        this.registerPropMeta('flow', Flow, false, async (v) => {
            var flow = new Flow(this, this.page.ws);
            if (v) await flow.load(v);
            return flow;
        }, async (v) => {
            try {
                return await v.get()
            }
            catch (ex) {
                console.log(v);
                this.page.onError(ex);
                console.error(ex);
            }
        })
    }
    isEditFlow: boolean = false;
    mousedown(event: React.MouseEvent) {

    }
    @prop()
    flow: Flow = new Flow(this, this.page.ws);
    get isSupportTextStyle(): boolean {
        return false;
    }
    async get() {
        var dr = await super.get();
        dr.blocks = {};
        return dr;
    }
    @prop()
    align: 'left' | 'center' | 'right' = 'left';
    async onGetContextMenus() {
        var rs = await super.onGetContextMenus();
        var rg = rs.find(g => g.name == 'text-center');
        if (rg) {
            rg.text = lst('对齐');
            var pos = rs.findIndex(g => g == rg);
            var ns: MenuItem<string | BlockDirective>[] = [];
            ns.push({
                text: lst('大小'),
                icon: { name: 'bytedance-icon', code: 'zoom-in' },
                childs: [
                    { name: 'buttonSize', text: '大', value: 'larger', checkLabel: this.buttonSize == 'larger' },
                    { name: 'buttonSize', text: '中', value: 'default', checkLabel: this.buttonSize == 'default' },
                    { name: 'buttonSize', text: '小', value: 'small', checkLabel: this.buttonSize == 'small' }
                ]
            })
            ns.push({
                text: lst('按钮样式'),
                icon: { name: 'bytedance-icon', code: 'link-four' },
                childs: [
                    { name: 'ghost', text: '红色', value: false, checkLabel: !this.ghost },
                    { name: 'ghost', text: '白色', value: true, checkLabel: this.ghost }
                ]
            })
            rs.splice(pos + 1, 0, ...ns)
            lodash.remove(rs, g => g.name == 'color');
        }
        return rs;
    }
    async onClickContextMenu(item: MenuItem<string | BlockDirective>, e) {
        switch (item.name) {
            case 'ghost':
            case 'buttonSize':
                await this.onUpdateProps({ [item.name]: item.value }, { range: BlockRenderRange.self })
                return
        }
        return await super.onClickContextMenu(item, e);
    }
    async onExcute() {
        if (this.flow) this.flow.run()
    }
    isFormSubmit() {
        if (this.flow) {
            return this.flow.commands.exists(s => s.url == '/form/submit')
        }
        return false;
    }
}
@view('/button')
export class BlockButtonView extends BlockView<BlockButton>{
    boxTip: BoxTip;
    dragBlock(event: React.MouseEvent) {
        DragBlockLine(this.block, event);
    }
    oldFlow: Flow;
    async openEdit(event: React.MouseEvent) {
        this.block.isEditFlow = !this.block.isEditFlow;
        if (this.block.isEditFlow) {
            this.oldFlow = await this.block.flow.clone();
        }
        if (this.block.isEditFlow == false) return await this.onSave()
        this.forceUpdate()
    }
    renderView() {
        var classList: string[] = ['sy-button'];
        if (this.block.buttonSize) classList.push('sy-button-' + this.block.buttonSize);
        if (this.block.ghost) classList.push('sy-button-ghost');
        if (this.block.isLine) {
            return <span>
                <BoxTip
                    ref={e => this.boxTip = e}
                    overlay={<div className="flex h-30 round padding-w-5">
                        <Tip text={'拖动'}><a className="flex-center size-24 round item-hover gap-5 cursor text" onMouseDown={e => this.dragBlock(e)} ><Icon size={16} icon={DragHandleSvg}></Icon></a></Tip>
                        <Tip text={'编辑'}><span className="flex-center text-1  item-hover size-24 round cursor" onMouseDown={e => this.openEdit(e)}><Icon size={16} icon={Edit1Svg}></Icon></span></Tip>
                    </div>}>
                    <SolidArea gap block={this.block} prop={'content'}><button className={'flex ' + classList.join(' ')}
                        onMouseDown={e => this.block.mousedown(e)}>
                        {this.block.buttonIcon && <Icon icon={this.block.buttonIcon}></Icon>}
                        <span>{this.block.buttonText}</span>
                    </button>
                    </SolidArea>
                </BoxTip>
            </span>
        }
        else {
            return <div className="visible-hover" style={this.block.visibleStyle}>
                <div className={"flex" + (this.block.align == 'center' ? " flex-center" : "")}>
                    <div onMouseDown={e => { e.stopPropagation(); this.block.onExcute() }} className={"flex flex-inline " + classList.join(" ")}>
                        {this.block.buttonIcon && <Icon size={18} className={this.block.buttonText ? 'gap-r-5' : ""} icon={this.block.buttonIcon}></Icon>}
                        {this.block.buttonText && <span>{this.block.buttonText}</span>}
                        {!this.block.buttonText && !this.block.buttonIcon && <span><S>按钮</S></span>}
                    </div>
                    <span className="visible cursor flex-center " onClick={async e => {
                        this.openEdit(e)
                    }} ><Icon size={16} icon={SettingsSvg}></Icon></span>
                </div>
                {this.block.isEditFlow && <div className="relative">
                    {this.renderFlow()}
                </div>}
            </div>
        }
    }
    async onSave() {
        await this.block.onManualUpdateProps({
            flow: this.oldFlow
        }, { flow: this.block.flow })
        this.forceUpdate();
    }
    async changeIcon(event: React.MouseEvent) {
        var r = await useIconPicker({
            roundArea: Rect.fromEle(event.currentTarget as HTMLElement)
        });
        if (r) {
            await this.block.onUpdateProps({ buttonIcon: r })
            this.forceUpdate();
        }
    }
    renderFlow() {
        return <div className='min-w-300 max-w-600 round-6 padding-14 gap-h-10'
            style={{
                background: 'rgb(251, 251, 250)',
                border: '1px solid rgba(55, 53, 47, 0.09)'
            }}>
            <div className="flex" onMouseDown={e => { e.stopPropagation() }}>
                <span className="border size-24 round cursor flex-center"><Icon size={18} onMousedown={e => this.changeIcon(e)} icon={this.block.buttonIcon || { name: 'bytedance-icon', code: 'smiling-face' }}></Icon></span>
                <span className="flex-auto gap-w-10"><Input value={this.block.buttonText} onChange={e => {
                    this.block.buttonText = e;
                }} onEnter={e => {
                    this.onSave()
                }}></Input></span>
                <span className="flex-fixed"><Button onClick={async (e, b) => {
                    this.openEdit(e)
                }}><S>保存</S></Button></span>
            </div>
            <div>
                {this.block.flow && <FlowView flow={this.block.flow}></FlowView>}
            </div>
        </div>
    }
}


