import React from "react";
import { EventsComponent } from "../../../component/lib/events.component";
import { Input } from "../../../component/view/input";
import { PopoverSingleton } from "../../../component/popover/popover";
import { PopoverPosition } from "../../../component/popover/position";
import { getSchemaViewIcon, getSchemaViews } from "../../../blocks/data-grid/schema/util";
import { CheckSvg, CollectTableSvg } from "../../../component/svgs";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import lodash from "lodash";
import { MenuItem, MenuItemType } from "../../../component/view/menu/declare";
import { MenuView } from "../../../component/view/menu/menu";
import { util } from "../../../util/util";
import { lst } from "../../../i18n/store";
import { BlockUrlConstant } from "../../../src/block/constant";
import { CardFactory } from "../../../blocks/data-grid/template/card/factory/factory";
import { Icon } from "../../../component/view/icon";

/**
 * 
 * 创建数据表格
 * 选择数据模板
 * 
 * 选择已存在的表格视图
 * 
 */
export class DataGridCreate extends EventsComponent {
    url: string = BlockUrlConstant.DataGridTable;
    source: 'tableView' | 'dataView' = 'tableView';
    viewText: string = '';
    renderItems() {
        var self = this;
        var items: MenuItem[] = [];
        var cms = CardFactory.getCardModels();
        var cmsPanel: MenuItem = {
            type: MenuItemType.container,
            containerHeight: 180,
            childs: []
        }
        items.push({ text: lst('创建新表格'), type: MenuItemType.text })
        items.push({
            text: lst('表格'),
            value: BlockUrlConstant.DataGridTable,
            name: 'tableView',
            icon: getSchemaViewIcon({ url: BlockUrlConstant.DataGridTable } as any),
            checkLabel: BlockUrlConstant.DataGridTable == self.url,
        })
        items.push({ text: lst('数据模板'), type: MenuItemType.text })
        cms.map(c => {
            {
                cmsPanel.childs.push(
                    {
                        type: MenuItemType.custom,
                        name: 'dataView',
                        value: c.model.url,
                        render(item, view) {
                            return <div className="flex-full relative item-hover round padding-w-10 padding-h-5">
                                <div className="flex-fixed">
                                    <img src={c.model.image} className="obj-center h-40 w-80" />
                                </div>
                                <div className="flex-auto gap-l-10 f-14">
                                    <div>{c.model.title}</div>
                                    <div className="remark">{c.model.remark}</div>
                                </div>
                                {self.source == 'dataView' && self.url == c.model.url && <div className="pos pos-right pos-t-5 pos-r-5 size-20 cursor round">
                                    <Icon size={16} icon={CheckSvg}></Icon>
                                </div>}
                            </div>
                        }
                    })
            }
        })
        items.push(cmsPanel)
        items.push({ type: MenuItemType.gap })
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
            items.push({ type: MenuItemType.gap })
            items.push({ text: lst('选择已创建表格'), type: MenuItemType.text })
            items.push(itemPanel);
        }
        async function input(item) {
            if (item.name == 'name') {

            }
        }
        async function select(item) {
            if (item?.name == 'table') {

            }
            else if (item?.name == 'view') {
                self.emit('save', {
                    schemaId: item.value.tableId,
                    syncBlockId: item.value.viewId,
                    url: item.value.viewUrl
                });
            }
            else if (item.name == 'tableView') {
                self.url = item.value;
                self.source = item.name;
                self.viewText = '';
                self.forceUpdate()
            }
            else if (item.name == 'dataView') {
                self.url = item.value;
                self.source = item.name;
                self.viewText = item.text;
                self.forceUpdate()
            }
        }
        function click(item, e) {
            if (e) e.stopPropagation();
            if (item.name == 'createTable') {
                var it = items.find(c => c.name == 'table');
                if (it.value) {
                    self.emit('save', {
                        text: it.value || self.viewText || lst('未命名表格'),
                        url: self.url,
                        source: self.source
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
                // maxHeight: 300,
                paddingTop: 0,
                paddingBottom: 0,
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
    async open() {
        await TableSchema.onLoadAll()
        this.forceUpdate();
    }
}

export async function useDataGridCreate(pos: PopoverPosition) {
    let popover = await PopoverSingleton(DataGridCreate, { mask: true });
    let fv = await popover.open(pos);
    await fv.open();
    return new Promise((resolve: (data: {
        schemaId?: string,
        syncBlockId?: string,
        url?: string,
        text?: string,
        source?: 'tableView' | 'dataView'

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

