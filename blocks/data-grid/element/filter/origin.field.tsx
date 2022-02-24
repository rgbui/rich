import React from "react";
import { Block } from "../../../../src/block";
import { prop } from "../../../../src/block/factory/observable";
import { DataGridView } from "../../view/base/table";
export class OriginFilterField extends Block {
    @prop()
    showFieldText: boolean = true;
    @prop()
    refFieldId: string;
    get field() {
        return (this.refBlock as DataGridView)?.schema.fields.find(g => g.id == this.refFieldId);
    }
    get refBlock(): DataGridView {
        return super.refBlock as DataGridView;
    }
    get fieldText() {
        return this.field?.text;
    }
    get filters() {
        return {}
    }
}
export class OriginFilterFieldView extends React.Component<{
    filterField: OriginFilterField,
    children?: JSX.Element | string | React.ReactNode,
}> {
    render(): React.ReactNode {
        return <div className="sy-filter-field-view">
            {this.props.filterField.showFieldText && <div>{this.props.filterField.fieldText}</div>}
            {this.props.children}
        </div>
    }
}