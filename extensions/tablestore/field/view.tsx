import React from "react";
import { Field, FieldConfig } from "../../../blocks/data-grid/schema/field";
import { FieldType } from "../../../blocks/data-grid/schema/type";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { EventsComponent } from "../../../component/lib/events.component";
import { Button } from "../../../component/view/button";
import { Col, Row, Space } from "../../../component/view/grid";
import { Input, Textarea } from "../../../component/view/input";
import { Select } from "../../../component/view/select";
import { Remark, ErrorText } from "../../../component/view/text";
import { channel } from "../../../net/channel";
import { getTypeSvg } from "../../../blocks/data-grid/schema/util";
import { Icon } from "../../../component/view/icon";
import { ChevronDownSvg } from "../../../component/svgs";
import { MenuItemTypeValue } from "../../../component/view/menu/declare";
import { Point } from "../../../src/common/vector/point";
import { useSelectMenuItem } from "../../../component/view/menu";

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
    renderRelation() {
        if (this.type != FieldType.relation) return <></>
        return <Row>
            <Col><Remark>关联表格:</Remark></Col>
            <Col><Select
                onChange={e => this.config.relationTableId = e}
                value={this.config.relationTableId}
                options={this.relationDatas.map(r => { return { text: r.text, value: r.id } })}
                style={{ width: '100%' }}>
            </Select>
            </Col>
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
                    <Col><Select onChange={e => this.config.rollupStat = e} value={this.config.rollupStat} options={[]} style={{ width: '100%' }}> </Select>
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
    async openSelectType(event: React.MouseEvent) {
        event.stopPropagation();
        function map(arr) {
            return arr.map(a => {
                return {
                    text: a.text,
                    value: a.value,
                    icon: getTypeSvg(a.value)
                }
            })
        }
        var menus = [
            { type: MenuItemTypeValue.text, text: '基础' },
            ...map([
                { text: '单行文本', value: FieldType.text },
                { text: '多行文本', value: FieldType.textarea },
                { text: '数字', value: FieldType.number },
                // { text: '价钱', value: FieldType.price },
                { text: '单选', value: FieldType.option },
                { text: '多选', value: FieldType.options },
                { text: '勾选', value: FieldType.bool },
                { text: '日期', value: FieldType.date },
                { text: '图像', value: FieldType.image },
                { text: '音频', value: FieldType.audio },
                { text: '视频', value: FieldType.video },
                { text: '文件', value: FieldType.file },
                { text: '用户', value: FieldType.user },
                { text: '邮箱', value: FieldType.email },
                { text: '手机号', value: FieldType.phone },
                { text: '网址', value: FieldType.link },
                // { text: '位置', value: FieldType.geolocation },
                { text: '关联', value: FieldType.relation },
                { text: '统计', value: FieldType.rollup },
                { text: '公式', value: FieldType.formula }
            ]),
            { type: MenuItemTypeValue.text, text: '互动' },
            ...map([
                { text: '反应', value: FieldType.emoji },
                { text: '评论', value: FieldType.comment },
                // { text: '收藏', value: FieldType.favourite },
                // { text: '分享', value: FieldType.share },
                // { text: '打赏', value: FieldType.donate },
                // { text: '购买', value: FieldType.buy },
                // { text: '浏览访问', value: FieldType.browse },
            ]),
            { type: MenuItemTypeValue.text, text: '高级' },
            ...map([
                { text: '自动编号', value: FieldType.autoIncrement },
                { text: '操作按钮', value: FieldType.button },
                //{ text: '置顶', value: FieldType.top },
                { text: '创建人', value: FieldType.creater },
                { text: '创建时间', value: FieldType.createDate },
                { text: '修改人', value: FieldType.modifyer },
                { text: '修改时间', value: FieldType.modifyDate },
                // { text: '修改情况', value: FieldType.modifyDate },
            ])
        ];
        var um = await useSelectMenuItem({ roundPoint: Point.from(event) }, menus);
        if (um?.item) {
            await this.changeType(um.item.value);
        }
    }
    render() {
        var self = this;
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
                        <span>{this.type}</span>
                        <Icon size={12} icon={ChevronDownSvg}></Icon>
                    </div>
                </Col>
            </Row>
            {this.renderRelation()}
            {this.renderRollup()}
            {this.renderFormula()}
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
                console.log(r, 'ss');
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
}
