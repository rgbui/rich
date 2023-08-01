import React from "react";
import { EventsComponent } from "../../../component/lib/events.component";
import { PopoverSingleton } from "../../popover/popover";
import { PopoverPosition } from "../../popover/position";
import { getSchemaViewIcon, getSchemaViews } from "../../../blocks/data-grid/schema/util";
import { MenuItem, MenuItemType } from "../../../component/view/menu/declare";
import { MenuView } from "../../../component/view/menu/menu";
import { lst } from "../../../i18n/store";

export class DataGridCreateTable extends EventsComponent {
    url: string = '/data-grid/table';
    renderItems() {
        var self = this;
        var items: MenuItem[] = [];
        items.push({
            type: MenuItemType.input,
            name: "table",
            text: lst('输入表格名称'),
        })
        items.push({ type: MenuItemType.gap })
        var views = getSchemaViews();
        views.forEach(v => {
            items.push({
                text: v.text,
                value: v.url,
                name: 'tableView',
                icon: getSchemaViewIcon(v.url),
                checkLabel: v.url == self.url,
            })
        })
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
            if (item.name == 'tableView') {
                self.url = item.value;
                self.forceUpdate()
            }
        }
        function click(item) {
            if (item.name == 'createTable') {
                var it = items.find(c => c.name == 'table');
                if (it.value) {
                    self.emit('save', {
                        text: it.value,
                        url: self.url
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
            }} items={items}></MenuView>
    }
    private mv: MenuView;
    render() {
        return <div className="gap-h-10">
            {this.renderItems()}
        </div>
    }
    async open(options: { selectView: boolean }) {
        if (options) {
            Object.assign(this, options);
        }
        this.forceUpdate();
    }
}

export async function useCreateDataGrid(pos: PopoverPosition, options?: { selectView: boolean }) {
    let popover = await PopoverSingleton(DataGridCreateTable, { mask: true });
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

