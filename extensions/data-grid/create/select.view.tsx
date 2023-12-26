import React from "react";
import { EventsComponent } from "../../../component/lib/events.component";
import { Input } from "../../../component/view/input";
import { PopoverSingleton } from "../../../component/popover/popover";
import { PopoverPosition } from "../../../component/popover/position";
import { getSchemaViewIcon, getSchemaViews } from "../../../blocks/data-grid/schema/util";
import { CollectTableSvg } from "../../../component/svgs";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import lodash from "lodash";
import { MenuItem, MenuItemType } from "../../../component/view/menu/declare";
import { MenuView } from "../../../component/view/menu/menu";
import { util } from "../../../util/util";
import { lst } from "../../../i18n/store";


export class DataGridSelectorView extends EventsComponent {
    renderItems() {
        var self = this;
        var items: MenuItem[] = [];
        var itemPanel: MenuItem = {
            type: MenuItemType.container,
            containerHeight: 180,
            childs: []
        }

        var list = Array.from(TableSchema.schemas.values());
        list = lodash.sortBy(list, g => 0 - g.createDate.getTime())
        list.forEach((rd) => {
            var btns = undefined
            var cs: MenuItem[] = [];
            if (Array.isArray(rd.views) && rd.views.length > 0) {
                cs.push({ type: MenuItemType.text, text: lst('视图') })
                var srs = getSchemaViews();
                cs.push(...rd.views.findAll(g => srs.some(s => s.url == g.url)).map(rv => {
                    return {
                        text: rv.text,
                        value: {
                            tableId: rd.id,
                            viewUrl: rv.url,
                            type: 'view',
                            viewId: rv.id
                        },
                        name: 'view',
                        // checkLabel: rv.id == self.currentViewId,
                        icon: getSchemaViewIcon(rv),
                    }
                }))
            }
            itemPanel.childs.push({
                text: rd.text,
                value: rd.id,
                remark: util.showTime(rd.createDate),
                icon: (rd as any).icon || CollectTableSvg,
                forceHasChilds: true,
                childs: cs
            })
        })
        if (list.length > 0) {
            items.push({ text: lst('选择已创建表格'), type: MenuItemType.text })
            items.push(itemPanel);
            items.push({ type: MenuItemType.divide })
            items.push({ text: lst('创建新表格'), type: MenuItemType.text })
        }
        items.push({
            type: MenuItemType.input,
            name: "table",
            text: lst('输入表格名称'),
        })
        items.push({ type: MenuItemType.gap })
        items.push({
            type: MenuItemType.button,
            text: lst('创建表格'),
            name: 'createTable',
            buttonClick: 'click'
        })
        async function input(item) {
            if (item.name == 'name') {
                //saveTable(item.data, item.value);
            }
        }
        async function select(item) {
            if (item?.name == 'table') {
                // self.onChange(item.value);
                // self.emit('save', item.value);
            }
            else if (item?.name == 'view') {
                self.emit('save', {
                    schemaId: item.value.tableId,
                    syncBlockId: item.value.viewId,
                    url: item.value.viewUrl
                });
            }
            else if (item?.name == 'deleteTable') {
                // if (await Confirm('确认要删除表格吗')) {
                //     await TableSchema.deleteTableSchema(item.value);
                //     self.forceUpdate()
                // }
            }
        }
        function click(item, e) {
            if (e) e.stopPropagation();
            if (item.name == 'createTable') {
                var it = items.find(c => c.name == 'table');
                if (it.value) {
                    self.emit('save', {
                        text: it.value,
                        url: '/data-grid/table'
                    })
                }
            }
        }
        return <MenuView
            ref={e => this.mv = e}
            input={input}
            select={select}
            click={click}
            style={{
                width: 300,
                maxHeight: 300,
                paddingTop: 10,
                paddingBottom: 10,
                overflowY: 'auto'
            }}
            items={items}></MenuView>
    }
    private mv: MenuView;
    render() {
        return <div className="gap-h-10">
            {this.renderItems()}
        </div>
    }
    input: Input;
    selectView: boolean = false;
    async open(options: { selectView: boolean }) {
        // this.url = '/data-grid/table';
        await TableSchema.onLoadAll()
        if (options) {
            Object.assign(this, options);
        }
        this.forceUpdate();
    }
}

export async function useDataGridSelectView(pos: PopoverPosition, options?: { selectView: boolean }) {
    let popover = await PopoverSingleton(DataGridSelectorView, { mask: true });
    let fv = await popover.open(pos);
    await fv.open(options);
    return new Promise((resolve: (data: {
        schemaId?: string,
        syncBlockId?: string,
        url?: string,
        text?: string,

    }) => void, reject) => {
        fv.only('save', (value) => {
            popover.close();
            resolve(value);
        });
        fv.only('close', () => {
            popover.close();
            resolve(null);
        });
        popover.only('close', () => {
            resolve(null)
        });
    })
}

