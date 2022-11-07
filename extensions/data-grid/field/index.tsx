import { PopoverPosition } from "../../popover/position";
import { PopoverSingleton } from "../../popover/popover";
import { FieldType } from "../../../blocks/data-grid/schema/type";
import { Field, FieldConfig } from "../../../blocks/data-grid/schema/field";
import React from "react";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { GetFieldTypeSvg } from "../../../blocks/data-grid/schema/util";
import { EventsComponent } from "../../../component/lib/events.component";
import { PlusSvg, ChevronDownSvg } from "../../../component/svgs";
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
import './style.less';
import { DataGridView } from "../../../blocks/data-grid/view/base";
import lodash from "lodash";
import { useDataSourceView } from "../datasource";
import { MenuItemType } from "../../../component/view/menu/declare";

export class TableFieldView extends EventsComponent {
    onSave() {
        var self = this;
        self.error = '';
        if (!self.text) {
            self.error = '字段名不能为空';
            return self.forceUpdate();
        }
        if (self.dataGrid.schema.fields.some(s => s.text == self.text && !this.fieldId || this.fieldId && this.fieldId != s.id && this.text == s.text)) {
            self.error = '字段名有重复';
            return self.forceUpdate();
        }
        self.forceUpdate();
        self.emit('save', { text: self.text, type: self.type, config: lodash.cloneDeep(self.config) });
    }
    renderMultiple() {
        if ([
            FieldType.file,
            FieldType.video,
            FieldType.user,
            FieldType.image
        ].includes(this.type)) {
            return <div className="flex gap-h-10 padding-w-14 ">
                <span className="flex-auto remark f-12">是否允许多个:</span>
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
                <div className="flex gap-b-5 remark f-12">关联表格:</div>
                <div className="flex h-30 padding-w-5 round item-hover cursor" onClick={e => this.openSelectRelationTable(e)}>
                    {rt?.text}
                </div>
            </div>
            <div className="flex gap-h-10 padding-w-14 ">
                <span className="flex-auto remark f-12">是否一对多:</span>
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
                没有关联的表，无法聚合统计
            </div>
        </>
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
            }));
            if (r?.item) {
                self.config.rollupFieldId = r.item.value;
                self.loadTypeDatas(true)
            }
        }
        async function selectS(event: React.MouseEvent) {
            var menus = [
                { text: '数量', value: '$count' },
                { text: '聚合', type: MenuItemType.text },
                { text: '平均值', value: '$agv' },
                { text: '求和', value: '$sum' },
                { text: '最小值', value: '$min' },
                { text: '最大值', value: '$max' },
            ];
            var f = self.rollTableSchema.visibleFields.find(g => g.id == self.config.rollupFieldId);
            if (f) {
                if (![FieldType.number, FieldType.autoIncrement].includes(f.type)) {
                    menus = [
                        { text: '数量', value: '$count' }
                    ];
                }
            }
            var r = await useSelectMenuItem({ roundArea: Rect.fromEvent(event) }, menus.map(r => {
                return {
                    text: r.text,
                    value: r.value,
                    type: r.type,
                    checkLabel: self.config.rollupStatistic == r.value
                }
            }));
            if (r?.item) {
                self.config.rollupStatistic = r.item.value;
                self.forceUpdate()
            }
        }
        return <>
            <div className="gap-h-10 padding-w-14">
                <div className="flex gap-b-5 remark f-12">关联表格:</div>
                <div onClick={e => selectRelationTable(e)} className="flex h-30 padding-w-5 round item-hover cursor">
                    {ts.find(g => g.id == this.config.rollupTableId)?.text}
                </div>
            </div>
            {self.rollTableSchema?.visibleFields && <>
                <div className="gap-h-10 padding-w-14">
                    <label className="flex gap-b-5 remark f-12">统计表格列:</label>
                    <div onClick={e => selectField(e)} className="flex h-30 padding-w-5 round item-hover cursor">
                        <Icon icon={GetFieldTypeSvg(self.rollTableSchema.visibleFields.find(g => g.id == this.config.rollupFieldId)?.type)}></Icon>
                        {self.rollTableSchema.visibleFields.find(g => g.id == this.config.rollupFieldId)?.text}
                    </div>
                </div>
                {this.config.rollupFieldId && <div className="gap-h-10 padding-w-14">
                    <label className="flex gap-b-5 remark f-12">对数据进行统计:</label>
                    <div onClick={e => selectS(e)} className="flex h-30 padding-w-5 round item-hover cursor">
                        {[
                            { text: '平均值', value: '$agv' },
                            { text: '求和', value: '$sum' },
                            { text: '最小值', value: '$min' },
                            { text: '最大值', value: '$max' },
                            { text: '数量', value: '$count' }
                        ].find(g => g.value == this.config.rollupStatistic)?.text}
                    </div>
                </div>}
            </>
            }
        </>
    }
    renderFormula() {
        if (this.type != FieldType.formula) return <></>
        return <div className="gap-h-10 padding-w-14">
            <div className="flex gap-b-5 remark f-12">公式:</div>
            <div className="flex">
                <Textarea value={this.config.formula} onEnter={e => this.config.formula = e}></Textarea>
            </div>
        </div>
    }
    renderEmoji() {
        if ([FieldType.emoji].includes(this.type)) {
            return <div className="gap-h-10 padding-w-14">
                <div className="flex gap-b-5 remark f-12">表情:</div>
                <div className="flex padding-w-5">
                    {this.config?.emoji?.code && <span className="gap-r-5 f-20 l-20 size-20" onClick={e => this.onSetEmoji(e)} dangerouslySetInnerHTML={{ __html: getEmoji(this.config?.emoji?.code) }}></span>}
                    <Button onClick={e => this.onSetEmoji(e)} ghost icon={PlusSvg}>{this.config?.emoji?.code ? "更换表情" : "添加表情"}</Button>
                </div>
            </div>
        }
        else return <></>
    }
    async openSelectType(event: React.MouseEvent) {
        event.stopPropagation();
        var menus = getMenus();
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
            <div className="flex item-hover-focus h-30 padding-w-14">
                <span>{this.fieldId ? "编辑表格字段" : "新增表格字段"}</span>
            </div>
            <div className="max-h-250 overflow-y">
                <div className="gap-h-10 padding-w-14">
                    <div className="flex gap-b-5 remark f-12">字段名:</div>
                    <div>
                        <Input ref={e => this.input = e} onChange={e => this.text = e} value={this.text}></Input>
                    </div>
                </div>
                <div className="gap-h-10 padding-w-14">
                    <div className="flex gap-b-5 remark f-12">字段类型:</div>
                    <div className="flex h-30 round item-hover cursor" onClick={e => this.openSelectType(e)}>
                        <span className="flex-center  size-24  flex-fix cursor item-hover round "><Icon size={14} icon={GetFieldTypeSvg(this.type)}></Icon></span>
                        <span className="flex-auto ">{tm?.text}</span>
                        <span className="flex-fixed size-24 round item-hover flex-center">
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
                    <Button className="gap-r-10" ghost onClick={e => this.emit('close')}>取消</Button>
                    <Button onClick={e => self.onSave()}>确定</Button>
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
        if (Array.isArray(this.relationDatas))
            return this.relationDatas.find(g => g.id == this.config.rollupTableId);

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
    }
    ) {
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