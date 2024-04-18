
import React from "react";
import { ReactNode } from "react";
import { DataGridView } from "../../../../blocks/data-grid/view/base";
import { EventsComponent } from "../../../../component/lib/events.component";
import { BlockUrlConstant } from "../../../../src/block/constant";
import { TableStoreGallery } from "../../../../blocks/data-grid/view/gallery";
import { FieldType } from "../../../../blocks/data-grid/schema/type";
import { BlockRenderRange } from "../../../../src/block/enum";
import { getSchemaViewIcon, getSchemaViews, GetFieldTypeSvg } from "../../../../blocks/data-grid/schema/util";
import { TableStore } from "../../../../blocks/data-grid/view/table";
import { TableStoreCalendar } from "../../../../blocks/data-grid/view/calendar";
import { TableStoreBoard } from "../../../../blocks/data-grid/view/board";
import { MenuView } from "../../../../component/view/menu/menu";
import { MenuItem, MenuItemType } from "../../../../component/view/menu/declare";
import lodash from "lodash";
import { CheckSvg, DetailSvg, GridPageDialougSvg, GridPagePageSvg, GridPageSlideSvg, LoopSvg } from "../../../../component/svgs";
import { Rect } from "../../../../src/common/vector/point";
import { lst } from "../../../../i18n/store";
import { CardFactory } from "../../../../blocks/data-grid/template/card/factory/factory";
import { Icon } from "../../../../component/view/icon";
import DataGridConfig from "..";

