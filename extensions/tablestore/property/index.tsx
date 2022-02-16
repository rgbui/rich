import React from "react";
import { ReactNode } from "react";
import { Field } from "../../../blocks/data-grid/schema/field";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { getTypeSvg } from "../../../blocks/data-grid/schema/util";
import { DataGridView } from "../../../blocks/data-grid/view/base/table";
import { EventsComponent } from "../../../component/lib/events.component";
import { Icon } from "../../../component/view/icon";
import { Switch } from "../../../component/view/switch";
import { PopoverSingleton } from "../../popover/popover";
import { PopoverPosition } from "../../popover/position";
import DragSvg from "../../../src/assert/svg/dragHandle.svg";
import "./style.less";
import { Remark } from "../../../component/view/text";
import { Select } from "../../../component/view/select";
import { Divider } from "../../../component/view/grid";
import PlusSvg from "../../../src/assert/svg/plus.svg";
class TablePropertyView extends EventsComponent {
    schema: TableSchema;
    block: DataGridView;
    open(options: {
        schema: TableSchema,
        gridView: DataGridView
    }) {
        this.schema = options.schema;
        this.block = options.gridView;
        this.forceUpdate()
    }
    render(): ReactNode {
        if (!this.schema) return <div></div>
        var fs = this.schema.fields.findAll(g => g.text ? true : false);
        var self = this;
        function change(field: Field, checked: boolean) {
            console.log(field, checked);
            if (checked == true) {
                if (!self.block.fields.some(s => s.fieldId == field.id)) {
                    var fr = self.block.schema.createViewField(field);
                    self.block.fields.push(fr);
                }
            }
            else {
                self.block.fields.remove(g => g.fieldId == field.id);
            }
            self.forceUpdate();
        }
        function addField(event: React.MouseEvent) {
            self.block.onAddField(event);
        }
        return <div className="shy-table-property-view">
            <div className="shy-table-property-view-head"><span>当前视图字段设置</span></div>
            <Divider></Divider>
            <div className="shy-table-property-view-operator">
                <Remark>每页数量</Remark>
                <Select options={[
                    { text: '20条', value: 20 },
                    { text: '50条', value: 50 },
                    { text: '80条', value: 80 },
                    { text: '120条', value: 120 },
                    { text: '150条', value: 150 }
                ]} value={this.block.size} onChange={e => { this.block.size = e; self.forceUpdate() }}></Select>
            </div>
            <Divider></Divider>
            <div className="shy-table-property-view-operator">
                <Remark>所有字段</Remark>
                <a style={{ fontSize: '14px' }}>{this.block.fields.length == 0 ? "显示" : "隐蔽"}</a>
            </div>
            {
                fs.map(f => {
                    return <div className="shy-table-property-view-item" key={f.id}>
                        <Icon size={14} style={{ padding: 10 }} wrapper className={'drag'} icon={DragSvg}></Icon>
                        <Icon size={14} icon={getTypeSvg(f.type)}></Icon>
                        <span>{f.text}</span>
                        <Switch onChange={e => change(f, e)} checked={this.block.fields.some(s => s.fieldId == f.id)}></Switch>
                    </div>
                })
            }
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

export async function useTablePropertyView(pos: PopoverPosition,
    options: {
        schema: TableSchema,
        gridView: DataGridView
    }) {
    let popover = await PopoverSingleton(TablePropertyView, { mask: true });
    let fv = await popover.open(pos);
    fv.open(options);
    return new Promise((resolve: (config: Record<string, any>) => void, reject) => {
        popover.only('close', () => {
            resolve({})
        })
    })
}