


import React from "react";
import { EventsComponent } from "../../../component/lib/events.component";
import { useSelectMenuItem } from "../../../component/view/menu";
import { MenuItem, MenuItemType } from "../../../component/view/menu/declare";
import { channel } from "../../../net/channel";
import { Point } from "../../../src/common/vector/point";
import { PopoverSingleton } from "../../../component/popover/popover";
import { PopoverPosition } from "../../../component/popover/position";
import { Divider } from "../../../component/view/grid";

import {
    DotsSvg,
    DragHandleSvg,
    DuplicateSvg,
    Edit1Svg,
    FormSvg,
    MaximizeSvg,
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
import { HelpText } from "../../../component/view/text";
import lodash from "lodash";
import { ToolTip } from "../../../component/view/tooltip";
import { getSchemaViewIcon } from "../../../blocks/data-grid/schema/util";

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
        var menus: MenuItem[] = [
            { text: lst('数据模板名'), name: 'name', value: '', type: MenuItemType.input },
            { type: MenuItemType.divide },
            {
                name: 'viewDisplay',
                type: MenuItemType.buttonOptions,
                value: 'doc',
                selectInput: true,
                options: [
                    {
                        text: lst('默认'),
                        value: 'doc',
                        icon: { name: 'bytedance-icon', code: 'editor' },
                        overlay: lst('编辑数据')
                    },
                    {
                        text: lst('表单'),
                        value: 'doc-add',
                        icon: FormSvg,
                        overlay: lst('收集数据')
                    },
                    {
                        text: lst('清单'),
                        value: 'doc-detail',
                        icon: { name: 'bytedance-icon', code: 'doc-detail' },
                        overlay: lst('展示数据')
                    }
                ]
            },
            { type: MenuItemType.divide },
            {
                type: MenuItemType.button,
                text: lst('创建数据模板'),
                name: 'create'
            }
        ]
        var um = await useSelectMenuItem({ roundPoint: Point.from(event) }, menus as any);
        if (um) {
            var name = menus[0].value;
            var formType = menus.find(c => c.name == 'viewDisplay')?.value || 'doc';
            if (name) {
                var rc = await this.schema.onSchemaOperate([{
                    name: 'createSchemaView',
                    text: name,
                    url,
                    data: {
                        formType
                    }
                }], this.block.id);
                var rd = rc.data.actions[0];
                if (rd) {
                    await this.onOpenTemplate(rd, true);
                }
                else this.forceUpdate();
            }
        }
    }
    async onOpenTemplate(view: TableSchemaView, isTemplate: boolean = false) {
        this.emit('save', view);
        if (view?.formType == 'doc-add') isTemplate = false;
        if (view?.formType == 'doc-detail') {
            var row = this.block.data[0];
            if (row) {
                await channel.act('/page/dialog', {
                    elementUrl: getElementUrl(ElementType.SchemaRecordViewData, this.schema.id, view.id, row.id),
                    config: isTemplate ? { isTemplate: true, force: true } : { force: true }
                })
                return;
            }
            isTemplate = true;
        }
        await channel.act('/page/dialog', {
            elementUrl: getElementUrl(ElementType.SchemaRecordView, this.schema.id, view.id),
            config: isTemplate ? { isTemplate: true, force: true } : { force: true }
        })

    }
    async onProperty(view: TableSchemaView, event: React.MouseEvent) {
        event.stopPropagation();
        var menus = [
            {
                type: MenuItemType.inputTitleAndIcon,
                text: lst('重命名数据模板'),
                value: view.text,
                icon: getSchemaViewIcon(view),
                name: 'rename'
            },
            { type: MenuItemType.divide },
            { text: lst('编辑'), name: 'edit', icon: Edit1Svg },
            { text: lst('复制数据模板'), name: 'clone', icon: DuplicateSvg },
            { text: lst('设为新增数据时打开'), visible: view.formType != 'doc-detail' ? true : false, name: 'defaultCollect', checkLabel: this.schema.defaultCollectFormId == view.id ? true : false, icon: FormSvg },
            { type: MenuItemType.divide },
            { text: lst('删除'), name: 'delete', icon: TrashSvg, disabled: this.schema.views.findAll(g => [BlockUrlConstant.RecordPageView].includes(g.url as any)).length == 1 ? true : false }
        ]
        var um = await useSelectMenuItem({ roundPoint: Point.from(event) }, menus);
        if (um) {
            if (um.item.name == 'delete') {
                this.schema.onSchemaOperate([{ name: 'removeSchemaView', id: view.id }], this.block.id)
                this.forceUpdate();
                return;
            }
            else if (um.item.name == 'clone') {
                this.schema.onSchemaOperate([{ name: 'duplicateSchemaView', id: view.id }], this.block.id)
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
                this.schema.update({ defaultCollectFormId: view.id }, 'TabelSchemaFormDrop')
            }
            else if (um.item.name == 'defaultEdit') {
                this.schema.update({ defaultEditFormId: view.id }, 'TabelSchemaFormDrop')
            }
        }
        var it = menus.find(g => g.name == 'rename') as { value: string, icon: IconValueType };
        var data = {};
        if (it.value != view.text && it.value) {
            data['text'] = it.value;
        }
        if (!lodash.isEqual(it.icon, view.icon) && it.icon && typeof it.icon != 'function') {
            data['icon'] = it.icon;
        }
        if (Object.keys(data).length > 0) {
            await this.schema.onSchemaOperate([{
                name: 'updateSchemaView',
                id: view.id,
                data: data
            }], this.block.id)
            var props = lodash.pick(data, ['text', 'icon']);
            if (Object.keys(props).length > 0) {
                await channel.air('/page/update/info', {
                    elementUrl: getElementUrl(ElementType.SchemaRecordView, this.schema.id, view.id),
                    pageInfo: props
                }, { locationId: 'TabelSchemaFormDrop.onProperty' })
            }
            Object.assign(view, data);
            this.forceUpdate();
            return;
        }
    }
    async onMaximize(view: TableSchemaView, event: React.MouseEvent) {
        this.block.onOpenSchemaViewPage(this.block.schema?.id, view.id);
    }
    render() {
        if (!this.schema) return <div></div>
        var views = this.schema.views.filter(g => [BlockUrlConstant.RecordPageView].includes(g.url as any));
        if (!Array.isArray(views)) views = [];
        return <div className="shadow-s w-250 padding-h-10">
            <div className="bold padding-w-10 flex"><span className="flex-auto"><S>数据模板列表</S></span><HelpText className={'flex-fixed'} url={window.shyConfig?.isUS ? "https://help.shy.red/page/42#vQh5qaxCEC3aPjuFisoRh5" : "https://help.shy.live/page/1870#3Fgw3UNGQErf8tZdJnhjru"}>了解数据模板</HelpText></div>
            {views.length > 0 && <Divider></Divider>}
            {views.map(v => {
                return <div className="item-hover padding-w-5 gap-w-5 h-30 round flex cursor f-14" key={v.id} onClick={e => this.onOpenTemplate(v)}>
                    <span className="size-24 flex-center flex-fixed round item-hover text-1"><Icon size={14} className={'drag'} icon={DragHandleSvg}></Icon></span>
                    <span className="flex-fixed size-24 flex-center item-hover round">
                        <Icon size={16} icon={getSchemaViewIcon(v)}></Icon>
                    </span>
                    <span className="flex-auto text-overflow">{v.text}</span>
                    {v.formType == 'doc-add' && <ToolTip overlay={<S>页面方式打开</S>}><span className="size-24 flex-center flex-fixed  item-hover round gap-r-5">
                        <Icon size={16} className={'property'} icon={MaximizeSvg} onClick={e => {
                            e.stopPropagation();
                            this.onMaximize(v, e);
                        }}></Icon>
                    </span></ToolTip>}
                    <span className="size-24 flex-center flex-fixed  item-hover round">
                        <Icon size={16} className={'property'} icon={DotsSvg} onClick={e => this.onProperty(v, e)}></Icon>
                    </span>
                </div>
            })}
            <Divider></Divider>
            <div className="item-hover padding-w-5 gap-w-5  h-30 round flex item-hover cursor  text-1 f-14" onClick={e => this.onAdd(e, BlockUrlConstant.RecordPageView)}>
                <span className="size-24 flex-center item-hover round"><Icon size={18} icon={PlusSvg}></Icon></span>
                <span className="flex-auto"><S>新增数据模板</S></span>
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