import React, { CSSProperties } from "react";
import { Spin } from "../../../../component/view/spin";
import { Block } from "../../../../src/block";
import { prop } from "../../../../src/block/factory/observable";
import { SchemaFilter } from "../../schema/declare";
import { DataGridView } from "../../view/base";
import { BlockDirective, BlockDisplay, BlockRenderRange } from "../../../../src/block/enum";
import { SolidArea } from "../../../../src/block/view/appear";
import { DotsSvg, DragHandleSvg, TrashSvg } from "../../../../component/svgs";
import { Icon } from "../../../../component/view/icon";
import { BoxTip } from "../../../../component/view/tooltip/box";
import { DragBlockLine } from "../../../../src/kit/handle/line";
import { Tip } from "../../../../component/view/tooltip/tip";
import lodash from "lodash";
import { MenuItem, MenuItemType } from "../../../../component/view/menu/declare";
import { lst } from "../../../../i18n/store";

export class OriginFilterField extends Block {
    @prop()
    showFieldText: boolean = true;
    @prop()
    align: 'left' | 'center' | 'right' = 'left';
    @prop()
    refFieldId: string;
    display = BlockDisplay.block;
    get field() {
        if ((this.refBlock as DataGridView)?.schema?.fields)
            return (this.refBlock as DataGridView)?.schema?.fields.find(g => g.id == this.refFieldId);
    }
    get refBlock(): DataGridView {
        return super.refBlock as DataGridView;
    }
    get fieldText() {
        return this.field?.text;
    }
    get filters(): SchemaFilter[] {
        return null
    }
    onFilter(value: any, force?: boolean) {

    }
    async onSyncReferenceBlock() {
        if (this.view)
            this.view.forceUpdate();
    }
    dragBlock(event: React.MouseEvent) {
        DragBlockLine(this, event);
    }
    async onOpenMenu(event: React.MouseEvent) {
        await this.onContextmenu(event.nativeEvent);
    }
    
    async onGetContextMenus() {
        var rs = await super.onGetContextMenus();
        var rg = rs.find(g => g.name == 'text-center');
        if (rg) {
            rg.text = lst('对齐');
            rg.type = undefined;
            rg.name = undefined;
            rg.childs = [{
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
            }]
            var pos = rs.findIndex(g => g == rg);
            var ns: MenuItem<string | BlockDirective>[] = [];
            ns.push({
                type: MenuItemType.switch,
                text: lst('显示属性名'),
                checked: this.showFieldText,
                name: 'showFieldText',
                icon: { name: 'bytedance-icon', code: 'preview-close' }
            })
            rs.splice(pos + 1, 0, ...ns)
            lodash.remove(rs, g => g.name == 'color');
        }
        return rs;
    }
    async onContextMenuInput(this: Block, item: MenuItem<string | BlockDirective>): Promise<void> {
        switch (item.name) {
            case 'showFieldText':
                this.onUpdateProps({ [item.name]: item.checked }, { range: BlockRenderRange.self })
                return;
        }
        super.onContextMenuInput(item)
    }
    async onClickContextMenu(item: MenuItem<string | BlockDirective>, e) {
        switch (item.name) {
            case 'text-center':
                await this.onUpdateProps({ align: item.value }, { range: BlockRenderRange.self })
                return
        }
        return await super.onClickContextMenu(item, e);
    }

}
export class OriginFilterFieldView extends React.Component<{
    style?: CSSProperties,
    filterField: OriginFilterField,
    children?: JSX.Element | string | React.ReactNode,
}> {
    boxTip: BoxTip;
    render(): React.ReactNode {
        if (!this.props.filterField.refBlock) return <Spin block></Spin>
        if (this.props.filterField.display == BlockDisplay.block) {
            return <div className="flex" style={this.props.style || {}}>
                {this.props.filterField.showFieldText && <label className="gap-r-5">{this.props.filterField.fieldText}:</label>}
                <div onMouseDown={e => { e.stopPropagation() }} className="flex-auto flex">{this.props.children}</div>
            </div>
        }
        return this.props.filterField.refBlock && <BoxTip
            disabled={this.props.filterField.isCanEdit() ? false : true}
            ref={e => this.boxTip = e}
            overlay={<div className="flex h-30 round padding-w-5">
                <Tip text={'拖动'}><a className="flex-center size-24 round item-hover gap-r-5 cursor text" onMouseDown={e => this.props.filterField.dragBlock(e)} ><Icon size={16} icon={DragHandleSvg}></Icon></a></Tip>
                <Tip text={'删除'}><span className="flex-center text-1  item-hover size-24 round cursor" onMouseDown={e => this.props.filterField.onDelete()}><Icon size={16} icon={TrashSvg}></Icon></span></Tip>
                <Tip text={'菜单'}><span className="flex-center text-1  item-hover size-24 round cursor" onMouseDown={e => this.props.filterField.onOpenMenu(e)}><Icon size={16} icon={DotsSvg}></Icon></span></Tip>
            </div>}><SolidArea gap line block={this.props.filterField} prop='field'>
                <div className="inline" style={this.props.style || {}}>
                    {this.props.filterField.showFieldText && <label className="inline-block gap-r-5">{this.props.filterField.fieldText}:</label>}
                    <div onMouseDown={e => { e.stopPropagation() }} className="inline">{this.props.children}</div>
                </div>
            </SolidArea>
        </BoxTip>
    }
}