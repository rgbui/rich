
import React from "react";
import { ReactNode } from "react";
import { DataGridView } from "../../../../blocks/data-grid/view/base";
import { EventsComponent } from "../../../../component/lib/events.component";
import { BlockUrlConstant } from "../../../../src/block/constant";
import { TableStoreGallery } from "../../../../blocks/data-grid/view/gallery";
import { FieldType } from "../../../../blocks/data-grid/schema/type";
import { BlockRenderRange } from "../../../../src/block/enum";
import { getSchemaViewIcon, getSchemaViews, getTypeSvg } from "../../../../blocks/data-grid/schema/util";
import { TableStore } from "../../../../blocks/data-grid/view/table";
import { TableStoreCalendar } from "../../../../blocks/data-grid/view/calendar";
import { TableStoreBoard } from "../../../../blocks/data-grid/view/board";
import "./style.less";
import { MenuView } from "../../../../component/view/menu/menu";
import { MenuItem, MenuItemType } from "../../../../component/view/menu/declare";
import lodash from "lodash";
import { DatasourceSvg, LockSvg, LoopSvg, UnlockSvg } from "../../../../component/svgs";

export class DataGridViewConfig extends EventsComponent {
    get schema() {
        return this.block?.schema;
    }
    block: DataGridView;
    onOpen(block: DataGridView) {
        this.block = block;
        this.forceUpdate();
    }
    getItems(): MenuItem[] {
        var baseItems: MenuItem[] = [
            {
                value: this.block.schemaView.text,
                name: 'viewText',
                type: MenuItemType.input,
            },
            { type: MenuItemType.divide },
            {
                text: '切换视图',
                icon: LoopSvg,
                childs: getSchemaViews().map(v => {
                    return {
                        value: v.url,
                        text: v.text,
                        icon: getSchemaViewIcon(v.url),
                        checkLabel: this.block.url == v.url
                    }
                })
            },
            { text: '数据源', name: 'datasource', icon: DatasourceSvg },
            { text: '锁定数据表', name: 'lock', type: MenuItemType.switch, checked: this.block.locker?.lock ? true : false, icon: this.block.locker?.lock ? LockSvg : UnlockSvg },
            { type: MenuItemType.divide },
            { text: '视图标题', name: 'noTitle', type: MenuItemType.switch, checked: (this.block as TableStore).noTitle ? false : true },
            {
                text: '每页加载的数量',
                value: this.block.size,
                name: 'size',
                type: MenuItemType.select,
                options: [
                    { text: '20条', value: 20 },
                    { text: '50条', value: 50 },
                    { text: '80条', value: 80 },
                    { text: '100条', value: 100 },
                    { text: '150条', value: 150 },
                    { text: '200条', value: 200 }
                ]
            },
            // { text: '序号(自增)', type: MenuItemType.switch, checked: (this.block as TableStore).fields.some(s => s.field?.type == FieldType.autoIncrement), name: 'autoIncrement' },
            { type: MenuItemType.divide },
            {
                text: '选中方式',
                value: this.block.checkRow,
                name: 'checkRow',
                type: MenuItemType.select,
                options: [
                    { text: '无', value: 'none' },
                    { text: '复选框', value: 'checkbox' },
                    { text: '高亮', value: 'selected' },
                ]
            }
            //{ text: '选择', type: MenuItemType.switch, checked: (this.block as TableStore).showCheckRow, name: 'showCheckRow' },
            // {
            //     text: '其它',
            //     childs: [
            //         {
            //             text: '创建人', icon: getTypeSvg(FieldType.creater), type: MenuItemType.switch, checked: (this.block as TableStore).fields.some(s => s.field?.type == FieldType.creater),
            //             name: 'creater'
            //         },
            //         { text: '创建时间', icon: getTypeSvg(FieldType.createDate), type: MenuItemType.switch, checked: (this.block as TableStore).fields.some(s => s.field?.type == FieldType.createDate), name: 'createDate' },
            //         { text: '修改人', icon: getTypeSvg(FieldType.modifyer), type: MenuItemType.switch, checked: (this.block as TableStore).fields.some(s => s.field?.type == FieldType.modifyer), name: 'modifyer' },
            //         { text: '修改时间', icon: getTypeSvg(FieldType.modifyDate), type: MenuItemType.switch, checked: (this.block as TableStore).fields.some(s => s.field?.type == FieldType.modifyDate), name: 'modifyDate' }]
            // },
            //{ type: MenuItemType.divide },
            //{ text: '操作', type: MenuItemType.text },
            // { text: '编辑按钮', type: MenuItemType.switch, checked: true, name: 'showEditButton' },
            // { text: '分页', type: MenuItemType.switch, checked: true, name: 'showPager' },
            // { text: '显示添加按钮', type: MenuItemType.switch, checked: true, name: 'showCheckRow' },
            // { text: '显示批量处理按钮', type: MenuItemType.switch, checked: true, name: 'showCheckRow' },
            // { text: '显示批量删除按钮', type: MenuItemType.switch, checked: true, name: 'showCheckRow' },
        ]
        if (this.block.url == BlockUrlConstant.DataGridTable) {
            baseItems.splice(baseItems.length, 0, ...[
                { text: '行号', type: MenuItemType.switch, checked: (this.block as TableStore).showRowNum, name: 'showRowNum' },
                { text: '显示表头', name: 'noHead', type: MenuItemType.switch, checked: (this.block as TableStore).noHead ? false : true },
            ])
        }
        else if (this.block.url == BlockUrlConstant.DataGridList) {
            baseItems.splice(baseItems.length, 0, ...[
                { text: '行号', type: MenuItemType.switch, checked: (this.block as TableStore).showRowNum, name: 'showRowNum' },
            ])
        }
        else if (this.block.url == BlockUrlConstant.DataGridGallery) {
            baseItems.splice(baseItems.length, 0, ...[
                {
                    text: '卡片列数',
                    value: (this.block as TableStoreGallery).gallerySize,
                    name: 'gallerySize',
                    type: MenuItemType.select,
                    options: [
                        { text: '自适应', value: -1 },
                        { text: '1列', value: 1 },
                        { text: '2列', value: 2 },
                        { text: '3列', value: 3 },
                        { text: '4列', value: 4 },
                        { text: '5列', value: 5 },
                        { text: '6列', value: 6 }
                    ]
                },
            ])
        }
        else if (this.block.url == BlockUrlConstant.DataGridBoard) {
            baseItems.splice(baseItems.length, 0, ...[
                {
                    text: '看板分类字段',
                    value: (this.block as TableStoreBoard).groupFieldId,
                    name: 'groupFieldId',
                    type: MenuItemType.select,
                    options: this.block.schema.userFields.filter(g => g.type == FieldType.option || g.type == FieldType.options).map(g => {
                        return {
                            text: g.text,
                            icon: getTypeSvg(g.type),
                            value: g.id
                        }
                    })
                },
            ])
        }
        else if (this.block.url == BlockUrlConstant.DataGridCalendar) {
            baseItems.splice(baseItems.length, 0, ...[
                {
                    text: '日历日期字段',
                    value: (this.block as TableStoreCalendar).dateFieldId,
                    name: 'dateFieldId',
                    type: MenuItemType.select,
                    options: this.block.schema.userFields.filter(g => g.type == FieldType.date || g.type == FieldType.createDate || g.type == FieldType.modifyDate).map(g => {
                        return {
                            text: g.text,
                            icon: getTypeSvg(g.type),
                            value: g.id
                        }
                    })
                },
            ])
        }
        // if (this.block.url == BlockUrlConstant.DataGridGallery) {
        //     return [
        //         {
        //             name: 'cardConfig.auto',
        //             text: "是否自适应",
        //             type: MenuItemType.switch,
        //             checked: (this.block as TableStoreGallery).cardConfig.auto,
        //         },
        //         {
        //             name: 'cardConfig.showCover',
        //             text: "显示封面",
        //             type: MenuItemType.switch,
        //             checked: (this.block as TableStoreGallery).cardConfig.showCover,
        //         },
        //         {
        //             name: 'cardConfig.coverAuto',
        //             text: "封面自适应",
        //             disabled: (this.block as TableStoreGallery).cardConfig.showCover,
        //             type: MenuItemType.switch,
        //             checked: (this.block as TableStoreGallery).cardConfig.coverAuto,
        //         },
        //         {
        //             text: '封面字段',
        //             value: (this.block as TableStoreGallery).cardConfig.coverFieldId,
        //             name: 'cardConfig.coverFieldId',
        //             type: MenuItemType.select,
        //             disabled: (this.block as TableStoreGallery).cardConfig.showCover,
        //             options: this.block.schema.userFields.filter(g => g.type == FieldType.image).map(g => {
        //                 return {
        //                     text: g.text,
        //                     icon: getTypeSvg(g.type),
        //                     value: g.id
        //                 }
        //             })
        //         },
        //     ]
        // }
        // else if (this.block.url == BlockUrlConstant.Board) {
        //     return [
        //         {
        //             text: '封面字段',
        //             value: (this.block as TableStoreBoard).groupFieldId,
        //             name: 'groupFieldId',
        //             type: MenuItemType.select,
        //             options: this.block.schema.userFields.filter(g => g.type == FieldType.option || g.type == FieldType.options).map(g => {
        //                 return {
        //                     text: g.text,
        //                     icon: getTypeSvg(g.type),
        //                     value: g.id
        //                 }
        //             })
        //         }, ...baseItems]
        // }
        // else if (this.block.url == BlockUrlConstant.Board) {
        //     return [
        //         {
        //             text: '日历日期字段',
        //             value: (this.block as TableStoreCalendar).dateFieldId,
        //             name: 'dateFieldId',
        //             type: MenuItemType.select,
        //             options: this.block.schema.userFields.filter(g => g.type == FieldType.date || g.type == FieldType.createDate || g.type == FieldType.modifyDate).map(g => {
        //                 return {
        //                     text: g.text,
        //                     icon: getTypeSvg(g.type),
        //                     value: g.id
        //                 }
        //             })
        //         }, ...baseItems]
        // }
        // baseItems.insertAt(5, ...[
        //  
        //   
        // ])
        return baseItems
    }
    renderItems() {
        var self = this;
        async function input(item) {
            if (item.name == 'size') self.block.onChangeSize(item.value)
            else if (item.name == 'noTitle') self.block.onUpdateProps({ noTitle: !item.checked }, { syncBlock: self.block, range: BlockRenderRange.self });
            else if (item.name == 'showRowNum') self.block.onShowRowNum(item.checked);
            else if (['autoIncrement', 'creater', 'createDate', 'modifyer', 'modifyDate'].includes(item.name)) {
                await self.block.onShowExtendField(item.checked, FieldType[item.name] as any);
            }
            else if (item.name == 'showCheckRow') {
                await self.block.onShowCheck(item.checked);
            }
            else if (item.name == 'noHead') {
                await self.block.onUpdateProps({ noHead: !item.checked }, { syncBlock: self.block, range: BlockRenderRange.self });
            }
            else if (['gallerySize', 'dateFieldId', 'groupFieldId'].includes(item.name)) {
                await self.block.onUpdateProps({ [item.name]: item.value }, { syncBlock: self.block, range: BlockRenderRange.self });
            }
            else if (['cardConfig.auto', 'cardConfig.showCover', 'cardConfig.coverAuto'].includes(item.name)) {
                await self.block.onUpdateProps({ [item.name]: item.checked }, { syncBlock: self.block, range: BlockRenderRange.self });
            }
            else if (item.name == 'cardConfig.coverFieldId' && item.value) {
                await self.block.onUpdateProps({ [item.name]: item.value }, { syncBlock: self.block, range: BlockRenderRange.self });
            }
            else if (item.name == 'showEditButton') {

            }
            else if (item.name == 'showPager') {

            }
            else if (item.name == 'viewText') {
                console.log('ggg', item.value);
                self.onStoreViewText(item.value);
            }
        }
        function select(item) {

        }
        function click(item) {

        }
        return <MenuView input={input} select={select} click={click} style={{ maxHeight: 300, paddingTop: 10, paddingBottom: 30, overflowY: 'auto' }} items={this.getItems()}></MenuView>
    }
    onStoreViewText = lodash.debounce((value) => {
        console.log('deb', value);
    }, 1000)
    render(): ReactNode {
        if (!this.block) return <div></div>;
        return <div className="shy-table-property-view">
            {this.renderItems()}
        </div>
    }
}