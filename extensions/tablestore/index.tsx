import React from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { Col, Row, Space } from "../../component/view/grid";
import { Button } from "../../component/view/button";
import { Input } from "../../component/view/input";
import { Select } from "../../component/view/select";
import { PopoverPosition } from "../popover/position";
import { PopoverSingleton } from "../popover/popover";
import { FieldType } from "../../blocks/table-store/schema/field.type";
import { ErrorText, Remark } from "../../component/view/text";
export class TableFieldView extends EventsComponent {
    render() {
        var optionTypes: { text: string, value: any }[] = [
            { text: '单行文本', value: FieldType.text },
            { text: '多行文本', value: FieldType.textarea },
            { text: '数字', value: FieldType.number },
            { text: '单选', value: FieldType.option },
            { text: '多选', value: FieldType.options },
            { text: '勾选', value: FieldType.bool },
            { text: '日期', value: FieldType.date },
        ];
        var self = this;
        function save() {
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
        return <div style={{ padding: 10, width: 300 }}>
            <Row>
                <Col><Remark>表格列名:</Remark></Col>
                <Col><Input onChange={e => this.text = e} value={this.text}></Input></Col>
            </Row>
            <Row>
                <Col><Remark>表格列类型:</Remark></Col>
                <Col><Select style={{ width: '100%' }} value={this.type} onChange={e => { this.type = e; self.forceUpdate(); }} options={optionTypes}>
                </Select>
                </Col>
            </Row>
            <Row style={{ marginTop: 10 }}>
                <Col align="end">
                    <Space>
                        {this.error && <ErrorText>{this.error}</ErrorText>}
                        <Button ghost onClick={e => this.emit('close')}>取消</Button>
                        <Button onClick={save}>确定</Button>
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



export async function useTableStoreAddField(pos: PopoverPosition,
    option: {
        text: string, type: FieldType,
        check?: (newText: string) => string
    }) {
    let popover = await PopoverSingleton(TableFieldView);
    let fv = await popover.open(pos);
    fv.open(option, option.check);
    return new Promise((resolve: (data: { text: string, type: FieldType }) => void, reject) => {
        fv.only('save', (data: { text: string, type: FieldType }) => {
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