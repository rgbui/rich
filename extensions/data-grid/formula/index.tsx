import lodash from "lodash";
import React from "react";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { FieldType } from "../../../blocks/data-grid/schema/type";
import { GetFieldTypeSvg } from "../../../blocks/data-grid/schema/util";
import { EventsComponent } from "../../../component/lib/events.component";
import { ChevronRightSvg, TypesNumberSvg } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
import { Textarea } from "../../../component/view/input/textarea";
import { Markdown } from "../../../component/view/markdown";
import { Express } from "../../../src/express";
import { util } from "../../../util/util";
import { PopoverSingleton } from "../../../component/popover/popover";
import { PopoverPosition } from "../../../component/popover/position";
import { constLangs, formulaLangs, funLangs, logcLangs } from "./data";
import { Field } from "../../../blocks/data-grid/schema/field";
import { S } from "../../../i18n/view";
import { lst } from "../../../i18n/store";

class FormulaSelector extends EventsComponent {
    schema: TableSchema;
    cacheDatas = new Map<string, string>()
    openData = lodash.debounce(async (f) => {
        try {
            var url =STATIC_URL + 'static/data-grid/formula/docs' + f.url;
            var d = this.cacheDatas.get(url);
            if (!d) {
                d = await util.getText(url);
                this.cacheDatas.set(url, d);
            }
            this.md = d;
            this.forceUpdate()
        }
        catch (ex) {
            console.error(ex);
        }
    }, 300)
    openTypeData = lodash.debounce(async (f: Field) => {
        try {
            var type = 'text';
            if ([
                FieldType.number,
                FieldType.autoIncrement,
                FieldType.sort,
            ].includes(f.type)) {
                type = 'number';
            }
            if ([
                FieldType.date,
                FieldType.createDate,
                FieldType.modifyDate
            ].includes(f.type)) {
                type = 'date';
            }
            var url = STATIC_URL + 'static/data-grid/formula/docs/example/' + type + ".md";
            var d = this.cacheDatas.get(url);
            if (!d) {
                d = await util.getText(url);
                this.cacheDatas.set(url, d);
            }
            d = d.replace(/\{name\}/g, '@' + f.text);
            this.md = d;
            this.forceUpdate()
        }
        catch (ex) {
            console.error(ex);
        }
    })
    textarea: Textarea = null
    render(): React.ReactNode {
        return <div className="w-500">
            <div className="h-80"><Textarea ref={e => this.textarea = e} value={this.formula} onChange={e => this.onInput(e)} ></Textarea></div>
            <div className="flex-full h-300">
                <div className="overflow-y w-150 bg-light  padding-b-100 flex-fixed">
                    <div className="gap-h-10">
                        <div className="remark font-12 padding-l-10"><S>属性</S></div>
                        {this.schema && this.getFields().map(f => {
                            return <div
                                onMouseEnter={e => {
                                    this.openTypeData(f);
                                }}
                                onMouseDown={e => {
                                    this.formula += '@' + f.text;
                                    this.textarea.updateValue(this.formula);
                                }}
                                key={f.id}
                                className="padding-w-10 item-hover round cursor flex h-30">
                                <span className="flex-center size-24 flex-fixed"><Icon size={16} icon={GetFieldTypeSvg(f.type)}></Icon></span>
                                <span className="f-14 inline-block text-overflow flex-auto">@{f.text}</span>
                            </div>
                        })}
                    </div>
                    <div className="gap-h-10">
                        <div className="remark font-12 padding-l-10"><S>常量</S></div>
                        {constLangs.map((fl, k) => {
                            return <div onMouseEnter={e => this.openData(fl)} key={k} className="padding-w-10 item-hover round cursor flex h-30">
                                <span className="flex-fixed flex-center size-24"><Icon size={16} icon={TypesNumberSvg}></Icon></span>
                                <span className="flex-auto text-overflow">{fl.text}</span>
                            </div>
                        })}
                    </div>
                    <div className="gap-h-10">
                        <div className="remark font-12 padding-l-10"><S>运算符</S></div>
                        {logcLangs.map((fl, k) => {
                            return <div key={k}
                                onMouseEnter={e => this.openData(fl)}
                                className="padding-w-10 item-hover round cursor flex h-30">
                                <span className="gap-l-10 flex-auto text-overflow">{fl.text}</span>
                            </div>
                        })}
                    </div>
                    <div className="gap-h-10">
                        <div className="remark font-12 padding-l-10"><S>函数</S></div>
                        {funLangs.map((fl, k) => {
                            return <div key={k}
                                onMouseEnter={e => this.openData(fl)}
                                className="padding-w-10 item-hover round cursor flex h-30">
                                <span className="flex-fixed flex-center size-24"><Icon size={16} icon={TypesNumberSvg}></Icon></span>
                                <span className="flex-auto text-overflow">{fl.text}</span>
                            </div>
                        })}
                    </div>
                    <div className="gap-h-10">
                        <div className="remark font-12 padding-l-10"><S>类型</S></div>
                        {formulaLangs().map((fl, k) => {
                            return <div className="gap-h-10" key={k}>
                                <div onClick={e => { fl.spread = fl.spread ? false : true; this.forceUpdate() }}
                                    className="flex text-1 font-14 padding-l-10">
                                    <span className="flex-fixed size-24 item-hover flex-center round cursor" style={{ transform: fl.spread ? 'rotateZ(90deg)' : 'rotateZ(0deg)' }}><Icon size={16} icon={ChevronRightSvg}></Icon></span>
                                    <span className="flex-fixed flex-center size-24"><Icon size={16} icon={GetFieldTypeSvg(fl.types[0])}></Icon></span>
                                    <span className="flex-auto text-overflow">{fl.text}</span>
                                </div>
                                {fl.spread && <div>{fl.childs.map((f, g) => {
                                    return <div
                                        onMouseEnter={e => this.openData(f)}
                                        key={g}
                                        className="padding-w-10 padding-l-30 item-hover round cursor flex h-30"><span className="f-14 inline-block gap-l-10">{f.text}</span></div>
                                })}</div>}
                            </div>
                        })}
                    </div>
                </div>
                <div className="padding-10 overflow-y flex-auto md">
                    {this.md && <Markdown md={this.md}></Markdown>}
                </div>
            </div>
            {this.error && <div className="error min-h-30 padding-w-14">{this.error}</div>}
        </div>
    }
    getFields() {
        var fs = this.schema.userFields.findAll(g => [
            FieldType.title,
            FieldType.option,
            FieldType.phone,
            FieldType.email,
            FieldType.number,
            FieldType.autoIncrement,
            FieldType.sort,
            FieldType.date,
            FieldType.createDate,
            FieldType.modifyDate,
            FieldType.text,
        ].includes(g.type));
        return fs;
    }
    result: { formula: string, jsCode: any, exp: any } = null;
    onInput = lodash.debounce((e) => {
        this.error = '';
        this.forceUpdate()
        this.formula = e;
        var exp = new Express(this.getFields().map(f => {
            var type = 'string';
            if ([FieldType.date, FieldType.createDate, FieldType.modifyDate].includes(f.type)) type = 'date'
            else if ([FieldType.number, FieldType.sort].includes(f.type)) type = 'number'
            else if ([FieldType.bool].includes(f.type)) type = 'bool'
            else type = 'string'
            return {
                name: '@' + f.text,
                type: type as any,
                template: f.name
            }
        }));
        try {
            exp.parse(this.formula);
            exp.check();
            var jsCode = exp.compile();
            if (exp.checkOk) {
                this.result = {
                    formula: this.formula,
                    jsCode,
                    exp: exp.exp.get()
                }
            }
            else {
                var logs = exp.getLogs();
                this.error = logs.findAll(g => g.type == 'error').map(c => c.message).join(" ");
            }
        }
        catch (ex) {
            this.error = lst('语法不合法')
        }
        this.forceUpdate()
    }, 700)
    formula: string;
    md: string = '';
    error: string = '';
    open(schema: TableSchema, formula: string) {
        this.schema = schema;
        this.formula = formula;
        this.result = null;
        this.error = '';
        this.forceUpdate()
    }
}
export async function useFormula(pos: PopoverPosition, options: {
    schema: TableSchema,
    formula: string
}) {
    let popover = await PopoverSingleton(FormulaSelector);
    let fv = await popover.open(pos);
    fv.open(options.schema, options.formula);
    return new Promise((resolve: (data: { formula: string, jsCode: string, exp: any }) => void, reject) => {
        fv.only('close', () => {
            popover.close();
            resolve(fv.result);
        })
        popover.only('close', () => {
            resolve(fv.result)
        })
    })
}