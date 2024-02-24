import { PopoverPosition } from "../../../component/popover/position";
import { PopoverSingleton } from "../../../component/popover/popover";
import { FieldType, OnlyFieldTypes } from "../../../blocks/data-grid/schema/type";
import { Field, FieldConfig } from "../../../blocks/data-grid/schema/field";
import React from "react";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { GetFieldTypeSvg } from "../../../blocks/data-grid/schema/util";
import { EventsComponent } from "../../../component/lib/events.component";
import { ChevronDownSvg, CollectTableSvg } from "../../../component/svgs";
import { useSelectMenuItem } from "../../../component/view/menu";
import { Point, Rect } from "../../../src/common/vector/point";
import { useOpenEmoji } from "../../emoji";
import { getMenus } from "./view";
import { Button } from "../../../component/view/button";
import { Divider } from "../../../component/view/grid";
import { Icon } from "../../../component/view/icon";
import { Input } from "../../../component/view/input";
import { Switch } from "../../../component/view/switch";
import { Textarea } from "../../../component/view/input/textarea";
import { getEmoji } from "../../../net/element.type";
import { DataGridView } from "../../../blocks/data-grid/view/base";
import lodash from "lodash";
import { useDataSourceView } from "../datasource";
import { MenuItemType } from "../../../component/view/menu/declare";
import { lst } from "../../../i18n/store";
import { S } from "../../../i18n/view";
import './style.less';

