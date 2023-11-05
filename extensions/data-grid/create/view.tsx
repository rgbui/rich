import React from "react";
import { EventsComponent } from "../../../component/lib/events.component";
import { PopoverSingleton } from "../../../component/popover/popover";
import { PopoverPosition } from "../../../component/popover/position";
import { getChartViews, getSchemaViewIcon, getSchemaViews } from "../../../blocks/data-grid/schema/util";
import { MenuItem, MenuItemType } from "../../../component/view/menu/declare";
import { MenuView } from "../../../component/view/menu/menu";
import { lst } from "../../../i18n/store";
import { CardFactory } from "../../../blocks/data-grid/template/card/factory/factory";
import { CheckSvg } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";

export class DataGridCreateTable extends EventsComponent {
    url: string = '/data-grid/table';
    source: 'tableView' | 'dataView' = 'tableView';
    viewText: string = '';
    renderItems() {
        var self = this;
        var items: MenuItem[] = [];
        items.push({
            type: MenuItemType.input,
            name: "table",
            text: this.selectView ? lst('输入视图名称') : lst('输入表格名称'),
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
        var cms = CardFactory.getCardModels(this.schema);
        items.push({
            text: lst('数据视图'),
            icon: { name: 'bytedance-icon', code: 'application-two' },
            childsStyle: { width: 300 },
            childs: cms.map(c => {
                return {
                    type: MenuItemType.custom,
                    name: 'dataView',
                    value: c.url,
                    render(item, view) {
                        return <div className="flex-full relative item-hover round padding-w-14 padding-h-10">
                            <div className="flex-fixed">
                                <img src={c.image} className="obj-center h-60 w-120" />
                            </div>
                            <div className="flex-auto gap-l-10">
                                <div>{c.title}</div>
                                <div className="remark">{c.remark}</div>
                            </div>
                            {self.source == 'dataView' && self.url == c.url && <div className="pos pos-right pos-t-5 pos-r-5 size-20 cursor round">
                                <Icon size={16} icon={CheckSvg}></Icon>
                            </div>}
                        </div>
                    }
                }
            })
        })
        var gs = getChartViews();
        items.push({
            text: lst('统计图'),
            icon: { name: 'bytedance-icon', code: 'chart-pie-one' },
            childsStyle: { width: 300 },
            childs: gs.map(g => {
                return {
                    type: MenuItemType.custom,
                    name: 'tableView',
                    value: g.url,
                    render(item, view) {
                        return <div className="flex-full relative item-hover round padding-w-14 padding-h-10">
                            <div className="flex-fixed">
                                <img src={g.image} className="obj-center h-60 w-120" />
                            </div>
                            <div className="flex-auto gap-l-10">
                                <div>{g.title}</div>
                                <div className="remark">{g.remark}</div>
                            </div>
                            {self.source == 'tableView' && self.url == g.url && <div className="pos pos-right pos-t-5 pos-r-5 size-20 cursor round">
                                <Icon size={16} icon={CheckSvg}></Icon>
                            </div>}
                        </div>
                    }
                }
            })
        })
        items.push({
            type: MenuItemType.divide
        })
        items.push({
            type: MenuItemType.button,
            text: this.selectView ? lst('创建视图') : lst('创建表格'),
            name: 'createTable',
            buttonClick: 'click'
        })
        async function input(item) {
            if (item.name == 'name') {
                //saveTable(item.data, item.value);
            }
        }
        async function select(item) {
            console.log('select', item);
            if (item.name == 'tableView') {
                self.url = item.value;
                self.source = item.name;
                self.viewText = item.text;
                self.forceUpdate()
            }
            else if (item.name == 'dataView') {
                self.url = item.value;
                self.source = item.name;
                self.viewText = item.text;
                self.forceUpdate()
            }
        }
        function click(item) {
            if (item.name == 'createTable') {
                var it = items.find(c => c.name == 'table');
                self.emit('save', {
                    text: it.value || self.viewText,
                    url: self.url,
                    source: self.source
                })
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
    selectView: boolean = false;
    schema: TableSchema = null;
    async open(options: { selectView: boolean, schema: TableSchema }) {
        this.selectView = options?.selectView || false;
        this.schema = options?.schema;
        this.forceUpdate();
    }
}

export async function useCreateDataGrid(pos: PopoverPosition, options?: { selectView: boolean, schema: TableSchema }) {
    let popover = await PopoverSingleton(DataGridCreateTable, { mask: true });
    let fv = await popover.open(pos);
    await fv.open(options);
    return new Promise((resolve: (data: {
        schemaId?: string,
        syncBlockId?: string,
        url?: string,
        text?: string,
        source?: DataGridCreateTable['source']
    }) => void, reject) => {
        fv.only('save', (value) => {
            console.log('save value', value);
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