export class DataGridViewConfig extends EventsComponent<{ gc: DataGridConfig }> {
    get schema() {
        return this.block?.schema;
    }
    block: DataGridView;
    onOpen(block: DataGridView) {
        this.block = block;
        this.forceUpdate();
    }
    getItems() {
        var self = this;
        var cms = CardFactory.getCardModels(this.schema);
        var baseItems: MenuItem[]=[
            {
                value: this.block.schemaView.text,
                name: 'viewText',
                type: MenuItemType.inputTitleAndIcon,
                icon: getSchemaViewIcon(this.block.schemaView),
            },
            { type: MenuItemType.divide },
            {
                text: lst('视图类型'),
                icon: LoopSvg,
                childs: [
                    { text: lst('数据表视图'), type: MenuItemType.text, helpUrl: window.shyConfig?.isUS ? "https://help.shy.red/page/44#p6dtzzCsUHUrhyfNdrfkXh" : "https://help.shy.live/page/288#eNk3NZZyXWMCgMEMCyJRcG" },
                    ...getSchemaViews().map(v => {
                        return {
                            name: "toggleView",
                            value: v.url,
                            text: v.text,
                            icon: getSchemaViewIcon(v as any),
                            checkLabel: !this.block.getCardUrl() && this.block.url == v.url
                        }
                    }),
                    { type: MenuItemType.gap },
                    { text: lst('数据表模板'), type: MenuItemType.text, helpUrl: window.shyConfig?.isUS ? "https://help.shy.red/page/45#uQnBXa9C8oL491JK26T2QK" : 'https://help.shy.live/page/1870#3Fgw3UNGQErf8tZdJnhjru' },
                    ...cms.map(c => {
                        return {
                            type: MenuItemType.custom,
                            name: 'dataView',
                            value: c.model.url,
                            render(item, view) {
                                return <div className="flex-full relative item-hover round padding-w-10 padding-h-5">
                                    <div className="flex-fixed">
                                        <img src={c.model.image} className="obj-center round h-40 w-80" />
                                    </div>
                                    <div className="flex-auto gap-l-10 f-14">
                                        <div>{c.model.title}</div>
                                        <div className="remark">{c.model.remark}</div>
                                    </div>
                                    {self.block.getCardUrl() == c.model.url && <div className="pos pos-right pos-t-5 pos-r-5 size-20 cursor round ">
                                        <Icon size={16} icon={CheckSvg}></Icon>
                                    </div>}
                                </div>
                            }
                        }
                    }),
                    {
                        type: MenuItemType.custom,
                        render(item, view) {
                            return <div className="flex padding-w-10 padding-h-3"><span className="remark f-14">{lst('AI生成数据视图')}</span><span className="op-3 gap-l-5 bg-p text-white padding-w-5 round l-20">coming soon</span></div>
                        }
                    }
                ]
            },
            { type: MenuItemType.divide },
            {
                text: lst('每次加载的数量'),
                value: this.block.size,
                name: 'size',
                type: MenuItemType.select,
                options: [
                    { text: '20' + lst('条'), value: 20 },
                    { text: '50' + lst('条'), value: 50 },
                    { text: '80' + lst('条'), value: 80 },
                    { text: '100' + lst('条'), value: 100 },
                    { text: '150' + lst('条'), value: 150 },
                    { text: '200' + lst('条'), value: 200 }
                ]
            },
            {
                text: lst('分页'),
                type: MenuItemType.switch,
                checked: (this.block as TableStore).hasTriggerBlock(BlockUrlConstant.DataGridPage),
                name: 'showPager'
            },
            { type: MenuItemType.divide },
            {
                text: lst('新增打开方式'),
                value: this.block.createRecordSource,
                name: 'createRecordSource',
                type: MenuItemType.select,
                optionIconSize: 18,
                options: [
                    { text: lst('对话框'), value: 'dialog', icon: GridPageDialougSvg, iconSize: 18 },
                    { text: lst('右侧栏'), value: 'slide', icon: GridPageSlideSvg, iconSize: 18 },
                    { text: lst('页面'), value: 'page', icon: GridPagePageSvg, iconSize: 18 },
                ]
            },
            {
                text: lst('浏览打开方式'),
                value: this.block.openRecordSource,
                name: 'openRecordSource',
                type: MenuItemType.select,
                optionIconSize: 18,
                options: [
                    { text: lst('对话框'), value: 'dialog', icon: GridPageDialougSvg, iconSize: 18 },
                    { text: lst('右侧栏'), value: 'slide', icon: GridPageSlideSvg, iconSize: 18 },
                    { text: lst('页面'), value: 'page', icon: GridPagePageSvg, iconSize: 18 },
                ]
            },
            {
                text: lst('浏览打开模板'),
                value: this.block.openRecordViewId,
                name: 'openRecordViewId',
                type: MenuItemType.select,
                selectDropWidth: 240,
                options: [
                    {
                        text: lst('原始数据记录'),
                        value: '',
                        icon: { name: 'bytedance-icon', code: 'notes' },
                        helpText: lst('了解原始数据记录'),
                        helpUrl: window.shyConfig?.isUS ? "https://help.shy.red/page/42#6HAcf3LaXVpVtWnGU4LwuR" : "https://help.shy.live/page/1870#miDzBhMDdknUCHNkZvQbaM"
                    },
                    { type: MenuItemType.divide },
                    ...this.schema.recordViews.map(rd => {
                        return {
                            text: rd.text,
                            value: rd.id,
                            icon: rd.icon || DetailSvg
                        }
                    })
                ]
            }
        ]
        if (this.block.url == BlockUrlConstant.DataGridTable) {
            if (!this.block.isDefineViewTemplate)
                baseItems.splice(baseItems.length, 0, ...[
                    { type: MenuItemType.divide },
                    { text: lst('显示行号'), type: MenuItemType.switch, checked: (this.block as TableStore).showRowNum, name: 'showRowNum' },
                    { text: lst('批量选择行'), helpText: lst('了解批量选择行'), helpUrl: window.shyConfig?.isUS ? "https://help.shy.red/page/44#2FEd5Tdmxzq89YYsBekSYE" : "https://help.shy.live/page/288#sGSUeWF8nocf2ZaTqsQK2F", type: MenuItemType.switch, checked: (this.block as TableStore).checkRow == 'checkbox', name: 'checkRow' }
                ])
        }
        else if (this.block.url == BlockUrlConstant.DataGridList) {
            if (!this.block.isDefineViewTemplate)
                baseItems.splice(baseItems.length, 0, ...[
                    { type: MenuItemType.divide },
                    { text: lst('显示行号'), type: MenuItemType.switch, checked: (this.block as TableStore).showRowNum, name: 'showRowNum' },
                ])
        }
        else if (this.block.url == BlockUrlConstant.DataGridGallery) {
            baseItems.splice(baseItems.length, 0, ...[
                { type: MenuItemType.divide },
                {
                    text: lst('字段属性'),
                    value: (this.block as TableStoreGallery).cardConfig?.showField || 'none',
                    name: 'cardConfig.showField',
                    type: MenuItemType.select,
                    visible: (this.block as TableStoreGallery).getCardUrl() ? false : true,
                    options: [
                        { text: lst('隐藏'), value: 'none' },
                        { text: lst('显示'), value: 'nowrap' },
                        { text: lst('换行显示'), value: 'wrap' },
                    ]
                },
                {
                    text: lst('卡片列数'),
                    value: (this.block as TableStoreGallery).gallerySize,
                    name: 'gallerySize',
                    type: MenuItemType.select,
                    options: [
                        { text: lst('自适应'), value: -1 },
                        { text: '1' + lst('列'), value: 1 },
                        { text: '2' + lst('列'), value: 2 },
                        { text: '3' + lst('列'), value: 3 },
                        { text: '4' + lst('列'), value: 4 },
                        { text: '5' + lst('列'), value: 5 },
                        { text: '6' + lst('列'), value: 6 }
                    ]
                }])
        }
        else if (this.block.url == BlockUrlConstant.DataGridBoard) {
            baseItems.splice(baseItems.length, 0, ...[
                { type: MenuItemType.divide },
                {
                    text: lst('字段属性'),
                    value: (this.block as TableStoreGallery).cardConfig?.showField || 'none',
                    name: 'cardConfig.showField',
                    type: MenuItemType.select,
                    visible: (this.block as TableStoreGallery).getCardUrl() ? false : true,
                    options: [
                        { text: lst('隐藏'), value: 'none' },
                        { text: lst('显示'), value: 'nowrap' },
                        { text: lst('换行显示'), value: 'wrap' },
                    ]
                },
                {
                    text: lst('看板分类字段'),
                    value: (this.block as TableStoreBoard).groupFieldId,
                    name: 'groupFieldId',
                    type: MenuItemType.select,
                    options: this.block.schema.fields.filter(g => g.type == FieldType.option || g.type == FieldType.options).map(g => {
                        return {
                            text: g.text,
                            icon: GetFieldTypeSvg(g.type),
                            value: g.id
                        }
                    })
                },
            ])
        }
        else if (this.block.url == BlockUrlConstant.DataGridCalendar) {
            baseItems.splice(baseItems.length, 0, ...[
                {
                    text: lst('日历日期字段'),
                    value: (this.block as TableStoreCalendar).dateFieldId,
                    name: 'dateFieldId',
                    type: MenuItemType.select,
                    options: this.block.schema.fields.filter(g => g.type == FieldType.date || g.type == FieldType.createDate || g.type == FieldType.modifyDate).map(g => {
                        return {
                            text: g.text,
                            icon: GetFieldTypeSvg(g.type),
                            value: g.id
                        }
                    })
                }
            ])
        }
        if (!(this.block as DataGridView).dataGridTab)
            baseItems.push({
                text: lst('显示数据表视图标题'),
                name: 'noTitle',
                type: MenuItemType.switch,
                checked: (this.block as TableStore).noTitle ? false : true,
                helpUrl: window.shyConfig?.isUS ? "https://help.shy.red/page/44#89hYGiP93L9HA319pJXRsa" : "https://help.shy.live/page/288#bkz71T3eQwAGH3q4s71hCo"
            })
        baseItems.push({ type: MenuItemType.divide });
        baseItems.push({
            type: MenuItemType.help,
            helpInline: true,
            text: lst('了解如何使用数据表视图'),
            url: window.shyConfig?.isUS ? "https://help.shy.red/page/44#p6dtzzCsUHUrhyfNdrfkXh" : "https://help.shy.live/page/288#eNk3NZZyXWMCgMEMCyJRcG"
        });
        return baseItems
    }
    renderItems() {
        var self = this;
        async function input(item) {
            if (item.name == 'size') self.block.onChangeSize(item.value)
            else if (item.name == 'noTitle') self.block.onUpdateProps({ noTitle: !item.checked }, { range: BlockRenderRange.self });
            else if (['openRecordViewId', 'openRecordSource', 'createRecordSource'].includes(item.name)) self.block.onUpdateProps({ [item.name]: item.value }, {})
            else if (item.name == 'showRowNum') self.block.onShowRowNum(item.checked);
            else if (item.name == 'checkRow') {
                await self.block.onShowCheck(item.checked ? "checkbox" : 'none');
            }
            else if (item.name == 'showPager') {
                await self.block.onExtendTriggerBlock(BlockUrlConstant.DataGridPage, {}, !self.block.hasTriggerBlock(BlockUrlConstant.DataGridPage))
            }
            else if (item.name == 'noHead') {
                await self.block.onUpdateProps({ noHead: !item.checked }, { range: BlockRenderRange.self });
            }
            else if (['gallerySize', 'cardConfig.showField', 'dateFieldId', 'groupFieldId'].includes(item.name)) {
                await self.block.onUpdateProps({ [item.name]: item.value }, { range: BlockRenderRange.self });
            }
            else if (item.name == 'viewText') {
                if (self.block.schemaView.text != item.value)
                    self.onStoreViewText(item.value);
                else if (!lodash.isEqual(self.block.schemaView.icon, item.icon))
                    self.block.onSchemaViewUpdate(self.block.syncBlockId, { icon: item.icon });
            }
            else if (item.name == 'lock') {
                self.block.onTableSchemaLock(item.checked);
            }
        }
        function select(item, event) {
            if (item?.name == 'datasource') {
                self.block.onOpenDataSource(Rect.fromEvent(event));
            }
            else if (item?.name == 'toggleView') {
                self.block.onDataGridChangeView(item.value);
                if (self.props.gc) self.props.gc.onClose();
            }
            else if (item?.name == 'dataView') {
                self.block.onDataGridChangeViewByTemplate(item.value);
                if (self.props.gc) self.props.gc.onClose();
            }
        }
        function click(item) {

        }
        return <MenuView input={input} select={select} click={click} style={{
            maxHeight: 400,
            paddingTop: 10,
            paddingBottom: 5,
            overflowY: 'auto'
        }} items={this.getItems()}></MenuView>
    }
    onStoreViewText = lodash.debounce((value) => {
        var self = this;
        self.block.onSchemaViewUpdate(self.block.syncBlockId, { text: value });
    }, 700)
    render(): ReactNode {
        if (!this.block) return <div></div>;
        return this.renderItems()
    }
}