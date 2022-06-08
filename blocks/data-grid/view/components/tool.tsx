import React from "react";
import { Icon } from "../../../../component/view/icon";
import { DataGridView } from "../base/table";
import { useTableSortView } from "../../../../extensions/tablestore/sort";
import { Point, Rect } from "../../../../src/common/vector/point";
import { useTabelSchemaViewDrop } from "../../../../extensions/tablestore/switch.views/view";
import { getSchemaViewIcon } from "../../schema/util";
import { useFormPage } from "../../../../extensions/tablestore/form";
import { useTabelSchemaFormDrop } from "../../../../extensions/tablestore/switch.forms/view";
import { useTableFilterView } from "../../../../extensions/tablestore/filter";
import { useSelectMenuItem } from "../../../../component/view/menu";
import { MenuItemTypeValue } from "../../../../component/view/menu/declare";
import { useTablePropertyView } from "../../../../extensions/tablestore/property";
import { FieldType } from "../../schema/type";
import { TextArea } from "../../../../src/block/view/appear";
import { ChevronDownSvg, CollectTableSvg, FileSvg, FilterSvg, ImportSvg, LinkSvg, PropertysSvg, SettingsSvg, SortSvg, TemplatesSvg } from "../../../../component/svgs";
import "./style.less";
import { ElementType, getElementUrl } from "../../../../net/element.type";

export class DataGridTool extends React.Component<{ block: DataGridView }>{
    isOpenTool: boolean = false;
    render() {
        var props = this.props;
        props.block.dataGridTool = this;
        var self = this;
        async function changeDataGridView(event: React.MouseEvent) {
            event.stopPropagation();
            self.isOpenTool = true;
            var result = await useTabelSchemaViewDrop({ roundArea: Rect.fromEvent(event) }, {
                schema: props.block.schema
            });
            if (result) {
                props.block.onDataGridTurnView(result.id);
            }
            self.isOpenTool = false;
        }
        async function openSortView(event: React.MouseEvent) {
            self.isOpenTool = true;
            var r = await useTableSortView({ roundArea: Rect.fromEvent(event) }, { schema: props.block.schema, sorts: props.block.sorts });
            if (r) {
                await props.block.onUpdateSorts(r);
            }
            self.isOpenTool = false;
        }
        async function openFilterView(event: React.MouseEvent) {
            self.isOpenTool = true;
            var r = await useTableFilterView({ roundArea: Rect.fromEvent(event) }, { schema: props.block.schema, filter: props.block.filter, block: props.block });
            if (r) {
                await props.block.onUpdateFilter(r);
            }
            self.isOpenTool = false;
        }
        async function openConfigProperty(event: React.MouseEvent) {
            self.isOpenTool = true;
            var r = await useTablePropertyView({ roundArea: Rect.fromEvent(event) }, {
                schema: props.block.schema,
                gridView: props.block
            });
            self.isOpenTool = false;
        }
        async function openConfigView(event: React.MouseEvent) {
            self.isOpenTool = true;
            var menus = [
                { text: '复制链接', icon: LinkSvg, name: 'copylink' },
                { text: '属性', icon: PropertysSvg, name: 'propertys' },
                { text: '表单模板', icon: TemplatesSvg, name: 'form' },
                { text: '过滤', icon: FilterSvg, name: 'filter' },
                { text: '排序', icon: SortSvg, name: 'sort' },
                { type: MenuItemTypeValue.divide },
                { text: '显示行号', checked: props.block.showRowNum as any, type: MenuItemTypeValue.switch, name: 'showRowNum' },
                { text: '显示选中', checked: props.block.showCheckRow as any, type: MenuItemTypeValue.switch, name: 'check' },
                { text: '显示序号(自增)', checked: props.block.fields.some(s => s.field?.type == FieldType.autoIncrement), type: MenuItemTypeValue.switch, name: 'autoIncrement' },
                { type: MenuItemTypeValue.divide },
                // { text: '导入', icon: ImportSvg, name: 'import' },
                { text: '导出', disabled: true, icon: FileSvg, name: 'export' },
            ]
            var um = await useSelectMenuItem({ roundPoint: Point.from(event) }, menus, {
                async update(item) {
                    if (item.name == 'showRowNum') {
                        await props.block.onShowNum(item.checked)
                    }
                    else if (item.name == 'check') {
                        await props.block.onShowCheck(item.checked)
                    }
                    else if (item.name == 'autoIncrement') {
                        await props.block.onShowAutoIncrement(item.checked)
                    }
                }
            });
            if (um) {
                switch (um.item.name) {
                    case 'copylink':
                        var elementUrl = getElementUrl(ElementType.SchemaView, self.props.block.schema.id, self.props.block.syncBlockId);
                        //var url = self.props.block.page.pageInfo.url + '?elementUrl=' + encodeURIComponent(elementUrl);
                        break;
                    case 'propertys':
                        await openConfigProperty(event);
                        break;
                    case 'form':
                        await openFormDrop(event);
                        break;
                    case 'filter':
                        await openFilterView(event);
                        break;
                    case 'sort':
                        await openSortView(event);
                        break;
                }
            }
            self.isOpenTool = false;
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
        }
        async function openFormDrop(event: React.MouseEvent) {
            self.isOpenTool = true;
            event.stopPropagation();
            useTabelSchemaFormDrop({ roundArea: Rect.fromEvent(event) }, {
                schema: props.block.schema
            })
            self.isOpenTool = false;
        }
        var view = props.block.schema?.views?.find(g => g.id == props.block.syncBlockId)
        if (props.block.isLock == true) return <></>
        return <div className="sy-dg-tool">
            <div className="sy-dg-tool-title"><TextArea block={props.block} prop='tableText' placeholder={'表格名称'}></TextArea></div>
            <div className="sy-dg-tool-templates">
                <label onMouseDown={e => changeDataGridView(e)}>
                    <Icon size={14} icon={view ? getSchemaViewIcon(view.url) : CollectTableSvg}></Icon>
                    <span>{view?.text}</span>
                    <Icon size={10} icon={ChevronDownSvg}></Icon>
                </label>
            </div>
            {props.block.isOver && <div className="sy-dg-tool-operators">
                <label onMouseDown={e => openConfigProperty(e)}><Icon size={14} icon={SettingsSvg}></Icon><span>字段配置</span></label>
                <label onMouseDown={e => openFilterView(e)}><Icon size={14} icon={FilterSvg}></Icon><span>过滤</span></label>
                <label onMouseDown={e => openSortView(e)}><Icon size={14} icon={SortSvg}></Icon><span>排序</span></label>
                <label onMouseDown={e => openConfigView(e)}><Icon size={14} icon='elipsis:sy'></Icon></label>
                <div className="sy-dg-tool-operators-add">
                    <span className="text" onClick={e => openForm(e)}>新增</span>
                    <span className="icon" onClick={e => openFormDrop(e)}><Icon size={10} icon={ChevronDownSvg}></Icon></span>
                </div>
            </div>}
        </div>
    }
}