export class TableFieldView extends EventsComponent {
    onSave() {
        var self = this;
        self.error = '';
        if (!self.text) {
            self.error = lst('字段名不能为空');
            return self.forceUpdate();
        }
        if (self.dataGrid.fields.some(s => s.text == self.text && s.field.type == self.type && !this.fieldId || this.fieldId && this.fieldId != s.fieldId && this.text == s.field.text)) {
            self.error = lst('字段名有重复');
            return self.forceUpdate();
        }
        self.forceUpdate();
        self.emit('save', {
            text: self.text,
            type: self.type,
            config: lodash.cloneDeep(self.config)
        });
    }
    renderMultiple() {
        if ([
            FieldType.file,
            FieldType.video,
            FieldType.user,
            FieldType.image
        ].includes(this.type)) {
            return <div className="flex gap-h-10 padding-w-14 ">
                <span className="flex-auto remark f-12"><S>是否允许多个</S>:</span>
                <div className="flex-fix flxe-end"><Switch onChange={e => this.onChangeConfig({ isMultiple: e })} checked={this.config?.isMultiple ? true : false}></Switch></div>
            </div>
        }
        else return <></>
    }
    renderRelation() {
        if (this.type != FieldType.relation) return <></>
        var rt = this.relationDatas.find(g => g.id == this.config.relationTableId)
        return <>
            <div className="gap-h-10 padding-w-14">
                <div className="flex gap-b-5 remark f-12"><S>关联表格</S>:</div>
                <div className="flex h-26 border-light  round item-hover-light cursor" onClick={e => this.openSelectRelationTable(e)}>
                    <span className="flex-center  size-24  flex-fix cursor  round "><Icon size={14} icon={rt?.icon || CollectTableSvg}></Icon></span>
                    <span className="flex-auto ">{rt?.text}</span>
                    <span className="flex-fixed size-24 round  flex-center">
                        <Icon size={14} icon={ChevronDownSvg}></Icon>
                    </span>
                </div>
            </div>
            <div className="flex gap-h-10 padding-w-14 ">
                <span className="flex-auto remark f-12"><S>是否一对多</S>:</span>
                <div className="flex-fix flxe-end"><Switch onChange={e => this.onChangeConfig({ isMultiple: e })} checked={this.config?.isMultiple ? true : false}></Switch></div>
            </div>
        </>
    }
    async openSelectRelationTable(event: React.MouseEvent) {
        event.stopPropagation();
        var r = await useDataSourceView({ roundArea: Rect.fromEvent(event) }, {
            tableId: this.config.relationTableId
        });
        if (r) this.onChangeConfig({ relationTableId: r as string });
    }
    renderRollup() {
        var self = this;
        if (this.type != FieldType.rollup) return <></>;
        var rs = this.dataGrid.schema.fields.findAll(g => g.type == FieldType.relation);
        var ts = this.relationDatas.findAll(g => rs.some(r => r.config.relationTableId == g.id));
        if (ts.length == 0) return <>
            <div className="flex-center gap-h-10 remark">
                <S text="没有关联的表无法聚合统计">没有关联的表，无法聚合统计</S>
            </div>
        </>
        var sums = [
            { text: lst('数量'), value: '$count', icon: { name: 'byte', code: 'preschool' } },
            { text: lst('聚合'), type: MenuItemType.text },
            { text: lst('平均'), value: '$agv', icon: { name: 'byte', code: 'average' } },
            { text: lst('求和'), value: '$sum', icon: { name: 'byte', code: 'formula' } },
            { text: lst('最小'), value: '$min', icon: { name: 'byte', code: 'min' } },
            { text: lst('最大'), value: '$max', icon: { name: 'byte', code: 'maximum' } }
        ]
        async function selectRelationTable(event: React.MouseEvent) {
            var r = await useSelectMenuItem({ roundArea: Rect.fromEvent(event) }, ts.map(r => {
                return {
                    text: r.text,
                    value: r.id,
                    checkLabel: r.id == self.config.rollupTableId
                }
            }));
            if (r?.item) {
                self.config.rollupTableId = r.item.value;
                self.loadTypeDatas(true)
            }
        }
        async function selectField(event: React.MouseEvent) {
            var r = await useSelectMenuItem({ roundArea: Rect.fromEvent(event) }, self.rollTableSchema.visibleFields.map(r => {
                return {
                    text: r.text,
                    value: r.id,
                    icon: GetFieldTypeSvg(r.type),
                    checkLabel: r.id == self.config.rollupFieldId
                }
            }).reverse());
            if (r?.item) {
                self.config.rollupFieldId = r.item.value;
                var f = self.rollTableSchema.visibleFields.find(g => g.id == self.config.rollupFieldId);
                if (f && ![FieldType.number, FieldType.autoIncrement].includes(f.type)) {
                    self.config.rollupStatistic = '$count';
                }
                self.loadTypeDatas(true)
            }
        }
        async function selectS(event: React.MouseEvent) {
            var menus = sums;
            var f = self.rollTableSchema.visibleFields.find(g => g.id == self.config.rollupFieldId);
            if (f) {
                if (![FieldType.number, FieldType.autoIncrement].includes(f.type)) {
                    menus = [
                        { text: lst('数量'), value: '$count', icon: { name: 'byte', code: 'preschool' } }
                    ];
                }
            }
            var r = await useSelectMenuItem({ roundArea: Rect.fromEvent(event) }, menus.map(r => {
                return {
                    text: r.text,
                    value: r.value,
                    icon: r.icon as any,
                    type: r.type,
                    checkLabel: self.config.rollupStatistic == r.value
                }
            }));
            if (r?.item) {
                self.config.rollupStatistic = r.item.value;
                self.forceUpdate()
            }
        }
        var tt = ts.find(g => g.id == this.config.rollupTableId)
        return <>
            <div className="gap-h-10 padding-w-14">
                <div className="flex gap-b-5 remark f-12"><S>关联表格</S>:</div>
                <div onClick={e => selectRelationTable(e)}
                    className="flex h-26  border-light  round item-hover-light cursor">

                    <span className="flex-center  size-24  flex-fix cursor  round "><Icon size={14} icon={tt?.icon || CollectTableSvg}></Icon></span>
                    <span className="flex-auto ">{tt?.text}</span>
                    <span className="flex-fixed size-24 round  flex-center">
                        <Icon size={14} icon={ChevronDownSvg}></Icon>
                    </span>

                </div>
            </div>
            {self.rollTableSchema?.visibleFields && <>
                <div className="gap-h-10 padding-w-14">
                    <label className="flex gap-b-5 remark f-12"><S>统计列</S>:</label>
                    <div onClick={e => selectField(e)} className="flex h-26  border-light   round item-hover-light cursor">

                        <span className="flex-center  size-24  flex-fix cursor  round "> <Icon size={16} className={'text-1'} icon={GetFieldTypeSvg(self.rollTableSchema.visibleFields.find(g => g.id == this.config.rollupFieldId)?.type)}></Icon></span>
                        <span className="flex-auto ">{self.rollTableSchema.visibleFields.find(g => g.id == this.config.rollupFieldId)?.text}</span>
                        <span className="flex-fixed size-24 round  flex-center">
                            <Icon size={14} icon={ChevronDownSvg}></Icon>
                        </span>

                    </div>
                </div>
                {this.config.rollupFieldId && <div className="gap-h-10 padding-w-14">
                    <label className="flex gap-b-5 remark f-12"><S>统计</S>:</label>
                    <div onClick={e => selectS(e)} className="flex h-26 border-light  round item-hover-light cursor">
                        <span className="flex-center  size-24  flex-fix cursor  round "> <Icon icon={sums.find(g => g.value == this.config.rollupStatistic)?.icon as any} size={16} className={'text-1'} ></Icon></span>
                        <span className="flex-auto ">{sums.find(g => g.value == this.config.rollupStatistic)?.text}</span>
                        <span className="flex-fixed size-24 round  flex-center">
                            <Icon size={14} icon={ChevronDownSvg}></Icon>
                        </span>
                    </div>
                </div>}
            </>
            }
        </>
    }
    renderFormula() {
        if (this.type != FieldType.formula) return <></>
        return <div className="gap-h-10 padding-w-14">
            <div className="flex gap-b-5 remark f-12"><S>公式</S>:</div>
            <div className="flex">
                <Textarea value={this.config?.formula?.formula || ''} onEnter={e => this.config.formula = e}></Textarea>
            </div>
        </div>
    }
    renderEmoji() {
        if ([FieldType.emoji].includes(this.type)) {
            return <div className="gap-h-10 padding-w-14">
                <div className="flex gap-b-5 remark f-12"><S>表情</S>:</div>
                <div className="flex padding-w-5">
                    {this.config?.emoji?.code && <span className="gap-r-5 f-20 l-20 size-20" onClick={e => this.onSetEmoji(e)} dangerouslySetInnerHTML={{ __html: getEmoji(this.config?.emoji?.code) }}></span>}
                    <Button onClick={e => this.onSetEmoji(e)} ghost >{this.config?.emoji?.code ? lst("更换表情") : lst("添加表情")}</Button>
                </div>
            </div>
        }
        else return <></>
    }
    async openSelectType(event: React.MouseEvent) {
        event.stopPropagation();
        var menus = getMenus();
        var os = this.dataGrid.schema.fields.filter(g => OnlyFieldTypes.includes(g.type));
        if (os.length > 0) {
            menus = menus.filter(g => !OnlyFieldTypes.includes(g.value));
        }
        var um = await useSelectMenuItem({ roundPoint: Point.from(event) }, menus);
        if (um?.item) {
            await this.changeType(um.item.value);
        }
    }
    input: Input;
    render() {
        var self = this;
        var ms = getMenus();
        var tm = ms.find(g => g.value == this.type);
        return <div className="w-300 f-14 text">
            <div className="flex  h-20 gap-t-5 f-12 padding-w-14 text-1 bold">
                <span>{this.fieldId ? lst("编辑字段") : lst("新增字段")}</span>
            </div>
            <Divider></Divider>
            <div className="max-h-250 overflow-y">
                <div className="gap-h-10 padding-w-14">
                    <div className="flex gap-b-5 remark f-12"><S>字段名</S>:</div>
                    <div>
                        <Input ref={e => this.input = e} onChange={e => this.text = e} value={this.text}></Input>
                    </div>
                </div>
                <div className="gap-h-10 padding-w-14">
                    <div className="flex gap-b-5 remark f-12"><S>字段类型</S>:</div>
                    <div className="flex h-26 border-light round item-hover-light cursor" onClick={e => this.openSelectType(e)}>
                        <span className="flex-center  size-24  flex-fix cursor  round "><Icon size={14} icon={GetFieldTypeSvg(this.type)}></Icon></span>
                        <span className="flex-auto ">{tm?.text}</span>
                        <span className="flex-fixed size-24 round  flex-center">
                            <Icon size={14} icon={ChevronDownSvg}></Icon>
                        </span>
                    </div>
                </div>
                {this.renderRelation()}
                {this.renderRollup()}
                {this.renderFormula()}
                {this.renderMultiple()}
                {this.renderEmoji()}
            </div>
            <Divider></Divider>
            <div className="flex padding-w-14 gap-h-10">
                <span className="flex-auto error">{this.error}</span>
                <div className="flex-fix flex-end">
                    <Button className="gap-r-10" ghost onClick={e => this.emit('close')}><S>取消</S></Button>
                    <Button onClick={e => self.onSave()}>{this.fieldId ? <S>保存</S> : <S>创建</S>}</Button>
                </div>
            </div>
        </div>
    }
    async changeType(type: FieldType) {
        if (this.type != type) {
            var m = getMenus();
            var item = m.find(g => g.value == this.type);
            var isAutoChangeText: boolean = false;
            if (!this.text) isAutoChangeText = true;
            else {
                if (item.text == this.text) isAutoChangeText = true;
            }
            this.type = type;
            if (isAutoChangeText) {
                var nt = m.find(g => g.value == type);
                if (nt) {
                    this.text = nt.text;
                    if (this.input) this.input.updateValue(this.text);
                }
            }
            await this.loadTypeDatas();
            this.forceUpdate();
        }
    }
    private relationDatas: TableSchema[];
    get rollTableSchema() {
        if (Array.isArray(this.relationDatas)) return this.relationDatas.find(g => g.id == this.config.rollupTableId);
    }
    async loadTypeDatas(force?: boolean) {
        var isUpdate: boolean = false;
        if (this.type == FieldType.relation) {
            if (!Array.isArray(this.relationDatas)) {
                await TableSchema.onLoadAll()
                this.relationDatas = await TableSchema.getSchemas()
                isUpdate = true;
            }
        }
        else if (this.type == FieldType.rollup) {
            if (!Array.isArray(this.relationDatas)) {
                await TableSchema.onLoadAll()
                this.relationDatas = await TableSchema.getSchemas()
                isUpdate = true;
            }
        }
        if (this.type == FieldType.rollup) {
            var rs = this.dataGrid.schema.fields.findAll(g => g.type == FieldType.relation);
            var ts = this.relationDatas.findAll(g => rs.some(r => r.config.relationTableId == g.id));
            if (ts.length > 0) {
                if (ts.some(tt => tt.id == this.config.rollupTableId) == false) {
                    this.config.rollupTableId = ts[0].id;
                    isUpdate = true;
                }
            }
        }
        if (force == true || isUpdate) {
            this.forceUpdate()
        }
    }
    async onSetEmoji(e: React.MouseEvent) {
        var r = await useOpenEmoji({ roundArea: Rect.fromEvent(e) });
        if (r) {
            await this.onChangeConfig({ emoji: r })
        }
    }
    private error: string = '';
    private text: string = '';
    private type: FieldType;
    private config: FieldConfig = {};
    private fieldId: string = '';
    private dataGrid: DataGridView;
    async open(options: {
        field?: Field,
        dataGrid: DataGridView
    }) {
        this.fieldId = options?.field?.id || '';
        this.text = options.field?.text || '';
        this.type = options.field?.type || FieldType.text;
        this.config = lodash.cloneDeep(options.field?.config || {});
        this.relationDatas = null;
        this.dataGrid = options.dataGrid;
        await this.loadTypeDatas();
        this.forceUpdate();
    }
    async onChangeConfig(config: Partial<FieldConfig>) {
        Object.assign(this.config, config);
        this.forceUpdate();
    }
}

export async function useTableStoreAddField(pos: PopoverPosition,
    option: {
        field?: Field,
        dataGrid: DataGridView
    }) {
    let popover = await PopoverSingleton(TableFieldView, { mask: true });
    let fv = await popover.open(pos);
    fv.open(option);
    return new Promise((resolve: (data: { text: string, type: FieldType, config?: FieldConfig }) => void, reject) => {
        fv.only('save', (data: { text: string, type: FieldType, config?: FieldConfig }) => {
            popover.close();
            resolve(data);
        });
        fv.only('close', () => {
            popover.close();
            resolve(null);
        })
        popover.only('close', () => {
            resolve(null)
        })
    })
}