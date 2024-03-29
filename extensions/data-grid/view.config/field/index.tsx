import React from "react";
import { ReactNode } from "react";
import { GetFieldTypeSvg } from "../../../../blocks/data-grid/schema/util";
import { DataGridView } from "../../../../blocks/data-grid/view/base";
import { EventsComponent } from "../../../../component/lib/events.component";
import { Icon, IconValueType } from "../../../../component/view/icon";
import { Divider } from "../../../../component/view/grid";
import {
    DotsSvg,
    DragHandleSvg,
    DuplicateSvg,
    EyeHideSvg,
    EyeSvg,
    PlusSvg,
    TrashSvg
} from "../../../../component/svgs";
import { Rect } from "../../../../src/common/vector/point";
import { DragList } from "../../../../component/view/drag.list";
import { BlockUrlConstant } from "../../../../src/block/constant";
import { MenuView } from "../../../../component/view/menu/menu";
import { MenuItem, MenuItemType } from "../../../../component/view/menu/declare";
import { FieldType, SysFieldTypes } from "../../../../blocks/data-grid/schema/type";
import { TableStoreGallery } from "../../../../blocks/data-grid/view/gallery";
import { BlockRenderRange } from "../../../../src/block/enum";
import { SelectBox } from "../../../../component/view/select/box";
import { Field } from "../../../../blocks/data-grid/schema/field";
import { ViewField } from "../../../../blocks/data-grid/schema/view";
import { useSelectMenuItem } from "../../../../component/view/menu";
import { CardFactory } from "../../../../blocks/data-grid/template/card/factory/factory";
import { lst } from "../../../../i18n/store";
import { S } from "../../../../i18n/view";
import { TableSchema } from "../../../../blocks/data-grid/schema/meta";

