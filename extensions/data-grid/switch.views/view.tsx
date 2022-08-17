import React, { ReactNode } from "react";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { EventsComponent } from "../../../component/lib/events.component";
import { PopoverSingleton } from "../../popover/popover";
import { PopoverPosition } from "../../popover/position";
import Plus from "../../../src/assert/svg/plus.svg";
import Dots from "../../../src/assert/svg/dots.svg";
import DragSvg from "../../../src/assert/svg/dragHandle.svg";
import TrashSvg from "../../../src/assert/svg/trash.svg";
import { Icon } from "../../../component/view/icon";
import { useDataGridCreate } from "../create";
import { Point } from "../../../src/common/vector/point";
import { channel } from "../../../net/channel";
import { useSelectMenuItem } from "../../../component/view/menu";
import { MenuItemType } from "../../../component/view/menu/declare";
import "./style.less";
import { getSchemaViewIcon } from "../../../blocks/data-grid/schema/util";
import { Divider } from "../../../component/view/grid";
import { FieldType } from "../../../blocks/data-grid/schema/type";
import { Field } from "../../../blocks/data-grid/schema/field";

class TabelSchemaViewDrop extends EventsComponent {
    schema: TableSchema;
    open(options: { schema: TableSchema }) {
        this.schema = options.schema;
        this.forceUpdate()
    }
    getFields() {
        return this.schema.fields.map(fe => {
            return {
                text: fe.text,
                value: fe.id
            }
        })
    }
    async onAdd(event: React.MouseEvent) {
        var r = await useDataGridCreate({ roundPoint: Point.from(event) }, { selectView: true });
        if (r) {
            var actions: any[] = [{ name: 'createSchemaView', text: r.text, url: r.url }];
            if (r.url == '/data-grid/board' && !this.schema.fields.some(f => f.type == FieldType.option || f.type == FieldType.options)) {
                actions.push({ name: 'addField', field: { text: '状态', type: FieldType.option } })
            }
            var result = await this.schema.onSchemaOperate(action)
            var oneAction = result.data.actions.first();
            if (result.data.actions.length > 1) {
                var action = result.data.actions[1];
                var f = new Field();
                f.load({
                    id: action.id,
                    name: action.name,
                    text: '状态',
                    type: FieldType.option
                });
                this.schema.fields.push(f);
            }
            this.schema.views.push({ id: oneAction.id, text: r.text, url: r.url } as any);
            this.onChange(this.schema.views.find(g => g.id == oneAction.id));
        }
    }
    onChange(view) {
        this.emit('save', view);
    }
    async onProperty(view, event: React.MouseEvent) {
        event.stopPropagation();
        var menus = [
            {
                type: MenuItemType.input,
                text: '重命名视图',
                value: view.text,
                icon: TrashSvg,
                name: 'rename'
            },
            { type: MenuItemType.divide },
            { text: '删除', name: 'delete', icon: TrashSvg }
        ]
        var um = await useSelectMenuItem({ roundPoint: Point.from(event) }, menus);
        if (um) {
            if (um.item.name == 'delete') {
                var result = this.schema.onSchemaOperate([{ name: 'removeSchemaView', id: view.id }])
                this.forceUpdate();
                return;
            }
        }
        var it = menus.find(g => g.name == 'rename');
        if (it.value != view.text && it.value) {
            var result = this.schema.onSchemaOperate([
                { name: 'updateSchemaView', id: view.id, data: { text: it.value } }
            ])
            this.forceUpdate();
            return;
        }
    }
    async onTableProperty(event: React.MouseEvent) {
        event.stopPropagation();
        var menus = [
            {
                type: MenuItemType.input,
                text: '重命名表名',
                value: this.schema.text,
                icon: TrashSvg,
                name: 'rename'
            }
        ]
        await useSelectMenuItem({ roundPoint: Point.from(event) }, menus);
        var it = menus.find(g => g.name == 'rename');
        if (it.value != this.schema.text && it.value) {
            var result = this.schema.onSchemaOperate([
                { name: 'updateSchema', data: { text: it.value } }
            ])
            this.forceUpdate();
            return;
        }
    }
    render(): ReactNode {
        var self = this;
        if (!this.schema) return <div></div>
        var views = this.schema.views;
        if (!Array.isArray(views)) views = [];
        return <div className="shy-schema-view-selectors">
            <div className="shy-schema-view-selector-head">
                <span><b>{this.schema.text}</b>的视图</span>
                <Icon size={14} className={'property'} icon={Dots} onClick={e => this.onTableProperty(e)}></Icon>
            </div>
            {views.map(v => {
                return <div className="shy-schema-view-selector-item" key={v.id} onClick={e => this.onChange(v)}>
                    <Icon size={12} className={'drag'} icon={DragSvg}></Icon>
                    <Icon size={14} className={'icon'} icon={getSchemaViewIcon(v.url)}></Icon>
                    <span>{v.text}</span>
                    <Icon size={14} className={'property'} icon={Dots} onClick={e => this.onProperty(v, e)}></Icon>
                </div>
            })}
            <Divider></Divider>
            <div className="shy-schema-view-selectors-add" onClick={e => this.onAdd(e)}>
                <Icon size={16} icon={Plus}></Icon><span>新增视图</span>
            </div>
        </div>
    }
}

export async function useTabelSchemaViewDrop(pos: PopoverPosition,
    options: {
        schema: TableSchema,
    }) {
    let popover = await PopoverSingleton(TabelSchemaViewDrop, { mask: true });
    let fv = await popover.open(pos);
    fv.open(options);
    return new Promise((resolve: (view: { id: string, text: string, url: string }) => void, reject) => {
        popover.only('close', () => {
            // resolve()
        });
        fv.only('save', (data) => {
            resolve(data);
            popover.close()
        })
    })
}