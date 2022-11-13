import React, { CSSProperties } from "react";
import { Spin } from "../../../../component/view/spin";
import { Block } from "../../../../src/block";
import { prop } from "../../../../src/block/factory/observable";
import { SchemaFilter } from "../../schema/declare";
import { DataGridView } from "../../view/base";

export class OriginFilterField extends Block {
    @prop()
    showFieldText: boolean = true;
    @prop()
    refFieldId: string;
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
        this.view.forceUpdate();
    }
}
export class OriginFilterFieldView extends React.Component<{
    style?: CSSProperties,
    filterField: OriginFilterField,
    children?: JSX.Element | string | React.ReactNode,
}> {
    render(): React.ReactNode {
        if (!this.props.filterField.refBlock) return <Spin block></Spin>
        return this.props.filterField.refBlock && <div className="flex f-14" style={this.props.style || {}}>
            {this.props.filterField.showFieldText && <label className="flex-fixed text-1 gap-r-5">{this.props.filterField.fieldText}:</label>}
            <div className="flex-auto">{this.props.children}</div>
        </div>
    }
}