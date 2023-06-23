import React, { CSSProperties } from "react";
import { Spin } from "../../../../component/view/spin";
import { Block } from "../../../../src/block";
import { prop } from "../../../../src/block/factory/observable";
import { SchemaFilter } from "../../schema/declare";
import { DataGridView } from "../../view/base";
import { BlockDisplay } from "../../../../src/block/enum";
import { SolidArea } from "../../../../src/block/view/appear";
import { DragHandleSvg, EditSvg, TrashSvg } from "../../../../component/svgs";
import { Icon } from "../../../../component/view/icon";
import { ToolTip } from "../../../../component/view/tooltip";
import { BoxTip } from "../../../../component/view/tooltip/box";
import { DragBlockLine } from "../../../../src/kit/handle/line";

export class OriginFilterField extends Block {
    @prop()
    showFieldText: boolean = true;
    @prop()
    refFieldId: string;
    display = BlockDisplay.inline;
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
}
export class OriginFilterFieldView extends React.Component<{
    style?: CSSProperties,
    filterField: OriginFilterField,
    children?: JSX.Element | string | React.ReactNode,
}> {
    boxTip: BoxTip;
    render(): React.ReactNode {
        if (!this.props.filterField.refBlock) return <Spin block></Spin>
        return this.props.filterField.refBlock && <BoxTip
            ref={e => this.boxTip = e}
            overlay={<div className="flex h-30 round padding-w-5">
                <ToolTip overlay={'拖动'}><a className="flex-center size-24 round item-hover gap-r-5 cursor text" onMouseDown={e => this.props.filterField.dragBlock(e)} ><Icon size={16} icon={DragHandleSvg}></Icon></a></ToolTip>
                <ToolTip overlay={'删除'}><span className="flex-center text-1  item-hover size-24 round cursor" onMouseDown={e => this.props.filterField.onDelete()}><Icon size={16} icon={TrashSvg}></Icon></span></ToolTip>
            </div>}><SolidArea gap line block={this.props.filterField} prop='field'>
                <div className="flex flex-top f-14 flex-inline" style={this.props.style || {}}>
                    {this.props.filterField.showFieldText && <label className="flex-fixed text-1 gap-r-5">{this.props.filterField.fieldText}:</label>}
                    <div onMouseDown={e => { e.stopPropagation() }} className="flex-auto">{this.props.children}</div>
                </div>
            </SolidArea>
        </BoxTip>
    }
}