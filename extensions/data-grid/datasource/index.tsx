import lodash from "lodash";
import React from "react";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { getSchemaViewIcon, getSchemaViews } from "../../../blocks/data-grid/schema/util";
import { Confirm } from "../../../component/lib/confirm";
import { EventsComponent } from "../../../component/lib/events.component";
import { DotsSvg, PlusSvg, TrashSvg } from "../../../component/svgs";
import { MenuItem, MenuItemType } from "../../../component/view/menu/declare";
import { MenuView } from "../../../component/view/menu/menu";
import { util } from "../../../util/util";
import { PopoverSingleton } from "../../../component/popover/popover";
import { PopoverPosition } from "../../../component/popover/position";
import { channel } from "../../../net/channel";
import { lst } from "../../../i18n/store";
import { IconValueType } from "../../../component/view/icon";
import { useCreateDataGridView } from "../create/view";
import { Spin } from "../../../component/view/spin";
import { S } from "../../../i18n/view";
import { Page } from "../../../src/page";

export class DataSourceView extends EventsComponent {
    getItems() {
        var self = this;
        var items: MenuItem[] = [];
        var rs: MenuItem[] = [];
        items.push({ type: MenuItemType.text, text: this.selectView ? lst('选择数据表视图') : lst('选择表格') })
        var list = this.schemas;
        list = lodash.sortBy(list, g => 0 - g.createDate.getTime())
        list.forEach((rd) => {
            var btns = undefined
            if (this.editTable) btns = [{ icon: DotsSvg, name: 'property' }]
            if (this.selectView) {
                var cs: MenuItem[] = [];
                if (Array.isArray(rd.views) && rd.views.length > 0) {
                    cs.push({ type: MenuItemType.text, text: lst('视图') })
                    var srs = getSchemaViews();
                    cs.push(...rd.listViews.map(rv => {
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
                            icon: getSchemaViewIcon(rv),
                        }
                    }))
                }
                if (cs.length > 0) {
                    cs.splice(0, 0, ...[
                        {
                            name: 'name',
                            type: MenuItemType.inputTitleAndIcon,
                            value: rd.text,
                            icon: lodash.cloneDeep(rd.icon) || { name: 'byte', code: 'table' },
                            text: lst('编辑数据表名'),
                            data: rd,
                        },
                        { type: MenuItemType.divide }
                    ])
                }
                else cs.push({
                    name: 'name',
                    type: MenuItemType.inputTitleAndIcon,
                    value: rd.text,
                    icon: lodash.cloneDeep(rd.icon) || { name: 'byte', code: 'table' },
                    placeholder: lst('编辑数据表名'),
                    data: rd,
                })
                if (this.createView == true) {
                    if (Array.isArray(rd.views) && rd.views.length > 0)
                        cs.push({ type: MenuItemType.divide })
                    cs.push(...[
                        {
                            name: 'addView',
                            value: rd.id,
                            type: MenuItemType.button, text: lst('创建数据表视图')
                        }
                    ])
                    if (this.editTable == true)
                        cs.push({ type: MenuItemType.divide })
                }
                if (this.editTable == true) {
                    if (cs.length > 0 && cs.last().type != MenuItemType.divide) {
                        cs.push({ type: MenuItemType.divide });
                        cs.push({
                            text: lst('删除数据表'),
                            name: 'deleteTable',
                            icon: TrashSvg,
                            value: rd.id,
                            warn: true
                        })
                    }
                    else cs.push({
                        text: lst('删除数据表'),
                        name: 'deleteTable',
                        icon: TrashSvg,
                        value: rd.id,
                        warn: true
                    })
                }
                rs.push({
                    text: rd.text,
                    value: rd.id,
                    remark: util.showTime(rd.createDate),
                    icon: (rd as any).icon || { name: 'byte', code: 'table' },
                    checkLabel: rd.id == this.currentTableId,
                    forceHasChilds: true,
                    childs: cs
                })
            }
            else {
                rs.push({
                    name: 'table',
                    text: rd.text,
                    value: rd.id,
                    remark: util.showTime(rd.createDate),
                    icon: (rd as any).icon || { name: 'byte', code: 'table' },
                    checkLabel: rd.id == this.currentTableId,
                })
            }
        })
        items.push({
            type: MenuItemType.container,
            childs: rs,
            containerHeight: 250
        })
        items.push({ type: MenuItemType.divide });
        if (this.createTable) {
            items.push({
                // type: MenuItemType.button,
                text: lst('创建数据表'),
                icon: PlusSvg,
                name: 'createTable'
            })
            items.push({ type: MenuItemType.divide });
        }
        items.push({
            type: MenuItemType.help,
            text: lst('了解数据表'),
            url: window.shyConfig?.isUS ? "https://help.shy.red/page/38#3qfPYqnTJCwwQ6P9zYx8Q8" : "https://help.shy.live/page/285#xcmSsiEKkYt3pgKVwyDHxJ"
        })
        return items;
    }
    render() {
        var self = this;
        var saveTable = lodash.debounce(async (schema: TableSchema, options?: { text?: string, icon?: IconValueType }) => {
            if (options) {
                await schema.update(options, 'DataSourceView')
                self.mv.forceUpdateItems(self.getItems())
                channel.air('/page/update/info', {
                    id: schema.id,
                    pageInfo: options as any
                })
            }
        }, 800)
        async function input(item) {
            if (item.name == 'name') {
                var dr: Record<string, any> = {};
                if (item.value != item.data.text) dr.text = item.value;
                if (typeof item.icon != 'function' && !lodash.isEqual(item.icon, item.data.icon)) dr.icon = item.icon;
                if (Object.keys(dr).length > 0)
                    saveTable(item.data, dr);
            }
        }
        async function select(item, event?: MouseEvent) {
           
            if (item?.name == 'table') {
                self.emit('save', item.value);
            }
            else if (item?.name == 'view') {
                self.emit('save', item.value);
            }
            else if (item?.name == 'deleteTable') {
                if (await Confirm(lst('确认要删除数据表吗'))) {
                    await TableSchema.deleteTableSchema(item.value);
                    self.forceUpdate()
                    channel.air('/page/remove', { item: { id: item.value } })
                }
            }
            else if (item?.name == 'createTable') {
                self.emit('createTable');
            }
            else if (item.name == 'addView') {
                // var po = Point.from(event)
                var sh = TableSchema.getTableSchema(item.value);
                var dg = await useCreateDataGridView(
                    self.pos,
                    { schema: sh }
                );
                if (dg) {
                    var sv = await sh.createSchemaView(dg.text, dg.url, null);
                    self.emit('save', {
                        tableId: sh.id,
                        viewUrl: sv.view.url,
                        type: 'view',
                        viewId: sv.view.id
                    });
                }
            }
        }
        var items = this.getItems();
        return <div>
            {this.createTableing && <div className="h-30 flex-center"><Spin></Spin><S>正在创建数据表...</S></div>}
            <MenuView ref={e => this.mv = e} input={input}
                select={select}
                style={{
                    width: this.width || 300,
                    paddingTop: 5,
                    paddingBottom: 5
                }} items={items}></MenuView>
        </div>
    }
    private mv: MenuView;
    createTableing: boolean = false;
    currentTableId: string = '';
    currentViewId?: string = '';
    selectView: boolean = false;
    createView: boolean = false;
    editTable: boolean = false;
    createTable: boolean = false;
    page: Page;
    schemas: TableSchema[] = []; pos: PopoverPosition
    width: number;
    async open(option: {
        page: Page,
        tableId?: string,
        viewId?: string,
        selectView?: boolean,
        createView?: boolean,
        editTable?: boolean,
        createTable?: boolean, width?: number
    }, pos: PopoverPosition) {
        this.width = option.width
        this.selectView = option.selectView;
        this.createView = option.createView;
        this.currentTableId = option.tableId;
        this.currentViewId = option.viewId;
        this.editTable = option.editTable;
        this.createTable = option.createTable;
        this.page = option.page
        this.pos = lodash.cloneDeep(pos);
        await TableSchema.onLoadAll()
        this.schemas = TableSchema.getSchemas(this.page.ws.id);
        this.forceUpdate();
    }
}

export async function useDataSourceView(pos: PopoverPosition,
    option: {
        page: Page,
        tableId?: string,
        viewId?: string,
        selectView?: boolean,
        createView?: boolean,
        editTable?: boolean,
        createTable?: boolean,
        width?: number
    },
    createTableCallback?: () => void) {
    let popover = await PopoverSingleton(DataSourceView, { mask: true });
    let fv = await popover.open(pos);
    fv.open(option, pos);
    return new Promise((resolve: (data: string | { tableId: string, viewId: string, type: 'view' | 'form', viewUrl?: string }) => void, reject) => {
        fv.only('close', () => {
            popover.close();
            resolve(undefined);
        })
        fv.only('save', (g) => {
            resolve(g);
            popover.close();
        })
        fv.only('createTable', () => {
            popover.close();
            resolve(undefined);
            createTableCallback?.();
        })
        popover.only('close', () => {
            resolve(undefined);
        })
    })
}