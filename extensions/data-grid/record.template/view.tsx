


import React, { ReactNode } from "react";
import { EventsComponent } from "../../../component/lib/events.component";
import { useSelectMenuItem } from "../../../component/view/menu";
import { MenuItemType } from "../../../component/view/menu/declare";
import { channel } from "../../../net/channel";
import { Point } from "../../../src/common/vector/point";
import { PopoverSingleton } from "../../../component/popover/popover";
import { PopoverPosition } from "../../../component/popover/position";
import { Divider } from "../../../component/view/grid";
import {
    DetailSvg,
    DotsSvg,
    DragHandleSvg,
    Edit1Svg,
    OrderSvg,
    PlusSvg,
    TrashSvg
} from "../../../component/svgs";
import { getElementUrl, ElementType } from "../../../net/element.type";

import { DataGridView } from "../../../blocks/data-grid/view/base";
import { BlockUrlConstant } from "../../../src/block/constant";
import { Icon, IconValueType } from "../../../component/view/icon";
import { lst } from "../../../i18n/store";
import { S } from "../../../i18n/view";
import { TableSchemaView } from "../../../blocks/data-grid/schema/meta";
import lodash from "lodash";

class TabelSchemaFormDrop extends EventsComponent {
    block: DataGridView;
    get schema() {
        return this.block?.schema
    }
    async open(options: { block: DataGridView }) {
        this.block = options.block;
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
    async onAdd(event: React.MouseEvent, url: string) {
        var menus = [
            { text: lst('数据模板名'), name: 'name', value: '', type: MenuItemType.input },
            { type: MenuItemType.divide },
            {
                type: MenuItemType.button,
                text: lst('创建数据模板'),
                name: 'create'
            }
        ]
        var um = await useSelectMenuItem({ roundPoint: Point.from(event) }, menus);
        if (um) {
            var name = menus[0].value;
            if (name) {
                await this.schema.onSchemaOperate([{ name: 'createSchemaView', text: name, url }])
                this.forceUpdate();
            }
        }
    }
    async onOpenTemplate(view, isTemplate: boolean = false) {
        this.emit('save', view);
        await channel.air('/page/dialog', {
            elementUrl: getElementUrl(ElementType.SchemaRecordView, this.schema.id, view.id),
            config: isTemplate ? { isTemplate: true, force: true } : { force: true }
        })
    }
    async onProperty(view: TableSchemaView, event: React.MouseEvent) {
        event.stopPropagation();
        var menus = [
            {
                type: MenuItemType.inputTitleAndIcon,
                text: lst('重命名模板'),
                value: view.text,
                icon: view.icon || DetailSvg,
                name: 'rename'
            },
            { type: MenuItemType.divide },
            { text: lst('编辑'), name: 'edit', icon: Edit1Svg },
            { type: MenuItemType.divide },
            { text: lst('默认新增时打开'), name: 'defaultCollect', checkLabel: this.schema.defaultCollectFormId == view.id ? true : false, icon: OrderSvg },
            { type: MenuItemType.divide },
            { text: lst('删除'), name: 'delete', icon: TrashSvg, disabled: this.schema.views.findAll(g => [BlockUrlConstant.RecordPageView].includes(g.url as any)).length == 1 ? true : false }
        ]
        var um = await useSelectMenuItem({ roundPoint: Point.from(event) }, menus);
        if (um) {
            if (um.item.name == 'delete') {
                this.schema.onSchemaOperate([{ name: 'removeSchemaView', id: view.id }])
                this.forceUpdate();
                return;
            }
            else if (um.item.name == 'edit') {
                this.onOpenTemplate(view, true);
                /**
                 * 这里打开表单，进行编辑
                 */
                return;
            }
            else if (um.item.name == 'defaultCollect') {
                this.schema.update({ defaultCollectFormId: view.id })
            }
            else if (um.item.name == 'defaultEdit') {
                this.schema.update({ defaultEditFormId: view.id })
            }
        }
        var it = menus.find(g => g.name == 'rename') as { value: string, icon: IconValueType };
        var data = {};
        if (it.value != view.text && it.value) {
            data['text'] = it.value;
        }
        if (!lodash.isEqual(it.icon, view.icon) && it.icon) {
            data['icon'] = it.icon;
        }
        if (Object.keys(data).length > 0) {
            this.schema.onSchemaOperate([{
                name: 'updateSchemaView',
                id: view.id,
                data: data
            }])
            Object.assign(view, data);
            this.forceUpdate();
            return;
        }

    }
    render(): ReactNode {
        if (!this.schema) return <div></div>
        var views = this.schema.views.filter(g => [BlockUrlConstant.RecordPageView].includes(g.url as any));
        if (!Array.isArray(views)) views = [];
        return <div className="shadow w-250 padding-h-10">
            <div className="bold padding-w-10 "><S>模板列表</S></div>
            {views.length > 0 && <Divider></Divider>}
            {views.map(v => {
                return <div className="item-hover padding-w-5 gap-w-5 h-30 round flex cursor text-1 f-14" key={v.id} onClick={e => this.onOpenTemplate(v)}>
                    <span className="size-24 flex-center flex-fixed round item-hover"><Icon size={12} className={'drag'} icon={DragHandleSvg}></Icon></span>
                    <span className="flex-fixed size-24 flex-center item-hover round">
                        <Icon size={16} icon={v.icon || (DetailSvg)}></Icon>
                    </span>
                    <span className="flex-auto">{v.text}</span>
                    <span className="size-24 flex-center flex-fixed item-hover round">
                        <Icon size={14} className={'property'} icon={DotsSvg} onClick={e => this.onProperty(v, e)}></Icon>
                    </span>
                </div>
            })}
            <Divider></Divider>
            <div className="item-hover padding-w-5 gap-w-5  h-30 round flex item-hover cursor  text-1 f-14" onClick={e => this.onAdd(e, BlockUrlConstant.RecordPageView)}>
                <span className="size-24 flex-center "><Icon size={16} icon={DetailSvg}></Icon></span>
                <span className="flex-auto"><S>新增数据模板</S></span>
                <span className="size-24 flex-center round item-hover "><Icon size={16} icon={PlusSvg}></Icon></span>
            </div>
        </div>
    }
}

export async function useTabelSchemaFormDrop(pos: PopoverPosition,
    options: {
        block: DataGridView
    }) {
    let popover = await PopoverSingleton(TabelSchemaFormDrop, { mask: true });
    let fv = await popover.open(pos);
    await fv.open(options);
    popover.updateLayout()
    return new Promise((resolve: (view: { id: string, text: string, url: string } | null) => void, reject) => {
        popover.only('close', () => {
            resolve(null)
        });
        fv.only('save', (data) => {
            resolve(data);
            popover.close()
        })
    })
}