import React from "react";
import { ReactNode } from "react";
import { GetFieldTypeSvg } from "../../../../blocks/data-grid/schema/util";
import { DataGridView } from "../../../../blocks/data-grid/view/base";
import { EventsComponent } from "../../../../component/lib/events.component";
import { Icon } from "../../../../component/view/icon";
import { Divider } from "../../../../component/view/grid";
import { DotsSvg, DragHandleSvg, DuplicateSvg, EyeHideSvg, EyeSvg, PlusSvg, TrashSvg } from "../../../../component/svgs";
import { Rect } from "../../../../src/common/vector/point";
import { DragList } from "../../../../component/view/drag.list";
import { BlockUrlConstant } from "../../../../src/block/constant";
import lodash from "lodash";
import { MenuView } from "../../../../component/view/menu/menu";
import { MenuItem, MenuItemType } from "../../../../component/view/menu/declare";
import { FieldType } from "../../../../blocks/data-grid/schema/type";
import { TableStoreGallery } from "../../../../blocks/data-grid/view/gallery";
import { Button } from "../../../../component/view/button";
import { useCardSelector } from "../../../../blocks/data-grid/card/selector";
import { BlockRenderRange } from "../../../../src/block/enum";
import { cardStores } from "../../../../blocks/data-grid/card/data";
import { SelectBox } from "../../../../component/view/select/box";
import { CardConfig } from "../../../../blocks/data-grid/view/item/service";
import { Field } from "../../../../blocks/data-grid/schema/field";
import { ViewField } from "../../../../blocks/data-grid/schema/view";
import { useSelectMenuItem } from "../../../../component/view/menu";

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
        async function openProperty(type: 'field' | 'view', viewField: ViewField | Field, event: React.MouseEvent) {
            var gr = type == "view" ? (viewField as any).field as Field : (viewField as Field); ((viewField as any).field ? (viewField as any).field : viewField) as Field;
            if (gr) {
                var items = [
                    { name: 'name', type: MenuItemType.input, value: gr.text },
                    { type: MenuItemType.divide },
                    { name: 'delete', icon: TrashSvg, text: '删除' },
                    { name: 'clone', icon: DuplicateSvg, text: '复制' }
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
        return <div>
            <div className="max-h-250 overflow-y">
                <div className="flex h-30 padding-w-14" style={{ paddingRight: 10 }}>
                    <span className="remark flex-auto f-12">显示的字段</span>
                    <span onClick={e => onHideAll()} className="size-24 flex-center round ">
                        <Icon size={14} icon={EyeSvg}></Icon>
                    </span>
                </div>
                <DragList onChange={onChange} isDragBar={e => e.closest('.shy-table-field-view-item') && !e.closest('.eye') ? true : false} className="shy-table-field-view-items">{this.block.fields.map(f => {
                    return <div className={"shy-table-field-view-item flex h-30 padding-w-10 cursor  item-hover"} key={f.fieldId || f.type}>
                        <span className="size-24 round flex-center flex-fixed item-hover"> <em className={'drag'} ><Icon size={12} icon={DragHandleSvg}></Icon></em></span>
                        <span className="size-24 round flex-center flex-fixed"><Icon size={14} icon={GetFieldTypeSvg(f.field?.type)}></Icon></span>
                        <span className="flex-auto f-14">{f.text}</span>
                        <span className="size-24 round flex-center flex-fixed item-hover"><Icon className={'eye'} size={14} onClick={async () => { await self.block.onHideField(f); self.forceUpdate() }} icon={EyeSvg}></Icon></span>
                        <span className={"size-24 round flex-center flex-fixed" + (f.field ? "  item-hover" : " remark")}><Icon className={'eye'} size={14} onClick={async (e) => { openProperty('view', f, e) }} icon={DotsSvg}></Icon></span>
                    </div>
                })}</DragList>
                {fs.length > 0 && <>
                    <div className="flex h-30 padding-w-14" style={{ paddingRight: 10 }}>
                        <span className="remark flex-auto f-12">未显示的字段</span>
                        <span onClick={e => onShowAll()} className="size-24 flex-center round item-hover ">
                            <Icon size={14} icon={EyeHideSvg}></Icon>
                        </span>
                    </div>
                    <div className="shy-table-field-view-items">{fs.map(f => {
                        return <div className={"flex h-30 padding-w-10 cursor item-hover"} key={f.id}>
                            <span className="size-24 round flex-center flex-fixed"> <Icon size={14} icon={GetFieldTypeSvg(f.type)}></Icon></span>
                            <span className="flex-auto f-14">{f.text}</span>
                            <span className="size-24 round flex-center flex-fixed item-hover">   <Icon className={'eye'} size={14} onClick={async () => { await self.block.onShowField(f); self.forceUpdate() }} icon={EyeHideSvg}></Icon></span>
                            <span className="size-24 round flex-center flex-fixed item-hover"><Icon className={'eye'} size={14} onClick={async (e) => { openProperty('field', f, e) }} icon={DotsSvg}></Icon></span>
                        </div>
                    })}</div>
                </>}
            </div>
        </div>
    }
    renderList() {
        return <div className="shy-table-field-view">
            {this.renderFields()}
        </div>
    }
    addField(event: React.MouseEvent) {
        event.stopPropagation();
        this.block.onAddField(Rect.fromEvent(event));
    }
    renderCard() {
        var self = this;
        async function input(item) {
            if (item.name == 'cardConfig.showTemplate') {
                await self.block.onUpdateProps({ [item.name]: item.checked }, { syncBlock: self.block, range: BlockRenderRange.self });
                self.forceUpdate()
            }
            else if (['gallerySize', 'dateFieldId', 'groupFieldId'].includes(item.name)) {
                await self.block.onUpdateProps({ [item.name]: item.value }, { syncBlock: self.block, range: BlockRenderRange.self });
                self.forceUpdate()
            }
            else if (['cardConfig.auto', 'cardConfig.showCover', 'cardConfig.coverAuto'].includes(item.name)) {
                await self.block.onUpdateProps({ [item.name]: item.checked }, { syncBlock: self.block, range: BlockRenderRange.self });
                self.forceUpdate()
            }
            else if (item.name == 'cardConfig.coverFieldId' && item.value) {
                await self.block.onUpdateProps({ [item.name]: item.value }, { syncBlock: self.block, range: BlockRenderRange.self });
                self.forceUpdate()
            }
        }
        function select(item) {

        }
        function click(item) {

        }
        var getItems = () => {
            if ((this.block as TableStoreGallery)?.cardConfig?.showTemplate)
                return [
                    {
                        name: 'cardConfig.showTemplate',
                        text: "自定义卡片模板",
                        type: MenuItemType.switch,
                        checked: (this.block as TableStoreGallery).cardConfig?.showTemplate == true,
                    }
                ]
            var baseItems: MenuItem[] = [
                {
                    name: 'cardConfig.showTemplate',
                    text: "自定义卡片模板",
                    type: MenuItemType.switch,
                    checked: (this.block as TableStoreGallery).cardConfig?.showTemplate == true,
                },
                { text: '卡片视图', type: MenuItemType.text },
                {
                    name: 'cardConfig.auto',
                    text: "高度自适应",
                    type: MenuItemType.switch,
                    checked: (this.block as TableStoreGallery).cardConfig?.auto,
                },
                {
                    name: 'cardConfig.showCover',
                    text: "显示封面",
                    type: MenuItemType.switch,
                    updateMenuPanel: true,
                    checked: (this.block as TableStoreGallery).cardConfig?.showCover,
                },
                {
                    name: 'cardConfig.coverAuto',
                    text: "封面高度",
                    visible: (items) => {
                        var item = items.find(g => g.name == 'cardConfig.showCover');
                        if (item.checked) return true;
                        else return false;
                    },
                    type: MenuItemType.switch,
                    checked: (this.block as TableStoreGallery).cardConfig?.coverAuto,
                },
                {
                    text: '封面字段',
                    value: (this.block as TableStoreGallery).cardConfig?.coverFieldId,
                    name: 'cardConfig.coverFieldId',
                    type: MenuItemType.select,
                    visible: (items) => {
                        var item = items.find(g => g.name == 'cardConfig.showCover');
                        if (item.checked) return true;
                        else return false;
                    },
                    options: this.block.schema.userFields.filter(g => g.type == FieldType.image).map(g => {
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
        return <div className="shy-table-field-view">
            <MenuView
                input={input}
                select={select}
                click={click}
                style={{ maxHeight: 300, paddingTop: 10, paddingBottom: 10, overflowY: 'auto' }}
                items={getItems()}></MenuView>
            {(this.block as TableStoreGallery).cardConfig?.showTemplate != true && this.renderFields()}
            {(this.block as TableStoreGallery).cardConfig?.showTemplate && this.renderCardView()}
            <Divider></Divider>
            <div onClick={e => this.addField(e)} className="flex h-30 item-hover padding-w-14 round cursor text-1 f-14 ">
                <span className="size-24 round flex-center flex-fix cursor">
                    <Icon size={16} icon={PlusSvg}></Icon>
                </span>
                <span className="flex-auto">添加字段</span>
            </div>
        </div >
    }
    renderCardView() {
        var self = this;
        var card = cardStores.get().find(g => g.url == (self.block as TableStoreGallery).cardConfig?.templateProps?.url);
        async function openSelect(event: React.MouseEvent) {
            var r = await useCardSelector({ roundArea: Rect.fromEvent(event) }, {});
            if (r) {
                var tp: CardConfig['templateProps'] = {
                    url: r.url,
                    props: r.props.map(p => {
                        var vf: Field;
                        for (let i = 0; i < p.types.length; i++) {
                            var _vf = self.block.schema.userFields.find(g => g.type == p.types[i]);
                            if (_vf) { vf = _vf; break; }
                        }
                        return {
                            name: p.name,
                            visible: true,
                            bindFieldId: vf?.id
                        }
                    })
                }
                await self.block.onUpdateProps({ 'cardConfig.templateProps': tp }, { syncBlock: self.block, range: BlockRenderRange.self });
                self.forceUpdate()
            }
        }
        async function changeArrayProp(data, update: Record<string, any>) {
            await self.block.onArraySave({
                syncBlock: self.block,
                prop: 'cardConfig.templateProps?.props',
                data,
                update,
            });
            self.forceUpdate()
        }
        if (card) return <div>
            <div className="flex remark f-12 padding-w-14 gap-h-10">
                <span className="flex-auto text-over">{card.title}</span>
                <div className="flex-fix "><Button onClick={e => openSelect(e)} ghost>切换卡片模板</Button></div>
            </div>
            <div className="flex remark f-12 gap-h-5 padding-w-14">
                <span>卡片字段</span>
            </div>
            <div>
                {card.props.map(pro => {
                    var bp = (self.block as TableStoreGallery).cardConfig.templateProps?.props?.find(g => g.name == pro.name);
                    var fe = self.block.fields.find(g => g.field?.id == bp?.bindFieldId)
                    return <div key={pro.name} className="flex h-30 f-14 padding-w-14 item-hover round cursor text-1">
                        <span className="flex-fix flex-center size-24 round item-hover cursor"><Icon size={16} icon={GetFieldTypeSvg(fe?.field?.type ? fe.field.type : pro.types[0])}></Icon></span>
                        <span className="flex-fix gap-r-10 text-over min-w-100 max-w-100">{pro.text}</span>
                        <div className="flex-fix">
                            <SelectBox border small
                                value={bp?.bindFieldId}
                                onChange={e => {
                                    changeArrayProp(bp, { name: pro.name, bindFieldId: e })
                                }}
                                options={self.block.schema.userFields.findAll(c => pro.types.includes(c.type)).map(c => {
                                    return {
                                        text: c.text,
                                        value: c.id
                                    }
                                })}></SelectBox>
                        </div>
                        <div className="flex-auto flex-end">
                            <span className="flex-center size-24 item-hover round cursor"
                                onMouseDown={e => changeArrayProp(bp, { name: pro.name, visible: bp?.visible === false ? true : false })}
                            >
                                <Icon size={18} icon={bp?.visible === false ? EyeHideSvg : EyeSvg} ></Icon>
                            </span>
                        </div>
                    </div>
                })}
            </div>
        </div>
        else return <div className="flex-center gap-14">
            <span><Button onClick={e => openSelect(e)} >选择卡片模板</Button></span>
        </div>
    }
    onStoreViewText = lodash.debounce((value) => {
        console.log('deb', value);
    }, 1000)
    render(): ReactNode {
        if (!this.block) return <></>;
        if (!this.schema) return <div></div>
        if (this.block.url == BlockUrlConstant.DataGridTable) return this.renderTable()
        if ([BlockUrlConstant.DataGridBoard, BlockUrlConstant.DataGridGallery].includes(this.block.url as any)) return this.renderCard()
        else if (this.block.url == BlockUrlConstant.List) return this.renderList()
        else if (this.block.url == BlockUrlConstant.DataGridCalendar) return this.renderTable()
        else return this.renderTable()
    }
}