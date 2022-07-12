import React from "react";
import { ReactNode } from "react";
import { Field } from "../../../../blocks/data-grid/schema/field";
import { getTypeSvg } from "../../../../blocks/data-grid/schema/util";
import { DataGridView } from "../../../../blocks/data-grid/view/base";
import { EventsComponent } from "../../../../component/lib/events.component";
import { Icon } from "../../../../component/view/icon";
import { Remark } from "../../../../component/view/text";
import { Divider } from "../../../../component/view/grid";
import { DragHandleSvg, EyeHideSvg, EyeSvg, PlusSvg } from "../../../../component/svgs";

import "./style.less";
export class DataGridFields extends EventsComponent {
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
        function addField(event: React.MouseEvent) {
            self.block.onAddField(event);
        }
        async function changeAll(checked: boolean) {
            await self.block.onShowAllField(checked);
            self.forceUpdate();
        }
        return <div className="shy-table-field-view">
            <div className="shy-table-field-view-operator">
                <Remark>所有字段</Remark>
                <Icon size={14} click={e => changeAll(this.block.fields.filter(g => g.type ? false : true).length > 0 ? true : false)} icon={this.block.fields.filter(g => g.type ? false : true).length > 0 ? EyeSvg : EyeHideSvg}></Icon>
            </div>
            <div className="shy-table-field-view-items">
                {fs.map(f => {
                    return <div className={"shy-table-field-view-item" + (this.block.fields.some(s => s.fieldId == f.id) ? "" : " hide")} key={f.id}>
                        <Icon size={14} wrapper className={'drag'} icon={DragHandleSvg}></Icon>
                        <Icon size={14} icon={getTypeSvg(f.type)}></Icon>
                        <span>{f.text}</span>
                        <Icon className={'eye'} size={14} click={() => change(f, this.block.fields.some(s => s.fieldId == f.id) ? false : true)} icon={this.block.fields.some(s => s.fieldId == f.id) ? EyeSvg : EyeHideSvg}></Icon>
                    </div>
                })}
            </div>
            <Divider></Divider>
            <div className="shy-table-field-view-add">
                <a style={{
                    fontSize: 14,
                    display: 'inline-flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    cursor: 'pointer'
                }} onClick={e => addField(e)}><Icon size={14} style={{ marginRight: 5 }} icon={PlusSvg}></Icon>添加字段</a>
            </div>
        </div>
    }
}