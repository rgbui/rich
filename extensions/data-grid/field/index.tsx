import { PopoverPosition } from "../../popover/position";
import { PopoverSingleton } from "../../popover/popover";
import { FieldType } from "../../../blocks/data-grid/schema/type";
import { Field, FieldConfig } from "../../../blocks/data-grid/schema/field";
import React from "react";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { getTypeSvg } from "../../../blocks/data-grid/schema/util";
import { EventsComponent } from "../../../component/lib/events.component";
import { PlusSvg, ChevronDownSvg } from "../../../component/svgs";
import { useSelectMenuItem } from "../../../component/view/menu";
import { channel } from "../../../net/channel";
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
import { SelectBox } from "../../../component/view/select/box";
import './style.less';
import { DataGridView } from "../../../blocks/data-grid/view/base";
import lodash from "lodash";

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
        if ([FieldType.file, FieldType.video, FieldType.user, FieldType.image].includes(this.type)) {
            return <div className="flex gap-h-10 padding-w-14 ">
                <span className="flex-auto remark f-12">是否允许多个:</span>
                <div className="flex-fix flxe-end"><Switch onChange={e => this.onChangeConfig({ isMultiple: e })} checked={this.config?.isMultiple ? true : false}></Switch></div>
            </div>
        }
        else return <></>
    }
    renderRelation() {
        if (this.type != FieldType.relation) return <></>
        return <>
            <div className="shy-data-grid-field-selector-item">
                <label className="label">关联表格:</label>
                <div className="shy-data-grid-field-selector-item-control">
                    <SelectBox
                        onChange={e => {
                            this.config.relationTableId = e;
                            this.forceUpdate()
                        }}
                        value={this.config.relationTableId}
                        options={this.relationDatas.map(r => {
                            return {
                                text: r.text + (Array.isArray(r.views) && r.views.length > 0 ? r.views[0].text : ''),
                                value: r.id
                            }
                        })}
                        style={{ width: '100%' }}>
                    </SelectBox>
                </div>
            </div>
            <div className="flex gap-h-10 padding-w-14 ">
                <span className="flex-auto remark f-12">是否一对多:</span>
                <div className="flex-fix flxe-end"><Switch onChange={e => this.onChangeConfig({ isMultiple: e })} checked={this.config?.isMultiple ? true : false}></Switch></div>
            </div>
        </>
    }
    renderRollup() {
        if (this.type != FieldType.rollup) return <></>;
        var rs = this.dataGrid.schema.fields.findAll(g => g.type == FieldType.relation);
        var ts = this.relationDatas.findAll(g => rs.some(r => r.config.relationTableId == g.id));
        if (ts.length == 0) return <>
            <div className="flex-center gap-h-10 remark">
                没有关联的表，无法聚合统计
            </div>
        </>;
        return <>
            <div className="shy-data-grid-field-selector-item">
                <label className="label">关联表格:</label>
                <div className="shy-data-grid-field-selector-item-control">
                    <SelectBox
                        value={this.config.rollupTableId}
                        options={ts.map(r => { return { text: r.text, value: r.id } })}
                        onChange={e => { this.config.rollupTableId = e; this.loadTypeDatas(true) }}
                    >
                    </SelectBox>
                </div>
            </div>
            {this.rollFields && this.rollFields[this.config.rollupTableId] && <>
                <div className="shy-data-grid-field-selector-item">
                    <label className="label">统计表格列:</label>
                    <div className="shy-data-grid-field-selector-item-control">
                        <SelectBox value={this.config.rollupFieldId} options={this.rollFields[this.config.rollupTableId].map(c => {
                            return { text: c.text, value: c.id, icon: getTypeSvg(c.type) }
                        })}
                            onChange={e => { this.config.rollupFieldId = e; this.loadTypeDatas(true) }}
                            style={{ width: '100%' }}>
                        </SelectBox>
                    </div>
                </div>
                {this.config.rollupFieldId && <div className="shy-data-grid-field-selector-item">
                    <label className="label">对数据进行统计:</label>
                    <div className="shy-data-grid-field-selector-item-control">
                        <SelectBox
                            onChange={e => { this.config.rollupStatistic = e; this.forceUpdate() }}
                            value={this.config.rollupStatistic}
                            options={[
                                { text: '平均值', value: '$agv' },
                                { text: '求和', value: '$sum' },
                                { text: '最小值', value: '$min' },
                                { text: '最大值', value: '$max' }
                            ]}
                        ></SelectBox>
                    </div>
                </div>}
            </>
            }
        </>
    }
    renderFormula() {
        if (this.type != FieldType.formula) return <></>
        return <div className="shy-data-grid-field-selector-item">
            <label className="label">公式:</label>
            <div className="shy-data-grid-field-selector-item-control">
                <Textarea value={this.config.formula} onEnter={e => this.config.formula = e}></Textarea>
            </div>
        </div>
    }
    renderEmoji() {
        if ([FieldType.emoji].includes(this.type)) {
            return <div className="shy-data-grid-field-selector-item">
                <label className="label">表情:</label>
                <div className="shy-data-grid-field-selector-emoji">
                    {this.config?.emoji?.code && <span onClick={e => this.onSetEmoji(e)} dangerouslySetInnerHTML={{ __html: getEmoji(this.config?.emoji?.code) }}></span>}
                    {!this.config?.emoji?.code && <Button onClick={e => this.onSetEmoji(e)} ghost icon={PlusSvg}>添加表情</Button>}
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
        return <div className="w-300 max-h-250 overflow-y f-14 text">
            <div className="flex item-hover-focus h-30 padding-w-14">
                <span>{this.fieldId ? "编辑表格字段" : "新增表格字段"}</span>
            </div>
            <div className="gap-h-10 padding-w-14">
                <div className="flex gap-b-5 remark f-12">字段名:</div>
                <div>
                    <Input ref={e => this.input = e} onChange={e => this.text = e} value={this.text}></Input>
                </div>
            </div>
            <div className="gap-h-10 padding-w-14">
                <div className="flex gap-b-5 remark f-12">字段类型:</div>
                <div className="flex h-30 round item-hover cursor" onClick={e => this.openSelectType(e)}>
                    <span className="flex-center  size-24  flex-fix cursor item-hover round "><Icon size={14} icon={getTypeSvg(this.type)}></Icon></span>
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
    private rollFields: Record<string, Field[]>;
    async loadTypeDatas(force?: boolean) {
        var isUpdate: boolean = false;
        if (this.type == FieldType.relation) {
            if (!Array.isArray(this.relationDatas)) {
                var r = await channel.get('/schema/list');
                if (r.ok) {
                    this.relationDatas = r.data.list as TableSchema[];
                    isUpdate = true;
                }
            }
        }
        else if (this.type == FieldType.rollup) {
            if (!Array.isArray(this.relationDatas)) {
                var r = await channel.get('/schema/list');
                if (r.ok) {
                    this.relationDatas = r.data.list as TableSchema[];
                    isUpdate = true;
                }
            }
            if (this.config.rollupTableId && !(this.rollFields && this.rollFields[this.config.rollupTableId])) {
                if (!this.rollFields) { this.rollFields = {} }
                if (!this.rollFields[this.config.rollupTableId]) {
                    var rr = await channel.get('/schema/query', { id: this.config.rollupTableId as string });
                    if (rr.ok) {
                        this.rollFields[this.config.rollupTableId] = rr.data.schema.fields
                        isUpdate = true;
                    }
                }
            }
        }
        if (force == true && isUpdate) {
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
        this.rollFields = null;
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