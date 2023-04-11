
import lodash from "lodash";
import React from "react";
import { PopoverSingleton } from "../../../extensions/popover/popover";
import { EventsComponent } from "../../lib/events.component";
import { PlusSvg } from "../../svgs";
import { Button } from "../button";
import { Col, Dialoug, Row, Space } from "../grid";
import { Icon } from "../icon";
import { Input } from "../input";
import { Textarea } from "../input/textarea";
import { Select } from "../select";
import { Remark, ErrorText } from "../text";
import { ToolTip } from "../tooltip";
import "./style.less";

export type FormDialougType = {
    fields: { name: string, text: string, tip?: string, type: 'input' | 'textarea' | 'switch' | 'select', options?: { text: string, value: string }[], default?: any }[],
    title: string,
    remark?: string,
    model?: Record<string, any>,
    checkModel?: (model: Record<string, any>) => Promise<string>;
    saveModel?: (model: Record<string, any>) => Promise<string>;
}
class FormDialoug extends EventsComponent {
    render() {
        return <Dialoug className={'shy-form-dialoug'}
            head={<span>{this.title}</span>}
            footer={<Row>
                <Col span={12}>
                    {this.error && <ErrorText>{this.error}</ErrorText>}
                </Col>
                <Col span={12} align={'end'}>
                    <Space>
                        <Button onClick={e => this.onClose()} ghost>取消</Button>
                        <Button onClick={e => this.onSave()} ref={e => this.button = e}>确定</Button>
                    </Space>
                </Col>
            </Row>}
        >{this.remark && <Row className={'shy-form-remark'} align="center"><Remark>{this.remark}</Remark></Row>}
            <div className="shy-form-box">
                {this.fields.map(f => {
                    return <div className="shy-form-element" key={f.name}>
                        <Row><Col><label>{f.text}</label>{f.tip && <ToolTip overlay={f.tip}><Icon icon={PlusSvg}></Icon></ToolTip>}</Col></Row>
                        <Row>
                            <Col>
                                {f.type == 'input' && <Input onEnter={e => this.onSave()} onChange={e => this.model[f.name] = e} value={this.model[f.name] || ''}></Input>}
                                {f.type == 'textarea' && <Textarea onEnter={e => this.onSave()} onChange={e => this.model[f.name] = e} value={this.model[f.name] || ''}></Textarea>}
                                {f.type == 'select' && <Select onChange={e => this.model[f.name] = e} value={this.model[f.name] || ''} options={f.options || []}></Select>}
                            </Col>
                        </Row>
                    </div>
                })}
            </div>

        </Dialoug>
    }
    error: string = '';
    button: Button;
    async onSave() {
        this.button.loading = true;
        this.error = '';
        if (typeof this.checkModel == 'function') this.error = await this.checkModel(this.model);
        this.forceUpdate();
        if (!this.error) {
            if (typeof this.saveModel == 'function') {
                var g = await this.saveModel(this.model);
                if (g) {
                    this.error = g;
                    this.forceUpdate();
                }
                else return this.emit('save', this.model)
            } else return this.emit('save', this.model)
        }
        this.button.loading = false;

    }
    onClose() {
        this.emit('close');
    }
    title: string = '';
    remark: string = '';
    model: Record<string, any> = {};
    checkModel?: (model: Record<string, any>) => Promise<string>;
    saveModel?: (model: Record<string, any>) => Promise<string>;
    fields: FormDialougType['fields'] = [];
    open(options: FormDialougType) {
        this.fields = options.fields;
        this.title = options.title;
        this.remark = options.remark || "";
        this.model = options.model ? lodash.cloneDeep(options.model) : {};
        this.button.loading = false;
        this.fields.forEach(f => {
            if (typeof this.model[f.name] == 'undefined' && typeof f.default != 'undefined') {
                this.model[f.name] = lodash.clone(f.default);
            }
        })
        this.forceUpdate();
    }
}

export async function useForm(options: FormDialougType) {
    let popover = await PopoverSingleton(FormDialoug);
    let fv = await popover.open({ center: true });
    fv.open(options);
    return new Promise((resolve: (data: Record<string, any>) => void, reject) => {
        fv.only('close', () => {
            popover.close();
            resolve(null);
        });
        fv.only('save', function (d) {
            popover.close();
            resolve(d);
        })
        popover.only('close', () => {
            resolve(null);
        });
    })
}