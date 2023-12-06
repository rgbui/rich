import React from "react";
import { SettingsSvg, } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
import { BoxTip } from "../../../component/view/tooltip/box";
import { IconArguments } from "../../../extensions/icon/declare";
import { Block } from "../../../src/block";
import { prop, url, view } from "../../../src/block/factory/observable";
import { DragBlockLine } from "../../../src/kit/handle/line";
import { Input } from "../../../component/view/input";
import { Button } from "../../../component/view/button";
import { S } from "../../../i18n/view";
import { FlowView } from "../../../src/flow/view";
import { Flow } from "../../../src/flow";
import { useIconPicker } from "../../../extensions/icon";
import { Point, Rect } from "../../../src/common/vector/point";
import { BlockDirective, BlockRenderRange } from "../../../src/block/enum";
import { BlockView } from "../../../src/block/view";
import { MenuItem } from "../../../component/view/menu/declare";
import { lst } from "../../../i18n/store";
import lodash from "lodash";
import { util } from "../../../util/util";
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
    buttonSize: 'default' | 'larger' | 'small' = 'small';
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
    mousedown(event: React.MouseEvent) { }
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
            rg.name = undefined;
            rg.icon = { name: 'bytedance-icon', code: 'align-text-both' }
            rg.type = undefined;
            rg.childs = [
                {
                    name: 'text-center',
                    icon: { name: 'bytedance-icon', code: 'align-text-left' },
                    text: lst('居左'),
                    value: 'left',
                    checkLabel: this.align == 'left'
                },
                {
                    name: 'text-center',
                    icon: { name: 'bytedance-icon', code: 'align-text-center' },
                    text: lst('居中'), value: 'center', checkLabel: this.align == 'center'
                },
                {
                    name: 'text-center',
                    icon: {
                        name: 'bytedance-icon',
                        code: 'align-text-right'
                    },
                    text: lst('居右'),
                    value: 'right',
                    checkLabel: this.align == 'right'
                }
            ]
            var pos = rs.findIndex(g => g == rg);
            var ns: MenuItem<string | BlockDirective>[] = [];
            ns.push({
                text: lst('大小'),
                icon: { name: 'bytedance-icon', code: 'zoom-in' },
                childs: [
                    { name: 'buttonSize', text: lst('大'), value: 'larger', checkLabel: this.buttonSize == 'larger' },
                    { name: 'buttonSize', text: lst('中'), value: 'default', checkLabel: this.buttonSize == 'default' },
                    { name: 'buttonSize', text: lst('小'), value: 'small', checkLabel: this.buttonSize == 'small' }
                ]
            })
            ns.push({
                text: lst('按钮样式'),
                icon: { name: 'bytedance-icon', code: 'link-four' },
                childs: [
                    { name: 'ghost', text: lst('红色'), value: false, checkLabel: !this.ghost },
                    { name: 'ghost', text: lst('白色'), value: true, checkLabel: this.ghost }
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
            case 'text-center':
                await this.onUpdateProps({ [item.name == 'text-center' ? "align" : item.name]: item.value }, { range: BlockRenderRange.self })
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
    getVisibleHandleCursorPoint(): Point {
        if (this.el) {
            var db = this.el.querySelector('[data-button]') as HTMLElement;
            var bound = Rect.fromEle(db);
            if (bound) {
                var pos = Point.from(bound);
                pos = pos.move(0, 3 + util.remToPx(this.page.lineHeight) / 2);
                return pos;
            }
        }
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
        var style: React.CSSProperties = {};
        if (this.block.align == 'center') style.justifyContent = 'center';
        else if (this.block.align == 'right') style.justifyContent = 'flex-end'
        return <div className="visible-hover" style={this.block.visibleStyle}>
            <div className={"flex"} style={style}>
                <div className="relative" style={{ display: 'inline-block' }}>
                    <span data-button={true} onMouseDown={e => { e.stopPropagation(); this.block.onExcute() }} className={"relative flex flex-inline " + classList.join(" ")}>
                        {this.block.buttonIcon && <Icon size={18} className={this.block.buttonText ? 'gap-r-5' : ""} icon={this.block.buttonIcon}></Icon>}
                        {this.block.buttonText && <span>{this.block.buttonText}</span>}
                        {!this.block.buttonText && !this.block.buttonIcon && <span><S>按钮</S></span>}
                    </span>
                    {this.block.isCanEdit() && <span className="visible flex-center  pos-center-right-outside" onMouseDown={async e => {
                        e.stopPropagation();
                        this.openEdit(e)
                    }} >
                        <span className="cursor flex-center gap-l-5 size-20">   <Icon size={16} icon={SettingsSvg}></Icon></span>

                    </span>}
                </div>
            </div>
            {this.block.isEditFlow && <div className="relative" style={{ zIndex: 10 }}>
                {this.renderFlow()}
            </div>}
        </div>
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
        var style: React.CSSProperties = {};
        if (this.block.align == 'center') style.justifyContent = 'center';
        else if (this.block.align == 'right') style.justifyContent = 'flex-end'
        return <div className="pos flex" style={{ top: 0, left: 0, right: 0, ...style }}>
            <div className='min-w-400 max-w-600 round-6 padding-14 gap-h-10'
                style={{
                    top: 0,
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
        </div>
    }
}


