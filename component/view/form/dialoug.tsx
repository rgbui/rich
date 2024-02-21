
import lodash from "lodash";
import React from "react";
import { PopoverSingleton } from "../../popover/popover";
import { EventsComponent } from "../../lib/events.component";
import { Button } from "../button";
import { Dialoug, } from "../grid";
import { Input } from "../input";
import { Textarea } from "../input/textarea";
import { HelpTip } from "../text";
import { SelectBox } from "../select/box";
import "./style.less";
import { FileInput } from "../input/file";
import { MenuItem } from "../menu/declare";
import { S } from "../../../i18n/view";

export type FormDialougType = {
    head?: boolean,
    footer?: boolean,
    fields: {
        name: string,
        text: string,
        tip?: string,
        type: 'input' | 'textarea' | 'switch' | 'select' | 'file',
        options?: MenuItem<string>[],
        default?: any,
        multiple?: boolean,
        mime?: 'image' | 'file' | 'audio' | 'video'
    }[],
    title: string,
    remark?: string,
    model?: Record<string, any>,
    checkModel?: (model: Record<string, any>) => Promise<string>;
    saveModel?: (model: Record<string, any>) => Promise<string>;
    /**
     * 关闭对话框时，通过mask，仍然返回数据，但实际没有修改，也不需要保存
     */
    maskCloseNotSave?: boolean,
    deleteButton?: boolean
}

class FormDialoug extends EventsComponent {
    render() {
        return <Dialoug className={'shy-form-dialoug'}
            head={this.head ? <span>{this.title}</span> : undefined}
            footer={this.footer ? <>
                <div className="flex-auto">{this.error && <span className="error">{this.error}</span>}&nbsp;</div>
                <div className="flex-fixed flex r-gap-l-10">
                    <Button onClick={e => this.onClose()} ghost><S>取消</S></Button>
                    {this.deleteButton && <Button onClick={e => this.emit('delete')} ghost><S>删除</S></Button>}
                    <Button onClick={e => this.onSave()} ref={e => this.button = e}><S>确定</S></Button>
                </div>
            </> : undefined}
        >
            {this.remark && <div className=" f-14 remark flex-center gap-10">{this.remark}</div>}
            <div className={"f-14 " + (this.footer ? "padding-b-10" : "")}>
                {this.fields.map(f => {
                    return <div key={f.name} className="gap-h-10">
                        <div className="flex gap-h-5 f-12 remark"><label>{f.text}</label>{f.tip && <HelpTip overlay={f.tip}></HelpTip>}</div>
                        <div>
                            {f.type == 'input' && <Input onEnter={e => this.onSave()} onChange={e => this.model[f.name] = e} value={this.model[f.name] || ''}></Input>}
                            {f.type == 'textarea' && <Textarea onEnter={e => this.onSave()} onChange={e => this.model[f.name] = e} value={this.model[f.name] || ''}></Textarea>}
                            {f.type == 'select' && <SelectBox border multiple={f.multiple ? true : false} onChange={e => { this.model[f.name] = e; this.forceUpdate(); }} value={this.model[f.name] || (f.multiple ? [] : '')} options={f.options || []}></SelectBox>}
                            {f.type == 'file' && <FileInput mime={f.mime} value={this.model[f.name]} onChange={e => { this.model[f.name] = e; this.forceUpdate(); }}></FileInput>}
                        </div>
                    </div>
                }
                )}
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
    head: boolean = true;
    footer: boolean = true;
    deleteButton = false;
    open(options: FormDialougType) {
        this.fields = options.fields;
        this.head = options.head;
        this.title = options.title;
        this.deleteButton = options.deleteButton || false;
        this.remark = options.remark || "";
        this.model = options.model ? lodash.cloneDeep(options.model) : {};
        this.button.loading = false;
        this.head = typeof options.head == 'undefined' ? true : options.head;
        if (typeof options.footer != 'undefined') this.footer = options.footer;
        else this.footer = true;
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
    let fv = await popover.open({ center: true, centerTop: 100 });
    fv.open(options);
    return new Promise((resolve: (data: Record<string, any>) => void, reject) => {
        fv.only('close', () => {
            popover.close();
            resolve(null);
        });
        fv.only('delete', () => {
            popover.close();
            resolve({ 'delete': true });
        })
        fv.only('save', function (d) {
            popover.close();
            resolve(d);
        })
        popover.only('close', () => {
            if (options?.maskCloseNotSave) resolve(null)
            else resolve(fv.model);
        });
    })
}