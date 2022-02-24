import React from "react";
import { Icon } from "../../../../component/view/icon";
import { DataGridView } from "../base/table";
import Settings from "../../../../src/assert/svg/settings.svg";
import Filter from "../../../../src/assert/svg/filter.svg";
import Sort from "../../../../src/assert/svg/sort.svg";
import chevronDown from "../../../../src/assert/svg/chevronDown.svg";
import collectTable from "../../../../src/assert/svg/collectTable.svg";
import "./style.less";
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
import LinkSvg from "../../../../src/assert/svg/link.svg";
import PropertySvg from "../../../../src/assert/svg/propertys.svg";
import FilterSvg from "../../../../src/assert/svg/filter.svg";
import SortSvg from "../../../../src/assert/svg/sort.svg";
import TemplatesSvg from "../../../../src/assert/svg/templates.svg";
import ImportSvg from "../../../../src/assert/svg/import.svg";
import FileSvg from "../../../../src/assert/svg/file.svg";
import { FieldType } from "../../schema/type";
export function DataGridTool(props: { block: DataGridView }) {
    async function changeDataGridView(event: React.MouseEvent) {
        var result = await useTabelSchemaViewDrop({ roundArea: Rect.fromEvent(event) }, {
            schema: props.block.schema
        });
        if (result) {
            props.block.onDataGridTurnView(result.id);
        }
    }
    async function openSortView(event: React.MouseEvent) {
        var r = await useTableSortView({ roundArea: Rect.fromEvent(event) }, { schema: props.block.schema, sorts: props.block.sorts });
        if (r) {
            await props.block.onUpdateSorts(r);
        }
    }
    async function openFilterView(event: React.MouseEvent) {
        var r = await useTableFilterView({ roundArea: Rect.fromEvent(event) }, { schema: props.block.schema, filter: props.block.filter, block: props.block });
        if (r) {
            await props.block.onUpdateFilter(r);
        }
    }
    async function openConfigProperty(event: React.MouseEvent) {
        var r = await useTablePropertyView({ roundArea: Rect.fromEvent(event) }, {
            schema: props.block.schema,
            gridView: props.block
        });
        if (r) {

        }
    }
    async function openConfigView(event: React.MouseEvent) {
        var menus = [
            { text: '复制链接', icon: LinkSvg, name: 'copylink' },
            { text: '属性', icon: PropertySvg, name: 'propertys' },
            { text: '表单模板', icon: TemplatesSvg, name: 'form' },
            { text: '过滤', icon: FilterSvg, name: 'filter' },
            { text: '排序', icon: SortSvg, name: 'sort' },
            { type: MenuItemTypeValue.divide },
            { text: '显示行号', checked: props.block.showRowNum as any, type: MenuItemTypeValue.switch, name: 'showRowNum' },
            { text: '显示选中', checked: props.block.showCheckRow as any, type: MenuItemTypeValue.switch, name: 'check' },
            { text: '显示编号(自增)', checked: props.block.fields.some(s => s.field?.type == FieldType.autoIncrement), type: MenuItemTypeValue.switch, name: 'autoIncrement' },
            { type: MenuItemTypeValue.divide },
            { text: '导入', icon: ImportSvg, name: 'import' },
            { text: '导出', icon: FileSvg, name: 'export' },
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
    }
    async function openForm(event: React.MouseEvent) {
        var newRow = await useFormPage({
            schema: props.block.schema,
            recordViewId: props.block.schema.recordViews.first().id
        });
        if (newRow) {
            await props.block.onAddRow(newRow, undefined, 'after')
        }
    }
    async function openFormDrop(event: React.MouseEvent) {
        event.stopPropagation();
        useTabelSchemaFormDrop({ roundArea: Rect.fromEvent(event) }, {
            schema: props.block.schema
        })
    }
    var view = props.block.schema?.views?.find(g => g.id == props.block.syncBlockId)
    if (props.block.isLock == true) return <></>
    return <div className="sy-dg-tool">
        <div className="sy-dg-tool-templates">
            <label onMouseDown={e => changeDataGridView(e)}>
                <Icon size={14} icon={view ? getSchemaViewIcon(view.url) : collectTable}></Icon>
                <span>{view?.text}</span>
                <Icon size={10} icon={chevronDown}></Icon>
            </label>
        </div>
        <div className="sy-dg-tool-operators">
            <label onMouseDown={e => openConfigProperty(e)}><Icon size={14} icon={Settings}></Icon><span>字段配置</span></label>
            <label onMouseDown={e => openFilterView(e)}><Icon size={14} icon={Filter}></Icon><span>过滤</span></label>
            <label onMouseDown={e => openSortView(e)}><Icon size={14} icon={Sort}></Icon><span>排序</span></label>
            <label onMouseDown={e => openConfigView(e)}><Icon size={14} icon='elipsis:sy'></Icon></label>
            <div className="sy-dg-tool-operators-add">
                <span className="text" onClick={e => openForm(e)}>新增</span>
                <span className="icon" onClick={e => openFormDrop(e)}><Icon size={10} icon={chevronDown}></Icon></span>
            </div>
        </div>
    </div>
}