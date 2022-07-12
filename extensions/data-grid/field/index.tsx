
import { PopoverPosition } from "../../popover/position";
import { PopoverSingleton } from "../../popover/popover";
import { FieldType } from "../../../blocks/data-grid/schema/type";
import { Field, FieldConfig } from "../../../blocks/data-grid/schema/field";
import './style.less';
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
import { Row, Col, Space } from "../../../component/view/grid";
import { Icon } from "../../../component/view/icon";
import { Input } from "../../../component/view/input";
import { Select } from "../../../component/view/select";
import { Switch } from "../../../component/view/switch";
import { Remark, ErrorText } from "../../../component/view/text";
import { Textarea } from "../../../component/view/input/textarea";

export class TableFieldView extends EventsComponent {
    onSave() {
        var self = this;
        self.error = '';
        if (typeof self.check == 'function') {
            var r = self.check(self.text);
            if (r) {
                self.error = r;
                self.forceUpdate();
                return;
            }
        }
        self.forceUpdate();
        self.emit('save', { text: self.text, type: self.type, config: self.config });
    }
    renderMultiple() {
        if ([FieldType.file, FieldType.user, FieldType.image].includes(this.type)) {
            return <Row>
                <Col><Remark>是否允许多个:</Remark><Switch onChange={e => this.onChangeConfig({ isMultiple: e })} checked={this.config?.isMultiple ? true : false}></Switch></Col>
            </Row >
        }
        else return <></>
    }
    renderRelation() {
        if (this.type != FieldType.relation) return <></>
        return <Row>
            <Col><Remark>关联表格:</Remark></Col>
            <Col><Select
                onChange={e => { this.config.relationTableId = e; this.forceUpdate() }}
                value={this.config.relationTableId}
                options={this.relationDatas.map(r => {
                    return {
                        text: r.text + (Array.isArray(r.views) && r.views.length > 0 ? r.views[0].text : ''),
                        value: r.id
                    }
                })}
                style={{ width: '100%' }}>
            </Select>
            </Col>
            <Col><Remark>是否一对多:</Remark><Switch onChange={e => this.onChangeConfig({ isMultiple: e })} checked={this.config?.isMultiple ? true : false}></Switch></Col>
        </Row >
    }
    renderRollup() {
        if (this.type != FieldType.rollup) return <></>
        return <>
            <Row>
                <Col><Remark>关联表格:</Remark></Col>
                <Col><Select
                    value={this.config.rollupTableId}
                    options={this.relationDatas.map(r => { return { text: r.text, value: r.id } })}
                    onChange={e => { this.config.rollupTableId = e; this.loadTypeDatas() }}
                    style={{ width: '100%' }}
                >
                </Select>
                </Col>
            </Row >
            {this.rollFields && this.rollFields[this.config.rollupTableId] && <><Row>
                <Col><Remark>统计表格列:</Remark></Col>
                <Col><Select value={this.config.rollupFieldId} options={this.rollFields[this.config.rollupTableId].map(c => {
                    return { text: c.text, value: c.id }
                })}
                    onChange={e => { this.config.rollupFieldId = e; this.loadTypeDatas() }}
                    style={{ width: '100%' }}></Select>
                </Col>
            </Row >
                {this.config.rollupFieldId && <Row>
                    <Col><Remark>对数据进行统计:</Remark></Col>
                    <Col><Select onChange={e => this.config.rollupStatistic = e} value={this.config.rollupStatistic} options={[]} style={{ width: '100%' }}> </Select>
                    </Col>
                </Row>}
            </>
            }
        </>
    }
    renderFormula() {
        if (this.type != FieldType.formula) return <></>
        return <Row>
            <Col><Remark>公式:</Remark></Col>
            <Col><Textarea value={this.config.formula} onEnter={e => this.config.formula = e}></Textarea>
            </Col>
        </Row >
    }
    renderEmoji() {
        if ([FieldType.emoji].includes(this.type)) {
            return <Row>
                <Col><Remark>表情:</Remark><span onClick={e => this.onSetEmoji(e)}>{this.config?.emoji?.code || <Button ghost icon={PlusSvg}>添加表情</Button>}</span></Col>
            </Row >
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
        return <div className="shy-data-grid-field-selector" style={{ padding: 10, width: 300 }}>
            <Row>
                <Col><Remark>表格列名:</Remark></Col>
                <Col><Input onChange={e => this.text = e} value={this.text}></Input></Col>
            </Row>
            <Row>
                <Col><Remark>表格列类型:</Remark></Col>
                <Col>
                    <div className="shy-data-grid-field-selector-field-type" onClick={e => this.openSelectType(e)}>
                        <Icon size={12} icon={getTypeSvg(this.type)}></Icon>
                        <span>{tm?.text}</span>
                        <Icon size={12} icon={ChevronDownSvg}></Icon>
                    </div>
                </Col>
            </Row>
            {this.renderRelation()}
            {this.renderRollup()}
            {this.renderFormula()}
            {this.renderMultiple()}
            {this.renderEmoji()}
            <Row style={{ marginTop: 10 }}>
                <Col align="end">
                    <Space>
                        {this.error && <ErrorText>{this.error}</ErrorText>}
                        <Button ghost onClick={e => this.emit('close')}>取消</Button>
                        <Button onClick={e => self.onSave()}>确定</Button>
                    </Space>
                </Col>
            </Row>
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
            if (!(this.rollFields && this.rollFields[this.config.rollupTableId])) {
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
    private check: (text: string) => string;
    private config: FieldConfig = {};
    async open(option: { text: string, type: FieldType, config?: FieldConfig }, check: (newText: string) => string) {
        this.text = option.text;
        this.type = option.type;
        this.check = check;
        this.config = option.config || {};
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
        text: string,
        type: FieldType,
        check?: (newText: string) => string,
        config?: Record<string, any>
    }) {
    let popover = await PopoverSingleton(TableFieldView, { mask: true });
    let fv = await popover.open(pos);
    fv.open(option, option.check);
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