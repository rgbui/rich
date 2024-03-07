import React from "react";
import { SettingsSvg, } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
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
import { MenuItem, MenuItemType } from "../../../component/view/menu/declare";
import { lst } from "../../../i18n/store";
import lodash from "lodash";
import { util } from "../../../util/util";
import { popoverLayer } from "../../../component/lib/zindex";
import "./style.less";
import { FixBoxTip } from "../../../component/view/tooltip/fix";
import { assyDivPanel } from "../../../component/types";
import { Tip } from "../../../component/view/tooltip/tip";

@url('/button')
export class BlockButton extends Block {
    @prop()
    buttonIcon: IconArguments = null;
    @prop()
    buttonText: string = '';
    @prop()
    buttonStyle: 'primary' | 'ghost' | 'dark' | 'green' | 'blue' | 'purple' = 'primary'
    @prop()
    buttonSize: 'default' | 'larger' | 'small' = 'default';
    @prop()
    buttonIsBlock: boolean = false;
    async getMd() {
        return '<button>' + this.buttonText + '</button>'
    }
    init() {
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
    isOpenFlow: boolean = false;
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
    @prop()
    iconAlign: 'left' | 'right' = 'left';
    async onGetContextMenus() {
        var rs = await super.onGetContextMenus();
        var rg = rs.find(g => g.name == 'text-center');
        if (rg) {
            rg.text = lst('对齐');
            rg.name = undefined;
            rg.icon = { name: 'byte', code: 'align-text-both' }
            rg.type = undefined;
            rg.childs = [
                {
                    name: 'text-center',
                    icon: { name: 'byte', code: 'align-text-left' },
                    text: lst('居左'),
                    value: 'left',
                    checkLabel: this.align == 'left'
                },
                {
                    name: 'text-center',
                    icon: { name: 'byte', code: 'align-text-center' },
                    text: lst('居中'),
                    value: 'center',
                    checkLabel: this.align == 'center'
                },
                {
                    name: 'text-center',
                    icon: {
                        name: 'byte',
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
                type: MenuItemType.switch,
                icon: { name: 'byte', code: 'auto-width' },
                text: lst('充满'),
                name: 'buttonIsBlock',
                checked: this.buttonIsBlock
            })
            ns.push({
                type: MenuItemType.switch,
                icon: { name: 'byte', code: 'align-right' },
                text: lst('图标在右边'),
                name: 'iconAlign',
                checked: this.iconAlign == 'right' ? true : false
            })
            ns.push({ type: MenuItemType.divide })
            ns.push({
                text: lst('尺寸'),
                icon: { name: 'bytedance-icon', code: 'zoom-in' },
                childs: [
                    { name: 'buttonSize', text: lst('大'), value: 'larger', checkLabel: this.buttonSize == 'larger' },
                    { name: 'buttonSize', text: lst('中'), value: 'default', checkLabel: this.buttonSize == 'default' },
                    { name: 'buttonSize', text: lst('小'), value: 'small', checkLabel: this.buttonSize == 'small' }
                ]
            })
            ns.push({
                text: lst('主题'),
                icon: { name: 'bytedance-icon', code: 'link-four' },
                childs: [
                    { name: 'buttonStyle', text: lst('红色'), value: 'primary', checkLabel: this.buttonStyle == 'primary' },
                    { name: 'buttonStyle', text: lst('蓝色'), value: 'blue', checkLabel: this.buttonStyle == 'blue' },
                    { name: 'buttonStyle', text: lst('绿色'), value: 'green', checkLabel: this.buttonStyle == 'green' },
                    { name: 'buttonStyle', text: lst('紫色'), value: 'purple', checkLabel: this.buttonStyle == 'purple' },
                    { name: 'buttonStyle', text: lst('黑色'), value: 'dark', checkLabel: this.buttonStyle == 'dark' },
                    { name: 'buttonStyle', text: lst('白色'), value: 'ghost', checkLabel: this.buttonStyle == 'ghost' },
                    { type: MenuItemType.divide },
                    { name: 'buttonStyle', text: lst('链接'), value: 'link' }
                ]
            })
            rs.splice(pos + 1, 0, ...ns)
            lodash.remove(rs, g => g.name == 'color');
        }
        return rs;
    }
    async onContextMenuInput(this: Block, item: MenuItem<BlockDirective | string>) {
        if (['buttonIsBlock'].includes(item.name as string)) {
            await this.onUpdateProps({ [item.name]: item.checked }, { range: BlockRenderRange.self });
            return;
        }
        else if (['iconAlign'].includes(item.name as string)) {
            await this.onUpdateProps({ 'iconAlign': item.checked ? "right" : 'left' }, { range: BlockRenderRange.self });
            return;
        }
        else await super.onContextMenuInput(item);
    }
    async onClickContextMenu(item: MenuItem<string | BlockDirective>, e) {
        switch (item.name) {
            case 'buttonIsBlock':
                await this.onUpdateProps({ [item.name]: item.checked }, { range: BlockRenderRange.self });
                break;
            case 'buttonStyle':
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
                pos = pos.move(0, (this.buttonSize == 'small' ? 0 : 3) + util.remToPx(this.page.lineHeight) / 2);
                return pos;
            }
        }
    }
    async didMounted() {
        document.body.addEventListener('mousedown', this.otherClick, true)

    }
    async didUnmounted() {
        popoverLayer.clear(this);
        document.body.removeEventListener('mousedown', this.otherClick, true)
    }
    otherClick = async (event: MouseEvent) => {
        var ele = event.target as HTMLElement;
        if (!this.el) return;
        if (this.el && ele && this.el.contains(ele))
            return;
        if (this.page.kit.view?.el.contains(ele))
            return;
        if (assyDivPanel().contains(ele)) return;
        await (this.view as any).boxTip.close();
    }
}

@view('/button')
export class BlockButtonView extends BlockView<BlockButton>{
    boxTip: FixBoxTip;
    dragBlock(event: React.MouseEvent) {
        DragBlockLine(this.block, event);
    }
    didMount(): void {
        this.load()
    }
    async load() {
        this.oldFlow = await this.block.flow.clone();
    }
    oldFlow: Flow;
    async openEdit(event: React.MouseEvent) {
        if (this.boxTip) {
            this.boxTip.toggle();
        }
    }
    renderView() {
        var classList: string[] = ['sy-button'];
        if (this.block.buttonSize) classList.push('sy-button-' + this.block.buttonSize);
        if (this.block.buttonStyle) classList.push('sy-button-' + this.block.buttonStyle);
        if (!this.block.buttonIsBlock) classList.push('flex-inline');
        var style: React.CSSProperties = {};
        if (this.block.align == 'center') style.justifyContent = 'center';
        else if (this.block.align == 'right') style.justifyContent = 'flex-end';
        return <div className="visible-hover" style={this.block.visibleStyle}>
            <FixBoxTip
                cacPanel={() => {
                    return this.block.page.kit.view.toolEl;
                }}
                zindex={1000}
                ref={e => this.boxTip = e}
                disableMousedownClose
                disabledMouseEnterOrLeave
                boxStyle={{ zIndex: popoverLayer.zoom(this.block) }}
                overlay={this.renderFlow()}
                align={this.block.align}
                onClose={async () => {
                    await this.onSave()
                }}
                cacOverEle={e => {
                    return (e.querySelector('[data-button]') as HTMLElement).parentNode as HTMLElement;
                }}
            >
                <div className={"flex"} style={style}>
                    <div className="relative"
                        style={{ zIndex: 1000, display: this.block.buttonIsBlock ? "block" : 'inline-block', width: this.block.buttonIsBlock ? "100%" : undefined }}>
                        <div
                            data-button={'true'}
                            onMouseDown={e => {
                                e.stopPropagation();
                                this.block.onExcute()
                            }}
                            className={" flex-center  " + classList.join(" ")}
                            style={{ width: this.block.buttonIsBlock ? "100%" : undefined }}
                        >
                            {this.block.iconAlign == 'left' && <> {this.block.buttonIcon && <Icon size={18} className={this.block.buttonText ? 'gap-r-5' : ""} icon={{ ...this.block.buttonIcon, color: 'inherit' }}></Icon>}
                                {this.block.buttonText && <>{this.block.buttonText}</>}
                            </>}
                            {this.block.iconAlign == 'right' && <>
                                {this.block.buttonText && <>{this.block.buttonText}</>}
                                {this.block.buttonIcon && <Icon size={18} className={this.block.buttonText ? 'gap-l-5' : ""} icon={{ ...this.block.buttonIcon, color: 'inherit' }}></Icon>}
                            </>}
                            {!this.block.buttonText && !this.block.buttonIcon && <span><S>按钮</S></span>}
                        </div>
                        {
                            this.block.isCanEdit() && <Tip text='编辑动作'><span
                                className="visible flex-center  pos-center-right-outside" onMouseDown={async e => {
                                    e.stopPropagation();
                                    this.openEdit(e)
                                }}><span className="cursor flex-center gap-l-5 size-20 item-hover round text-1"><Icon size={16} icon={SettingsSvg}></Icon></span>
                            </span></Tip>
                        }
                    </div>
                </div>
            </FixBoxTip>
        </div>
    }
    async onSave() {
        var od = await this.oldFlow.get();
        var nf = await this.block.flow.get();
        if (lodash.isEqual(od, nf)) return;
        await this.block.onManualUpdateProps({
            flow: this.oldFlow
        }, { flow: this.block.flow });
        this.oldFlow = await this.block.flow.clone();
        this.forceUpdate();
    }
    async changeIcon(event: React.MouseEvent) {
        var r = await useIconPicker({
            roundArea: Rect.fromEle(event.currentTarget as HTMLElement)
        });
        if (typeof r != 'undefined') {
            await this.block.onUpdateProps({ buttonIcon: r })
            this.forceUpdate();
        }
    }
    renderFlow() {
        var style: React.CSSProperties = {};
        if (this.block.align == 'center') style.justifyContent = 'center';
        else if (this.block.align == 'right') style.justifyContent = 'flex-end'
        return <div className="flex" style={{ top: 0, left: 0, right: 0, ...style }}>
            <div className='w-500 round-6 padding-h-14  text' >
                <div className="flex padding-w-14" onMouseDown={e => { e.stopPropagation() }}>
                    <span className="border size-24 round cursor flex-center"><Icon size={18} onMousedown={e => this.changeIcon(e)} icon={this.block.buttonIcon || { name: 'bytedance-icon', code: 'smiling-face' }}></Icon></span>
                    <span className="flex-auto gap-w-10"><Input value={this.block.buttonText} onChange={e => {
                        this.block.buttonText = e;
                    }} onEnter={async e => {
                        await this.onSave()
                        this.boxTip.close()
                    }}></Input></span>
                    <span className="flex-fixed"><Button onClick={async (e, b) => {
                        this.openEdit(e)
                    }}><S>保存</S></Button></span>
                </div>
                <div className="max-h-300 padding-w-14 overflow-y">
                    {this.block.flow && <FlowView onChange={async () => {
                        await this.onSave()
                    }} flow={this.block.flow}></FlowView>}
                </div>
            </div>
        </div>
    }
}


