
import React, { ReactNode } from "react";
import { Field } from "../../../../blocks/data-grid/schema/field";
import { DataGridView } from "../../../../blocks/data-grid/view/base";
import { EventsComponent } from "../../../../component/lib/events.component";
import "./style.less";

export class DataGridDynamic extends EventsComponent {
    get schema() {
        return this.block?.schema;
    }
    block: DataGridView;
    onOpen(block: DataGridView) {
        this.block = block;
        this.forceUpdate();
    }
    render(): ReactNode {
        if (!this.block) return <></>;
        if (!this.schema) return <div></div>
        var fs = this.schema.fields.findAll(g => g.text ? true : false);
        var self = this;
        async function change(field: Field, checked: boolean) {
            if (checked == true) {
                await self.block.onShowField(field);
            }
            else {
                var vf = self.block.fields.find(g => g.field.id == field.id);
                if (vf) await self.block.onHideField(vf);
            }
            self.forceUpdate();
        }
        return <div className="shy-table-field-view">

        </div>
    }
}