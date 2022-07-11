import React from "react";
import { ReactNode } from "react";
import { Field } from "../../../../blocks/data-grid/schema/field";
import { getTypeSvg } from "../../../../blocks/data-grid/schema/util";
import { DataGridView } from "../../../../blocks/data-grid/view/base";
import { EventsComponent } from "../../../../component/lib/events.component";
import { Icon } from "../../../../component/view/icon";
import { Switch } from "../../../../component/view/switch";
import "./style.less";
import { Remark } from "../../../../component/view/text";
import { Divider, Row } from "../../../../component/view/grid";
import { DragHandleSvg, PlusSvg } from "../../../../component/svgs";

export class DataGridFields extends EventsComponent<{ dataGrid: DataGridView }> {
    get block() {
        return this.props.dataGrid;
    }
    get schema() {
        return this.props.dataGrid?.schema;
    }
    render(): ReactNode {
        if (!this.props.dataGrid) return <></>;
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
        return <div className="shy-table-property-view">
            <div className="shy-table-property-view-operator">
                <Remark>所有字段</Remark>
                <a style={{ fontSize: '14px' }}>{this.block.fields.length == 0 ? "显示" : "隐蔽"}</a>
            </div>
            {fs.map(f => {
                return <div className="shy-table-property-view-item" key={f.id}>
                    <Icon size={14} style={{ padding: 10 }} wrapper className={'drag'} icon={DragHandleSvg}></Icon>
                    <Icon size={14} icon={getTypeSvg(f.type)}></Icon>
                    <span>{f.text}</span>
                    <Switch onChange={e => change(f, e)} checked={this.block.fields.some(s => s.fieldId == f.id)}></Switch>
                </div>
            })}
            <Divider></Divider>
            <div className="shy-table-property-view-add">
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