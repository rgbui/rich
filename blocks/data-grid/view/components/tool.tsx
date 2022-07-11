import React from "react";
import { Icon } from "../../../../component/view/icon";
import { DataGridView } from "../base";
import { Point, Rect } from "../../../../src/common/vector/point";
import { getSchemaViewIcon } from "../../schema/util";
import { useFormPage } from "../../../../extensions/datagrid/form";
import { useTabelSchemaFormDrop } from "../../../../extensions/datagrid/switch.forms/view";
import { useSelectMenuItem } from "../../../../component/view/menu";
import { MenuItem, MenuItemType } from "../../../../component/view/menu/declare";

import {
    ChevronDownSvg,
    CollectTableSvg,
    DotsSvg,
    DuplicateSvg,
    FileSvg,
    FilterSvg,
    LinkSvg,
    LockSvg,
    PropertysSvg,
    SettingsSvg,
    SortSvg,
    TemplatesSvg,
    TrashSvg
} from "../../../../component/svgs";
import "./style.less";
import { ElementType, getWsElementUrl } from "../../../../net/element.type";
import { BlockDirective } from "../../../../src/block/enum";
import { useDataGridConfig } from "../../../../extensions/datagrid/view.config";
export class DataGridTool extends React.Component<{ block: DataGridView }>{
    isOpenTool: boolean = false;
    render() {
        var self = this;
        var props = this.props;
        props.block.dataGridTool = this;
        async function openViewSettings(event: React.MouseEvent) {
            self.isOpenTool = true;
            event.stopPropagation();
            var items: MenuItem<BlockDirective | string>[] = [];
            items.push(...[
                {
                    name: 'name',
                    type: MenuItemType.input,
                    value: props.block.schemaView.text,
                    text: '编辑视图名',
                },
                { type: MenuItemType.divide },
                {
                    text: "切换视图",
                    childs: [...props.block.schema.views.map(v => {
                        return {
                            name: 'turn',
                            text: v.text,
                            type: MenuItemType.drag,
                            drag: 'view',
                            value: v.id,
                            icon: getSchemaViewIcon(v.url),
                            checkLabel: v.id == props.block.schemaView.id,
                            btns: [
                                { icon: DotsSvg, name: 'property' }
                            ]
                        }
                    }),
                    { type: MenuItemType.divide },
                    { name: 'addView', type: MenuItemType.button, text: '创建视图' }
                    ]
                },
                { type: MenuItemType.divide },
                { name: 'link', icon: LinkSvg, text: '复制视图链接' },
                { type: MenuItemType.divide },
                { name: 'delete', icon: TrashSvg, text: '移除视图' },
            ]);
            var r = await useSelectMenuItem({ roundArea: Rect.fromEvent(event) }, items, {
                async click(item, ev, name, mp) {
                    mp.onFree();
                    try {
                        if (item.name == 'turn') {
                            var rs: MenuItem<BlockDirective | string>[] = [];
                            rs.push(...[
                                {
                                    name: 'name',
                                    type: MenuItemType.input,
                                    value: item.text,
                                    text: '编辑视图名',
                                },
                                { type: MenuItemType.divide },
                                { name: 'duplicate', icon: DuplicateSvg, text: '复制' },
                                { name: 'delete', icon: TrashSvg, text: '删除' }
                            ])
                            var rg = await useSelectMenuItem({ roundArea: Rect.fromEvent(ev) },
                                rs,
                                { nickName: 'second' }
                            );
                            if (rg?.item) {
                                if (rg?.item.name == 'delete') {
                                    props.block.schema.onSchemaOperate([{ name: 'removeSchemaView', id: rg?.item.value }])
                                }
                                else if (rg?.item.name == 'duplicate') {
                                    props.block.schema.onSchemaOperate([{ name: 'duplicateSchemaView', id: rg?.item.value }])
                                }
                            }
                            var rn = rs.find(g => g.name == 'name');
                            if (rn.value != props.block.schemaView.text && rname.value) {
                                props.block.schema.onSchemaOperate([
                                    { name: 'updateSchemaView', id: view.id, data: { text: rn.value } }
                                ]);
                                props.block.forceUpdate()
                            }
                        }
                    }
                    catch (ex) {

                    }
                    finally {
                        mp.onUnfree()
                    }
                },
                input(item) {

                }
            });
            if (r?.item?.name) {
                if (r.item.name == 'link') {
                    props.block.onCopyViewLink();
                }
                else if (r.item.name == 'delete') {
                    props.block.onDelete();
                }
                else if (r.item.name == 'turn') {
                    props.block.onDataGridTurnView(r.item.value);
                }
            }
            var rname = items.find(g => g.name == 'name');
            if (rname.value != props.block.schemaView.text && rname.value) {
                props.block.schema.onSchemaOperate([
                    { name: 'updateSchemaView', id: view.id, data: { text: rname.value } }
                ]);
                props.block.forceUpdate()
            }
            props.block.onOver(props.block.getVisibleContentBound().contain(Point.from(props.block.page.kit.operator.moveEvent)))
            self.isOpenTool = false;
        }
        async function openViewConfig(event: React.MouseEvent) {
            self.isOpenTool = true;
            var r = await useDataGridConfig({ roundArea: Rect.fromEvent(event) }, {
                dataGrid: props.block
            });
            self.isOpenTool = false;
            props.block.onOver(props.block.getVisibleContentBound().contain(Point.from(props.block.page.kit.operator.moveEvent)))
        }
        async function openViewProperty(event: React.MouseEvent) {
            self.isOpenTool = true;
            var menus = [
                { text: '复制链接', icon: LinkSvg, name: 'copylink' },
                { type: MenuItemType.divide },
                { text: '视图设置', icon: TemplatesSvg, name: 'form' },
                { text: '字段设置', icon: PropertysSvg, name: 'propertys' },
                { text: '过滤', icon: FilterSvg, name: 'filter' },
                { text: '排序', icon: SortSvg, name: 'sort' },
                { type: MenuItemType.divide },
                { text: '锁定数据表格', name: 'lock', type: MenuItemType.switch, icon: LockSvg },
                // { text: '显示行号', checked: props.block.showRowNum as any, type: MenuItemType.switch, name: 'showRowNum' },
                // { text: '显示选中', checked: props.block.showCheckRow as any, type: MenuItemType.switch, name: 'check' },
                // { text: '显示序号(自增)', checked: props.block.fields.some(s => s.field?.type == FieldType.autoIncrement), type: MenuItemType.switch, name: 'autoIncrement' },
                { type: MenuItemType.divide },
                // { text: '导入', icon: ImportSvg, name: 'import' },
                { text: '导出', disabled: true, icon: FileSvg, name: 'export' },
            ]
            var um = await useSelectMenuItem({ roundPoint: Point.from(event) }, menus, {
                async input(item) {
                    if (item.name == 'showRowNum') {
                        await props.block.onShowNum(item.checked)
                    }
                    else if (item.name == 'check') {
                        await props.block.onShowCheck(item.checked)
                    }
                    else if (item.name == 'autoIncrement') {
                        await props.block.onShowAutoIncrement(item.checked)
                    }
                    else if (item.name == 'lock') {
                        await props.block.onLock(item.checked);
                    }
                }
            });
            if (um) {
                switch (um.item.name) {
                    case 'copylink':
                        var url = getWsElementUrl({
                            type: ElementType.SchemaView,
                            id: props.block.syncBlockId,
                            id1: props.block.schemaView.id
                        });

                        break;
                    case 'propertys':
                        //await openConfigProperty(event);
                        break;
                    case 'form':
                        await openFormDrop(event);
                        break;
                    case 'filter':
                        //await openFilterView(event);
                        break;
                    case 'sort':
                        // await openSortView(event);
                        break;
                }
            }
            self.isOpenTool = false;
            props.block.onOver(props.block.getVisibleContentBound().contain(Point.from(props.block.page.kit.operator.moveEvent)))
        }
        async function openForm(event: React.MouseEvent) {
            self.isOpenTool = true;
            var newRow = await useFormPage({
                schema: props.block.schema,
                recordViewId: props.block.schema.recordViews.first().id
            });
            if (newRow) {
                await props.block.onAddRow(newRow, undefined, 'after')
            }
            self.isOpenTool = false;
            props.block.onOver(props.block.getVisibleContentBound().contain(Point.from(props.block.page.kit.operator.moveEvent)))
        }
        async function openFormDrop(event: React.MouseEvent) {
            self.isOpenTool = true;
            event.stopPropagation();
            await useTabelSchemaFormDrop({ roundArea: Rect.fromEvent(event) }, {
                schema: props.block.schema
            });
            self.isOpenTool = false;
            props.block.onOver(props.block.getVisibleContentBound().contain(Point.from(props.block.page.kit.operator.moveEvent)))
        }
        var view = props.block.schema?.views?.find(g => g.id == props.block.syncBlockId)
        if (props.block.isLock == true) return <></>
        return <div className="sy-dg-tool">
            <div className="sy-dg-tool-title">
                <label onMouseDown={e => openViewSettings(e)}>
                    <Icon size={14} icon={view ? getSchemaViewIcon(view.url) : CollectTableSvg}></Icon>
                    <span>{view?.text}</span>
                </label>
            </div>
            {props.block.isOver && <div className="sy-dg-tool-operators">
                <label onMouseDown={e => openViewConfig(e)}><Icon size={14} icon={SettingsSvg}></Icon><span>视图配置</span></label>
                {/* <label onMouseDown={e => openFilterView(e)}><Icon size={14} icon={FilterSvg}></Icon><span>过滤</span></label>
                <label onMouseDown={e => openSortView(e)}><Icon size={14} icon={SortSvg}></Icon><span>排序</span></label> */}
                <label onMouseDown={e => openViewProperty(e)}><Icon size={14} icon='elipsis:sy'></Icon></label>
                <div className="sy-dg-tool-operators-add">
                    <span className="text" onClick={e => openForm(e)}>新增</span>
                    <span className="icon" onClick={e => openFormDrop(e)}><Icon size={10} icon={ChevronDownSvg}></Icon></span>
                </div>
            </div>}
        </div>
    }
}


