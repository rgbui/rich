import lodash from "lodash";
import React from "react";
import { ReactNode } from "react";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { getSchemaViewIcon } from "../../../blocks/data-grid/schema/util";
import { Confirm } from "../../../component/lib/confirm";
import { EventsComponent } from "../../../component/lib/events.component";
import { CollectTableSvg, DotsSvg, TrashSvg } from "../../../component/svgs";
import { MenuItem, MenuItemType } from "../../../component/view/menu/declare";
import { MenuView } from "../../../component/view/menu/menu";
import { util } from "../../../util/util";
import { PopoverSingleton } from "../../popover/popover";
import { PopoverPosition } from "../../popover/position";
import "./style.less";

export class DataSourceView extends EventsComponent {
    render(): ReactNode {
        var self = this;
        var saveTable = lodash.debounce(async (schema: TableSchema, text: string) => {
            if (text) {
                var it = self.mv.props.items.find(g => g.value == schema.id);
                if (it) {
                    it.text = text;
                    self.mv.forceUpdate()
                }
                await schema.update({ text })
            }
        }, 800)
        async function input(item) {
            if (item.name == 'name') {
                saveTable(item.data, item.value);
            }
        }
        async function select(item) {
            if (item?.name == 'table') {
                // self.onChange(item.value);
                self.emit('save', item.value);
            }
            else if (item?.name == 'view') {
                self.emit('save', item.value);
            }
            else if (item?.name == 'deleteTable') {
                if (await Confirm('确认要删除表格吗')) {
                    await TableSchema.deleteTableSchema(item.value);
                    self.forceUpdate()
                }
            }
        }
        function click(item) {

        }
        var items: MenuItem[] = [];
        var list = Array.from(TableSchema.schemas.values());
        list = lodash.sortBy(list, g =>0-g.createDate.getTime())
        list.forEach((rd) => {
            var btns = undefined
            if (this.editTable) btns = [{ icon: DotsSvg, name: 'property' }]
            if (this.selectView) {
                var cs: MenuItem[] = [];
                if (Array.isArray(rd.views) && rd.views.length > 0) {
                    cs.push({ type: MenuItemType.text, text: '视图' })
                    cs.push(...rd.views.map(rv => {
                        return {
                            text: rv.text,
                            value: {
                                tableId: rd.id,
                                viewUrl: rv.url,
                                type: 'view',
                                viewId: rv.id
                            },
                            name: 'view',
                            checkLabel: rv.id == self.currentViewId,
                            icon: getSchemaViewIcon(rv.url),
                        }
                    }))
                }

                // if (Array.isArray(rd.recordViews) && rd.recordViews.length > 0) {
                //     cs.push({ type: MenuItemType.text, text: '表单' })
                //     cs.push(...rd.recordViews.map(rv => {
                //         return {
                //             text: rv.text,
                //             value: { tableId: rd.id, type: 'form', viewId: rv.id },
                //             name: 'view',
                //             // icon: getSchemaViewIcon(rv.url),
                //         }
                //     }))
                // }

                if (cs.length > 0) {
                    cs.splice(0, 0, ...[
                        {
                            name: 'name',
                            type: MenuItemType.input,
                            value: rd.text,
                            text: '编辑表名',
                            data: rd,
                        },
                        { type: MenuItemType.divide }
                    ])
                }
                else cs.push({
                    name: 'name',
                    type: MenuItemType.input,
                    value: rd.text,
                    text: '编辑表名',
                    data: rd,
                })
                if (cs.length > 0 && cs.last().type != MenuItemType.divide) {
                    cs.push({ type: MenuItemType.divide });
                    cs.push({
                        text: '删除表格',
                        name: 'deleteTable',
                        icon: TrashSvg,
                        value: rd.id
                    })
                }
                else cs.push({
                    text: '删除表格',
                    name: 'deleteTable',
                    icon: TrashSvg,
                    value: rd.id
                })
                items.push({
                    text: rd.text,
                    value: rd.id,
                    remark: util.showTime(rd.createDate),
                    icon: (rd as any).icon || CollectTableSvg,
                    forceHasChilds: true,
                    childs: cs
                })
            }
            else {
                items.push({
                    name: 'table',
                    text: rd.text,
                    value: rd.id,
                    label: util.showTime(rd.createDate),
                    icon: (rd as any).icon || CollectTableSvg,
                    checkLabel: rd.id == this.currentTableId,
                    btns: btns
                })
            }
        })

        return <MenuView ref={e => this.mv = e} input={input}
            select={select}
            click={click} style={{
                width: 300,
                maxHeight: 300,
                paddingTop: 10,
                paddingBottom: 30,
                overflowY: 'auto'
            }} items={items}></MenuView>
    }
    private mv: MenuView;
    currentTableId: string = '';
    currentViewId?: string = '';
    selectView: boolean = false;
    editTable: boolean = false;
    async open(option: {
        tableId?: string,
        viewId?: string,
        selectView?: boolean,
        editTable?: boolean
    }) {
        this.selectView = option.selectView;
        this.currentTableId = option.tableId;
        this.currentViewId = option.viewId;
        this.editTable = option.editTable;
        await TableSchema.onLoadAll()
        this.forceUpdate();
    }
}

export async function useDataSourceView(pos: PopoverPosition,
    option: {
        tableId?: string,
        viewId?: string,
        selectView?: boolean,
        editTable?: boolean
    }) {
    let popover = await PopoverSingleton(DataSourceView, { mask: true });
    let fv = await popover.open(pos);
    fv.open(option);
    return new Promise((resolve: (data: string | { tableId: string, viewId: string, type: 'view' | 'form', viewUrl?: string }) => void, reject) => {
        fv.only('close', () => {
            popover.close();
            resolve(undefined);
        })
        fv.only('save', (g) => {
            resolve(g);
            popover.close();
        })
        popover.only('close', () => {
            resolve(undefined);
        })
    })
}