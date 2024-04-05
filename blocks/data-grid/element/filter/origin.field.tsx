import React, { CSSProperties } from "react";
import { Block } from "../../../../src/block";
import { prop } from "../../../../src/block/factory/observable";
import { SchemaFilter } from "../../schema/filter";
import { DataGridView } from "../../view/base";
import { BlockDirective, BlockDisplay, BlockRenderRange } from "../../../../src/block/enum";
import { BoxTip } from "../../../../component/view/tooltip/box";
import { DragBlockLine } from "../../../../src/kit/handle/line";
import lodash from "lodash";
import { MenuItem, MenuItemType } from "../../../../component/view/menu/declare";
import { lst } from "../../../../i18n/store";
import { Rect } from "../../../../src/common/vector/point";
import { TrashSvg } from "../../../../component/svgs";
import { Icon } from "../../../../component/view/icon";
import { ToolTip } from "../../../../component/view/tooltip";

export class OriginFilterField extends Block {
    @prop()
    fieldTextDisplay: 'x' | 'y' | 'none' = 'x';
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
                text: lst('显示'),
                childs: [
                    { name: 'fieldTextDisplay', icon: { name: "byte", code: 'align-left' }, value: 'x', text: lst('横向'), checkLabel: this.fieldTextDisplay == 'x' },
                    { name: 'fieldTextDisplay', icon: { name: "byte", code: "align-left-one" }, value: 'y', text: lst('纵向'), checkLabel: this.fieldTextDisplay == 'y' },
                    { name: 'fieldTextDisplay', icon: { name: "byte", code: "rectangle-small" }, value: 'none', text: lst('仅显示组件'), checkLabel: this.fieldTextDisplay == 'none' },
                ],
                icon: { name: 'bytedance-icon', code: 'layout-two' }
            }, { type: MenuItemType.divide })
            rs.splice(pos, 0, ...ns)
            lodash.remove(rs, g => g.name == 'color');
        }
        return rs;
    }
    async onContextMenuInput(this: Block, item: MenuItem<string | BlockDirective>): Promise<void> {
        switch (item.name) {
            case 'fieldTextDisplay':
                await this.onUpdateProps({ [item.name]: item.value }, { range: BlockRenderRange.self })
                return;
        }
        super.onContextMenuInput(item)
    }
    async onClickContextMenu(item: MenuItem<string | BlockDirective>, e) {
        switch (item.name) {
            case 'text-center':
                await this.onUpdateProps({ align: item.value }, { range: BlockRenderRange.self })
                return
            case 'fieldTextDisplay':
                await this.onUpdateProps({ [item.name]: item.value }, { range: BlockRenderRange.self })
                return
        }
        return await super.onClickContextMenu(item, e);
    }
    getVisibleHandleCursorPoint() {
        if (!this.el) return null;
        var el = this.el;
        if (el) {
            if (this.fieldTextDisplay == 'y') {
                el = el.querySelector('[data-field]') as HTMLElement;
            }
        }
        var rect = Rect.fromEle(el);
        return rect.leftMiddle;
    }
}

export class OriginFilterFieldView extends React.Component<{
    style?: CSSProperties,
    filterField: OriginFilterField,
    children?: JSX.Element | string | React.ReactNode,
    top?: boolean
}> {
    boxTip: BoxTip;
    render(): React.ReactNode {
        if (!this.props.filterField.refBlock) return <div className="bg-error text-white flex">
            <span>没有找到关联的数据表</span>
            <ToolTip overlay={lst('删除')}><span onMouseDown={e => this.props.filterField.onDelete()} className="flex-fixed"><Icon icon={TrashSvg}></Icon></span> </ToolTip>
        </div>
        if (this.props.filterField.fieldTextDisplay == 'x') {
            return <div className={"text-1 flex" + (this.props.top ? " flex-top" : '')} style={this.props.style || {}}>
                <label className="gap-r-5 flex-fixed">{this.props.filterField.fieldText}:</label>
                <div onMouseDown={e => { e.stopPropagation() }} className="flex-auto">{this.props.children}</div>
            </div>
        }
        else if (this.props.filterField.fieldTextDisplay == 'y') {
            return <div className="text-1">
                <div data-field>{this.props.filterField.fieldText}</div>
                <div className="gap-t-5">{this.props.children}</div>
            </div>
        }
        else if (this.props.filterField.fieldTextDisplay == 'none') {
            return <div className="text-1" style={this.props.style || {}} onMouseDown={e => { e.stopPropagation() }}>
                {this.props.children}
            </div>
        }
        return <div className={"text-1 flex" + (this.props.top ? " flex-top" : '')} style={this.props.style || {}}>
            {this.props.filterField.fieldTextDisplay && <label className="gap-r-5 flex-fixed">{this.props.filterField.fieldText}:</label>}
            <div onMouseDown={e => { e.stopPropagation() }} className="flex-auto">{this.props.children}</div>
        </div>
    }
}