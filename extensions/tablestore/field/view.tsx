import React from "react";
import { Field, FieldConfig } from "../../../blocks/table-store/schema/field";
import { FieldType } from "../../../blocks/table-store/schema/type";
import { TableSchema } from "../../../blocks/table-store/schema/meta";
import { EventsComponent } from "../../../component/lib/events.component";
import { Button } from "../../../component/view/button";
import { Col, Row, Space } from "../../../component/view/grid";
import { Input, Textarea } from "../../../component/view/input";
import { Select } from "../../../component/view/select";
import { Remark, ErrorText } from "../../../component/view/text";
import { Directive } from "../../../util/bus/directive";
import { messageChannel } from "../../../util/bus/event.bus";
import { TableFieldTypes } from "./type";

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
    render() {
        var self = this;
        return <div style={{ padding: 10, width: 300 }}>
            <Row>
                <Col><Remark>表格列名:</Remark></Col>
                <Col><Input onChange={e => this.text = e} value={this.text}></Input></Col>
            </Row>
            <Row>
                <Col><Remark>表格列类型:</Remark></Col>
                <Col><Select style={{ width: '100%' }}
                    value={this.type}
                    onChange={e => this.changeType(e)}
                    options={TableFieldTypes}>
                </Select>
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
        this.forceUpdate();
    }
    private relationDatas: TableSchema[];
    private rollFields: Record<string, Field[]>;
    async loadTypeDatas(force?: boolean) {
        var isUpdate: boolean = false;
        if (this.type == FieldType.relation) {
            if (!Array.isArray(this.relationDatas)) {
                var data = await messageChannel.fireAsync(Directive.QueryWorkspaceTableSchemas);
                this.relationDatas = data.list;
                isUpdate = true;

            }
        }
        else if (this.type == FieldType.rollup) {
            if (!Array.isArray(this.relationDatas)) {
                var data = await messageChannel.fireAsync(Directive.QueryWorkspaceTableSchemas);
                this.relationDatas = data.list;
                isUpdate = true;
            }
            if (!(this.rollFields && this.rollFields[this.config.rollupTableId])) {
                if (!this.rollFields) { this.rollFields = {} }
                if (!this.rollFields[this.config.rollupTableId]) {
                    var rd = await messageChannel.fireAsync(Directive.getSchemaFields, this.config.rollupTableId as string);
                    this.rollFields[this.config.rollupTableId] = rd.fields;
                    isUpdate = true;
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
