import React from "react";
import { SchemaFilter } from "../../../../blocks/data-grid/schema/filter";
import { TableSchema } from "../../../../blocks/data-grid/schema/meta";
import { EventsComponent } from "../../../../component/lib/events.component";
import { LinkWs } from "../../../../src/page/declare";
import { PopoverSingleton } from "../../../../component/popover/popover";
import { PopoverPosition } from "../../../../component/popover/position";
import { DotsSvg, DragHandleSvg, DuplicateSvg, Edit1Svg, EditSvg, PlusSvg, TrashSvg } from "../../../../component/svgs";
import { Icon } from "../../../../component/view/icon";
import { DragList } from "../../../../component/view/drag.list";
import { util } from "../../../../util/util";
import { lst } from "../../../../i18n/store";
import { S } from "../../../../i18n/view";
import { Divider } from "../../../../component/view/grid";
import { useSelectMenuItem } from "../../../../component/view/menu";
import { Point, Rect } from "../../../../src/common/vector/point";
import { MenuItemType } from "../../../../component/view/menu/declare";
import lodash from "lodash";
import { useCustomTableFilter } from "./custom";
import { HelpText } from "../../../../component/view/text";
import { IconArguments } from "../../../icon/declare";

export class DataGridFilterList extends EventsComponent {
    open(options: {
        schema: TableSchema,
        filters: SchemaFilterItem[],
        ws: LinkWs,
    }) {
        Object.assign(this, options);
        this.forceUpdate();
    }
    onAddRule(e) {
        this.filters.push({
            id: util.guid(),
            text: util.getListName(this.filters, lst('规则'), x => x.text),
            filter: {
                id: util.guid(),
                logic: 'and',
                items: []
            },
            visible: true
        });
        this.forceUpdate();
    }
    async openEdit(e: React.MouseEvent | Point, item: SchemaFilterItem) {
        var r = await useCustomTableFilter({ roundPoint: Point.from(e) },
            {
                filter: item.filter,
                schema: this.schema,
                ws: this.ws,
                onChange(e) {
                    item.filter = e;
                }
            }
        )
    }
    async openProperty(e: React.MouseEvent, item: SchemaFilterItem) {
        var self = this;
        var items = [
            { type: MenuItemType.inputTitleAndIcon, name: 'text', value: item.text, icon: item.icon || { name: 'bytedance-icon', code: 'association' } },
            { type: MenuItemType.divide },
            { name: 'edit', text: lst('编辑'), icon: { name: "byte", code: "write" } as any },
            { name: 'copy', text: lst('复制'), icon: DuplicateSvg },
            { type: MenuItemType.divide },
            { name: 'remove', text: lst('删除'), icon: TrashSvg }
        ]
        var point = Point.from(e);
        var r = await useSelectMenuItem({ roundArea: Rect.fromEvent(e) },
            items,
            {
                input(it) {
                    if (it.name == 'text') {
                        item.text = it.value;
                        if (it.icon) item.icon = lodash.cloneDeep(it.icon) as IconArguments;
                        else item.icon = null;
                        self.forceUpdate();
                    }
                }
            }
        );
        if (r) {
            if (r?.item.name == 'remove') {
                lodash.remove(this.filters, f => f.id == item.id);
                this.forceUpdate();
            }
            else if (r?.item.name == 'copy') {
                var copy = lodash.cloneDeep(item);
                copy.id = util.guid();
                copy.text = lst('复制') + copy.text;
                var at = this.filters.indexOf(item);
                this.filters.splice(at + 1, 0, copy);
                this.forceUpdate()
            }
            else if (r?.item.name == 'edit') {
                this.openEdit(point, item);
            }
        }
    }
    schema: TableSchema;
    formSchema: TableSchema;
    filters: SchemaFilterItem[] = [];
    ws: LinkWs
    render() {
        var self = this;
        async function change(to, from) {
            var f = self.filters[from];
            self.filters.splice(from, 1);
            self.filters.splice(to, 0, f);
            self.forceUpdate()
        }
        return <div className="bg-white shadow round padding-5 w-250">
            <div className="f-12 remark gap-b-10"><S>查询条件列表</S></div>
            <DragList onChange={change} isDragBar={e => e.closest('.drag-item') && !e.closest('[item-btn]') ? true : false}>
                {this.filters.map(f => {
                    return <div className="flex item-hover padding-w-5 h-30  round drag-item" key={f.id}>
                        <span className="flex-fixed flex-center size-24 round item-hover  cursor"><Icon size={16} icon={DragHandleSvg}></Icon></span>
                        <span className="flex-fixed flex-center size-24"><Icon size={16} icon={f.icon || { name: 'bytedance-icon', code: 'association' }}></Icon></span>
                        <span className="flex-auto">{f.text}</span>
                        <span className="flex-center size-24 round item-hover cursor" item-btn={'true'} onMouseDown={e => this.openEdit(e, f)}><Icon size={16} icon={Edit1Svg}></Icon></span>
                        <span className="flex-center size-24 round item-hover cursor" item-btn={'true'} onMouseDown={e => this.openProperty(e, f)}><Icon size={18} icon={DotsSvg}></Icon></span>
                    </div>
                })}
            </DragList>
            {this.filters.length > 0 && <Divider></Divider>}
            <div className="flex item-hover padding-w-5 h-30 round cursor" onMouseDown={e => this.onAddRule(e)}>
                <Icon size={18} icon={PlusSvg}></Icon><span className="gap-l-5">添加查询条件</span>
            </div>
            <Divider></Divider>
            <div className="h-30 flex">
                <HelpText url={window.shyConfig?.isUS ? "https://help.shy.red/page/50" : "https://shy.live/ws/help/page/1878"}>了解添加查询条件制做成查询按钮</HelpText>
            </div>
        </div>
    }
}

export type SchemaFilterItem = {
    id: string,
    text: string,
    icon?: IconArguments,
    filter: SchemaFilter,
    visible: boolean
}
export async function useDataGridFilterList(pos: PopoverPosition,
    option: {
        schema: TableSchema,
        filters: SchemaFilterItem[],
        formSchema: TableSchema,
        ws: LinkWs
    }) {
    let popover = await PopoverSingleton(DataGridFilterList, { mask: true });
    let fv = await popover.open(pos);
    fv.open(option);
    return new Promise((resolve: (data: SchemaFilterItem[]) => void, reject) => {
        fv.only('close', () => {
            popover.close();
            resolve(fv.filters);
        })
        popover.only('close', () => {
            resolve(fv.filters);
        })
    })
}