export class DataGridFields extends EventsComponent {
    get schema() {
        return this.block?.schema;
    }
    block: DataGridView;
    onOpen(block: DataGridView) {
        this.block = block;
        this.forceUpdate();
    }
    renderTable() {
        return <div className="shy-table-field-view">
            {this.renderFields()}
        </div>
    }
    async openProperty(type: 'field' | 'view', viewField: ViewField | Field, event: React.MouseEvent) {
        var self = this;
        var gr = type == "view" ? (viewField as any).field as Field : (viewField as Field);
        if (gr) {
            var isCanDeleted: boolean = true;
            if (SysFieldTypes.includes(gr.type)) isCanDeleted = false;
            var items = [
                { name: 'name', type: MenuItemType.input, value: gr.text },
                { type: MenuItemType.divide },
                { name: 'clone', icon: DuplicateSvg, text: lst('复制') },
                { type: MenuItemType.divide },
                { name: 'delete', disabled: isCanDeleted ? false : true, icon: TrashSvg, text: lst('删除') }
            ];
            var na = items[0];
            var r = await useSelectMenuItem(
                { roundArea: Rect.fromEvent(event) },
                items,
            );
            if (r?.item) {
                if (r.item.name == 'delete') {
                    await self.block.onDeleteField(gr, true);
                    self.forceUpdate();
                }
                else if (r.item.name == 'clone') {
                    await self.block.onCloneField(gr);
                    self.forceUpdate();
                }
            }
            if (na && na.value != gr.text && na.value) {
                await self.block.onUpdateField(gr, { text: na.value });
                self.forceUpdate();
            }
        }
    }
    renderFields() {
        var fs = this.schema.visibleFields.findAll(g => g.text && !this.block.fields.some(s => s.fieldId == g.id) ? true : false);
        var self = this;
        async function onShowAll() {
            await self.block.onShowAllField();
            self.forceUpdate();
        }
        async function onHideAll() {
            await self.block.onHideAllField();
            self.forceUpdate();
        }
        async function onChange(to: number, from: number) {
            await self.block.onMoveViewField(to, from);
            self.forceUpdate();
        }
        function getFieldIcon(vf: ViewField) {
            if (vf.type == 'check') return { name: 'bytedance-icon', code: 'check-correct' } as IconValueType
            else if (vf.type == 'rowNum') return { name: 'bytedance-icon', code: 'list-numbers' } as IconValueType
            else return GetFieldTypeSvg(vf.field?.type);
        }
        return <div>
            <div className="max-h-200 overflow-y">
                <div className="flex padding-w-10 " style={{ paddingLeft: 5 }}>
                    <span className="remark flex-auto f-12 gap-l-6"><S>显示的字段</S></span>
                    <span onClick={e => onHideAll()} className="size-24 flex-center round ">
                        <Icon size={14} icon={EyeSvg}></Icon>
                    </span>
                </div>
                <DragList
                    onChange={onChange}
                    isDragBar={e => e.closest('.shy-table-field-view-item') && !e.closest('.eye') ? true : false}
                    className="shy-table-field-view-items">{this.block.fields.map(f => {
                        return <div className={"shy-table-field-view-item round flex h-30 padding-w-5 gap-w-5 cursor  item-hover"} key={f.fieldId || f.type}>
                            <span className="size-24 round flex-center flex-fixed item-hover"> <em className={'drag size-24 flex-center text-1'} ><Icon size={16} icon={DragHandleSvg}></Icon></em></span>
                            <span className="size-24 round flex-center flex-fixed"><Icon size={14} icon={getFieldIcon(f)}></Icon></span>
                            <span className="flex-auto f-14">{f.text}</span>
                            <span className="size-24 round flex-center flex-fixed item-hover"><Icon className={'eye'} size={14} onClick={async () => { await self.block.onHideField(f); self.forceUpdate() }} icon={EyeSvg}></Icon></span>
                            <span className={"size-24 round flex-center flex-fixed" + (f.field ? "  item-hover" : " remark")}><Icon className={'eye'} size={14} onClick={async (e) => { self.openProperty('view', f, e) }} icon={DotsSvg}></Icon></span>
                        </div>
                    })}</DragList>
                {fs.length > 0 && <>
                    <div className="flex padding-w-10 " style={{ paddingLeft: 5 }}>
                        <span className="remark flex-auto f-12 gap-l-6"><S>未显示的字段</S></span>
                        <span onClick={e => onShowAll()} className="size-24 flex-center round item-hover ">
                            <Icon size={14} icon={EyeHideSvg}></Icon>
                        </span>
                    </div>
                    <div className="shy-table-field-view-items">{fs.map(f => {
                        return <div className={"flex h-30 padding-w-5 gap-w-5 round cursor item-hover"} key={f.id}>
                            <span className="size-24 round flex-center flex-fixed"> <Icon size={14} icon={GetFieldTypeSvg(f.type)}></Icon></span>
                            <span className="flex-auto f-14">{f.text}</span>
                            <span className="size-24 round flex-center flex-fixed item-hover"><Icon className={'eye'} size={14} onClick={async () => { await self.block.onShowField(f); self.forceUpdate() }} icon={EyeHideSvg}></Icon></span>
                            {!TableSchema.isSystemField(f) && <span className="size-24 round flex-center flex-fixed item-hover"> <Icon className={'eye'} size={14} onClick={async (e) => { self.openProperty('field', f, e) }} icon={DotsSvg}></Icon></span>}
                        </div>
                    })}</div>
                </>}
            </div>
        </div>
    }
    async addField(event: React.MouseEvent) {
        event.stopPropagation();
        await this.block.onAddField(Rect.fromEvent(event));
        this.forceUpdate();
    }
    renderCard() {
        var self = this;
        async function input(item) {
            if (item.name == 'cardConfig.showTemplate') {
                await self.block.onUpdateProps({ [item.name]: item.checked }, { range: BlockRenderRange.self });
                self.forceUpdate()
            }
            else if (['gallerySize', 'dateFieldId', 'groupFieldId'].includes(item.name)) {
                await self.block.onUpdateProps({ [item.name]: item.value }, { range: BlockRenderRange.self });
                self.forceUpdate()
            }
            else if (['cardConfig.auto', 'cardConfig.showCover', 'cardConfig.coverAuto'].includes(item.name)) {
                await self.block.onUpdateProps({ [item.name]: item.checked }, { range: BlockRenderRange.self });
                self.forceUpdate()
            }
            else if (['cardConfig.coverFieldId', 'cardConfig.showMode'].includes(item.name) && item.value) {
                await self.block.onUpdateProps({ [item.name]: item.value }, { range: BlockRenderRange.self });
                self.forceUpdate()
            }
        }
        function select(item) {

        }
        function click(item) {

        }
        var getItems = () => {
            if ((this.block as TableStoreGallery)?.cardConfig?.showMode == 'define')
                return []
            var baseItems: MenuItem[] = [
                { text: lst('卡片视图'), type: MenuItemType.text },
                {
                    name: 'cardConfig.auto',
                    text: lst("高度自适应"),
                    type: MenuItemType.switch,
                    checked: (this.block as TableStoreGallery).cardConfig?.auto,
                },
                {
                    name: 'cardConfig.showCover',
                    text: lst("显示封面"),
                    type: MenuItemType.switch,
                    updateMenuPanel: true,
                    checked: (this.block as TableStoreGallery).cardConfig?.showCover,
                },
                {
                    name: 'cardConfig.coverAuto',
                    text: lst("封面高度"),
                    visible: (items) => {
                        var item = items.find(g => g.name == 'cardConfig.showCover');
                        if (item.checked) return true;
                        else return false;
                    },
                    type: MenuItemType.switch,
                    checked: (this.block as TableStoreGallery).cardConfig?.coverAuto,
                },
                {
                    text: lst('封面字段'),
                    value: (this.block as TableStoreGallery).cardConfig?.coverFieldId,
                    name: 'cardConfig.coverFieldId',
                    type: MenuItemType.select,
                    visible: (items) => {
                        var item = items.find(g => g.name == 'cardConfig.showCover');
                        if (item.checked) return true;
                        else return false;
                    },
                    options: this.block.schema.fields.filter(g => g.type == FieldType.image).map(g => {
                        return {
                            text: g.text,
                            icon: GetFieldTypeSvg(g.type),
                            value: g.id
                        }
                    })
                }
            ]
            return baseItems
        }
        var items = getItems();
        return <div className="shy-table-field-view">
            {items.length > 0 && <MenuView
                input={input}
                select={select}
                click={click}
                style={{ maxHeight: 300, paddingTop: 10, paddingBottom: 10, overflowY: 'auto' }}
                items={items}></MenuView>}
            {!this.block.getCardUrl() && this.renderFields()}
            {this.block.getCardUrl() && this.renderCardView()}
            <Divider></Divider>
            <div onClick={e => this.addField(e)} className="flex h-30 gap-b-5  item-hover padding-w-5 gap-w-5 round cursor text-1 f-14 ">
                <span className="size-20 round flex-center flex-fix cursor">
                    <Icon size={20} icon={PlusSvg}></Icon>
                </span>
                <span className="flex-auto"><S>添加字段</S></span>
            </div>
        </div >
    }
    renderCardView() {
        var self = this;
        var fs = this.schema.visibleFields.findAll(g => g.text ? true : false);
        fs = fs.reverse();
        var card = CardFactory.CardModels.get((self.block as TableStoreGallery).cardConfig?.templateProps?.url);
        async function changeArrayProp(data, update: Record<string, any>) {
            await self.block.onArraySave({
                syncBlock: self.block,
                prop: 'cardConfig.templateProps.props',
                data,
                update,
            });
            self.forceUpdate()
        }
        return <div className="max-h-200 overflow-y">
            <div className="flex padding-w-14 gap-t-10">
                <span className="remark flex-auto f-12 "><S>卡片视图字段</S></span>
            </div>
            <div>
                {card.model.props.map(pro => {
                    var bp = (self.block as TableStoreGallery).cardConfig.templateProps?.props?.find(g => g.name == pro.name);
                    return <div key={pro.name} className="flex padding-h-3 f-14 padding-w-5 gap-w-5 item-hover round cursor text-1">
                        <span className="size-24 round flex-center flex-fixed"><Icon size={14} icon={GetFieldTypeSvg(pro.types.first())}></Icon></span>
                        <span className="flex-auto gap-r-10  text-over">{pro.text}</span>
                        <div className="flex-fixed">
                            <SelectBox small
                                multiple
                                value={bp && Array.isArray(bp.bindFieldIds) ? bp.bindFieldIds : (bp?.bindFieldId ? [bp.bindFieldId] : [])}
                                onChange={e => {
                                    changeArrayProp(bp, { name: pro.name, bindFieldIds: e })
                                }}
                                options={self.block.schema.fields.findAll(c => pro.types.includes(c.type)).map(c => {
                                    return {
                                        icon: GetFieldTypeSvg(c.type),
                                        text: c.text,
                                        value: c.id
                                    }
                                })}>
                            </SelectBox>
                        </div>
                    </div>
                })}
            </div>
            <Divider></Divider>
            <div className="flex  padding-w-14 " >
                <span className="remark flex-auto f-12 "><S>字段</S></span>
            </div>
            <div className="shy-table-field-view-items">{fs.map(f => {
                return <div className={"flex h-30 round padding-w-5 gap-w-5 cursor item-hover"} key={f.id}>
                    <span className="size-24 round flex-center flex-fixed"><Icon size={14} icon={GetFieldTypeSvg(f.type)}></Icon></span>
                    <span className="flex-auto f-14">{f.text}</span>
                    {!TableSchema.isSystemField(f) && <span className="size-24 round flex-center flex-fixed item-hover"><Icon className={'eye'} size={14} onClick={async (e) => { self.openProperty('field', f, e) }} icon={DotsSvg}></Icon></span>}
                </div>
            })}</div>
        </div>
    }
    render(): ReactNode {
        if (!this.block) return <></>;
        if (!this.schema) return <div></div>
        if (this.block.url == BlockUrlConstant.DataGridTable) return this.renderTable()
        if ([
            BlockUrlConstant.DataGridBoard,
            BlockUrlConstant.DataGridList,
            BlockUrlConstant.DataGridGallery].includes(this.block.url as any)) return this.renderCard()
        else if (this.block.url == BlockUrlConstant.DataGridCalendar) return this.renderTable()
        else return this.renderTable()
    }
}