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
import { Remark, ErrorText } from "../../../component/view/text";
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
            return <div className="shy-data-grid-field-selector-item">
                <div className="shy-data-grid-field-selector-item-control" >
                    <Remark>是否允许多个:</Remark><Switch onChange={e => this.onChangeConfig({ isMultiple: e })} checked={this.config?.isMultiple ? true : false}></Switch>
                </div>
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
                        onChange={e => { this.config.relationTableId = e; this.forceUpdate() }}
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
            <div className="shy-data-grid-field-selector-item">
                <div className="shy-data-grid-field-selector-item-control" >
                    <Remark>是否一对多:</Remark><Switch onChange={e => this.onChangeConfig({ isMultiple: e })} checked={this.config?.isMultiple ? true : false}></Switch>
                </div>
            </div>
        </>
    }
    renderRollup() {
        if (this.type != FieldType.rollup) return <></>;
        var rs = this.dataGrid.schema.fields.findAll(g => g.type == FieldType.relation);
        var ts = this.relationDatas.findAll(g => rs.some(r => r.config.relationTableId == g.id));
        if (ts.length == 0) return <>
            <div className="shy-data-grid-field-selector-item">
                <Remark>没有关联的表，无法聚合统计</Remark>
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
    render() {
        var self = this;
        var ms = getMenus();
        var tm = ms.find(g => g.value == this.type);
        return <div className="shy-data-grid-field-selector">
            <div className="shy-data-grid-field-selector-head">
                <span>编辑表格字段</span>
            </div>
            <Divider></Divider>
            <div className="shy-data-grid-field-selector-item">
                <label className="label">表格列名:</label>
                <div className="shy-data-grid-field-selector-item-control">
                    <Input onChange={e => this.text = e} value={this.text}></Input>
                </div>
            </div>
            <div className="shy-data-grid-field-selector-item">
                <label className="label">表格列类型:</label>
                <div className="shy-data-grid-field-selector-field-type" onClick={e => this.openSelectType(e)}>
                    <Icon size={14} icon={getTypeSvg(this.type)}></Icon>
                    <span>{tm?.text}</span>
                    <Icon size={12} icon={ChevronDownSvg}></Icon>
                </div>
            </div>
            {this.renderRelation()}
            {this.renderRollup()}
            {this.renderFormula()}
            {this.renderMultiple()}
            {this.renderEmoji()}
            <Divider></Divider>
            <div className="shy-data-grid-field-selector-footer">
                {this.error && <ErrorText>{this.error}</ErrorText>}
                <Button ghost onClick={e => this.emit('close')}>取消</Button>
                <Button onClick={e => self.onSave()}>确定</Button>
            </div>
        </div>
    }
    async changeType(type: FieldType) {
        this.type = type;
        await this.loadTypeDatas();
        this.forceUpdate();
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
    async open(option: {
        field?: Field,
        dataGrid: DataGridView
    }
    ) {
        this.fieldId = option?.field?.id || '';
        this.text = option.field?.text || '属性';
        this.type = option.field?.type || FieldType.text;
        this.config = lodash.cloneDeep(option.field?.config || {});
        this.relationDatas = null;
        this.rollFields = null;
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