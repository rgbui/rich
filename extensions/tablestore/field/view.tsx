import React from "react";
import { FieldType } from "../../../blocks/table-store/schema/field.type";
import { EventsComponent } from "../../../component/lib/events.component";
import { Button } from "../../../component/view/button";
import { Col, Row, Space } from "../../../component/view/grid";
import { Input } from "../../../component/view/input";
import { Select } from "../../../component/view/select";
import { Remark, ErrorText } from "../../../component/view/text";
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
        self.emit('save', { text: self.text, type: self.type });
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
                    onChange={e => { this.type = e; self.forceUpdate(); }}
                    options={TableFieldTypes}>
                </Select>
                </Col>
            </Row>
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
    private error: string = '';
    private text: string = '';
    private type: FieldType;
    private check: (text: string) => string;
    open(option: { text: string, type: FieldType }, check: (newText: string) => string) {
        this.text = option.text;
        this.type = option.type;
        this.check = check;
        this.forceUpdate();
    }
}
