import React, { ReactNode } from "react";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { EventsComponent } from "../../../component/lib/events.component";
import { Icon } from "../../../component/view/icon";
import { useSelectMenuItem } from "../../../component/view/menu";
import { MenuItemType } from "../../../component/view/menu/declare";
import { channel } from "../../../net/channel";
import { Point } from "../../../src/common/vector/point";
import { PopoverSingleton } from "../../popover/popover";
import { PopoverPosition } from "../../popover/position";
import "./style.less";
import Plus from "../../../src/assert/svg/plus.svg";
import Dots from "../../../src/assert/svg/dots.svg";
import DragSvg from "../../../src/assert/svg/dragHandle.svg";
import TrashSvg from "../../../src/assert/svg/trash.svg";
import { Divider } from "../../../component/view/grid";
import { useFormPage } from "../form";

class TabelSchemaFormDrop extends EventsComponent {
    schema: TableSchema;
    async open(options: { schema: TableSchema }) {
        this.schema = options.schema;
        await this.syncForceUpdate();
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
        var menus = [
            { text: '表单名', name: 'name', value: '', type: MenuItemType.input },
            { type: MenuItemType.divide },
            {
                type: MenuItemType.button,
                text: '创建表单',
                name: 'create'
            }
        ]
        var um = await useSelectMenuItem({ roundPoint: Point.from(event) }, menus);
        if (um) {
            var name = menus[0].value;
            if (name) {
                var result = await channel.put('/schema/operate', {
                    operate: {
                        schemaId: this.schema.id,
                        date: new Date(),
                        actions: [{ name: 'createSchemaRecordView', text: name }]
                    }
                });
                var oneAction = result.data.actions.first();
                this.schema.recordViews.push({ id: oneAction.id, text: name });
                this.forceUpdate();
                this.onChange(this.schema.recordViews.find(g => g.id == oneAction.id));
            }
        }
    }
    async onChange(view) {
        this.emit('save', view);
        await useFormPage({ schema: this.schema, recordViewId: view.id })
    }
    async onProperty(view, event: React.MouseEvent) {
        event.stopPropagation();
        var menus = [
            {
                type: MenuItemType.input,
                text: '重命名表单',
                value: view.text,
                icon: TrashSvg,
                name: 'rename'
            },
            { type: MenuItemType.divide },
            { text: '编辑', name: 'edit', icon: TrashSvg },
            { text: '删除', name: 'delete', icon: TrashSvg }
        ]
        var um = await useSelectMenuItem({ roundPoint: Point.from(event) }, menus);
        if (um) {
            if (um.item.name == 'delete') {
                var result = await channel.put('/schema/operate', {
                    operate: {
                        schemaId: this.schema.id,
                        date: new Date(),
                        actions: [{ name: 'removeSchemaRecordView', id: view.id }]
                    }
                });
                this.schema.views.remove(g => g.id == view.id);
                this.forceUpdate();
                return;
            }
            else if (um.item.name == 'edit') {
                this.onChange(view);
                /**
                 * 这里打开表单，进行编辑
                 */
                return;
            }
        }
        var it = menus.find(g => g.name == 'rename');
        if (it.value != view.text && it.value) {
            var result = await channel.put('/schema/operate', {
                operate: {
                    schemaId: this.schema.id,
                    date: new Date(),
                    actions: [{ name: 'updateSchemaRecordView', id: view.id, data: { text: it.value } }]
                }
            });
            view.text = it.value;
            this.forceUpdate();
            return;
        }
    }
    render(): ReactNode {
        var self = this;
        if (!this.schema) return <div></div>
        var views = this.schema.recordViews;
        if (!Array.isArray(views)) views = [];
        return <div className="shy-schema-view-form-selectors">
            {views.map(v => {
                return <div className="shy-schema-view-form-item" key={v.id} onClick={e => this.onChange(v)}>
                    <Icon size={12} className={'drag'} icon={DragSvg}></Icon>
                    <span>{v.text}</span>
                    <Icon size={14} className={'property'} icon={Dots} click={e => this.onProperty(v, e)}></Icon>
                </div>
            })}
            <Divider></Divider>
            <div className="shy-schema-view-form-selectors-add" onClick={e => this.onAdd(e)}>
                <Icon size={16} icon={Plus}></Icon><span>新增表单</span>
            </div>
        </div>
    }
}

export async function useTabelSchemaFormDrop(pos: PopoverPosition,
    options: {
        schema: TableSchema,
    }) {
    let popover = await PopoverSingleton(TabelSchemaFormDrop, { mask: true });
    let fv = await popover.open(pos);
    await fv.open(options);
    popover.updateLayout()
    return new Promise((resolve: (view: { id: string, text: string, url: string }) => void, reject) => {
        popover.only('close', () => {
            resolve(null)
        });
        fv.only('save', (data) => {
            resolve(data);
            popover.close()
        })
    })
}