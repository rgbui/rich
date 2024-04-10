import lodash from "lodash";
import React from "react";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { FieldType } from "../../../blocks/data-grid/schema/type";
import { GetFieldTypeSvg } from "../../../blocks/data-grid/schema/util";
import { EventsComponent } from "../../../component/lib/events.component";
import { ChevronRightSvg, FxSvg, TriangleSvg, TypesNumberSvg } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
import { Textarea } from "../../../component/view/input/textarea";
import { Markdown } from "../../../component/view/markdown";
import { Express } from "./express";
import { util } from "../../../util/util";
import { PopoverSingleton } from "../../../component/popover/popover";
import { PopoverPosition } from "../../../component/popover/position";
import { constLangs, GetFormulaLangs, funLangs, logcLangs } from "./data";
import { Field } from "../../../blocks/data-grid/schema/field";
import { S } from "../../../i18n/view";
import { lst } from "../../../i18n/store";
import { HelpText } from "../../../component/view/text";
import { Button } from "../../../component/view/button";

class FormulaSelector extends EventsComponent {
    schema: TableSchema;
    cacheDatas = new Map<string, string>()
    openData = lodash.debounce(async (f) => {
        try {
            var url = STATIC_URL + 'static/data-grid/formula/docs' + (window.shyConfig?.isUS ? "/us" : "/en") + f.url;
            if (this.mdUrl == url) {
                if (f.hash && this.mdEl) {
                    var a = this.mdEl.querySelector('#' + f.hash);
                    if (a) {
                        a.scrollIntoView(true);
                    }
                }
                return
            }
            var d = this.cacheDatas.get(url);
            if (!d) {
                d = await util.getText(url);
                this.cacheDatas.set(url, d);
            }
            this.md = d;
            this.mdUrl = url;
            this.forceUpdate(async () => {
                await util.delay(100);
                if (f.hash && this.mdEl) {
                    var a = this.mdEl.querySelector('#' + f.hash);
                    if (a) {
                        a.scrollIntoView(true);
                    }
                }
            })
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
            else if ([
                FieldType.date,
                FieldType.createDate,
                FieldType.modifyDate
            ].includes(f.type)) {
                type = 'date';
            }
            else if ([FieldType.id].includes(f.type)) {
                type = 'id'
            }
            else if ([FieldType.comment, FieldType.browse, FieldType.vote, FieldType.like, FieldType.emoji].includes(f.type)) {
                type = 'interaction'
            }
            else if ([FieldType.file, FieldType.image, FieldType.video, FieldType.audio].includes(f.type)) {
                type = 'file'
            }
            else if ([FieldType.user, FieldType.modifyer, FieldType.creater].includes(f.type)) {
                type = 'user'
            }
            else if ([FieldType.bool].includes(f.type)) {
                type = 'bool'
            }
            var url = STATIC_URL + 'static/data-grid/formula/docs' + ((window.shyConfig?.isUS ? "/us" : "/en")) + '/example/' + type + ".md";
            var d = this.cacheDatas.get(url);
            if (!d) {
                d = await util.getText(url);
                this.cacheDatas.set(url, d);
            }
            d = d.replace(/\{name\}/g, f.text);
            this.md = d;
            this.mdUrl = '';
            this.forceUpdate()
        }
        catch (ex) {
            console.error(ex);
        }
    })
    textarea: Textarea = null
    formulaLangs: ({
        text: any;
        type: FieldType,
        spread: boolean;
        childs: any[];
    }[]) = [];
    render() {
        return <div className="w-700">
            <div className="h-80"><Textarea textInputStyle={{ borderRadius: '4px 4px 0px 0px' }} ref={e => this.textarea = e} value={this.formula} onChange={e => this.onInput(e)} ></Textarea></div>
            {this.error && <div className="error min-h-30 padding-w-14">{this.error}</div>}
            <div className="flex-full h-300">
                <div className="overflow-y w-150 bg-light  padding-b-100 flex-fixed">
                    <div className="gap-h-10">
                        <div onMouseDown={e => { this.fieldSpread = !this.fieldSpread; this.forceUpdate() }}
                            className="gap-t-5 cursor  font-12 padding-l-5 flex">
                            <span className={" flex-fixed item-hover round text-1 size-16 flex-center ts " + (this.fieldSpread ? "angle-180 " : "angle-90 ")}><Icon size={8} icon={TriangleSvg}></Icon></span><S>字段</S>
                        </div>
                        {this.schema && this.fieldSpread && this.getFields().map(f => {
                            return <div
                                onMouseEnter={e => {
                                    this.openTypeData(f);
                                }}
                                onMouseDown={e => {
                                    this.formula += f.text;
                                    this.textarea.updateValue(this.formula);
                                }}
                                key={f.id}
                                className="gap-w-5 padding-w-5 item-hover round cursor flex h-30">
                                <span className="flex-center size-24 flex-fixed "><Icon size={14} icon={GetFieldTypeSvg(f.type)}></Icon></span>
                                <span className="f-14 inline-block text-overflow flex-auto">{f.text}</span>
                            </div>
                        })}
                    </div>
                    <div className="gap-h-10">
                        <div className="gap-t-5  font-12 padding-l-5 flex cursor " onMouseDown={e => { this.constSpread = !this.constSpread; this.forceUpdate() }}>  <span className={" flex-fixed item-hover round text-1 size-16 flex-center ts " + (this.constSpread ? "angle-180 " : "angle-90 ")}><Icon size={8} icon={TriangleSvg}></Icon></span><span><S>常量</S></span>
                        </div>
                        {this.constSpread && constLangs.map((fl, k) => {
                            return <div onMouseEnter={e => this.openData(fl)}
                                onMouseDown={e => {
                                    this.formula += fl.text;
                                    this.textarea.updateValue(this.formula);
                                }}
                                key={k} className="gap-w-5 padding-w-5 item-hover round cursor flex h-30">
                                <span className="flex-fixed flex-center size-24"><Icon size={14} icon={TypesNumberSvg}></Icon></span>
                                <span className="flex-auto text-overflow">{fl.text}</span>
                            </div>
                        })}
                    </div>
                    <div className="gap-h-10">
                        <div className="gap-t-5  font-12 padding-l-5 flex cursor " onMouseDown={e => { this.logicSpread = !this.logicSpread; this.forceUpdate() }}>  <span className={" flex-fixed item-hover round text-1 size-16 flex-center ts " + (this.logicSpread ? "angle-180 " : "angle-90 ")}><Icon size={8} icon={TriangleSvg}></Icon></span><S>运算符</S>
                        </div>
                        {this.logicSpread && logcLangs.map((fl, k) => {
                            return <div key={k}
                                onMouseEnter={e => this.openData(fl)}
                                onMouseDown={e => {
                                    this.formula += fl.text;
                                    this.textarea.updateValue(this.formula);
                                }}
                                className="gap-w-5 padding-w-5 item-hover round cursor flex h-30">
                                <span className="gap-l-10 flex-auto text-overflow">{fl.text}</span>
                            </div>
                        })}
                    </div>
                    <div className="gap-h-10">
                        <div className="gap-t-5  font-12 padding-l-5 flex cursor " onMouseDown={e => { this.fxSpread = !this.fxSpread; this.forceUpdate() }}>  <span className={" flex-fixed item-hover round text-1 size-16 flex-center ts " + (this.fxSpread ? "angle-180 " : "angle-90 ")}><Icon size={8} icon={TriangleSvg}></Icon></span><S>函数</S>
                        </div>
                        {this.fxSpread && funLangs.map((fl, k) => {
                            return <div key={k}
                                onMouseEnter={e => this.openData(fl)}
                                onMouseDown={e => {
                                    this.formula += fl.text;
                                    this.textarea.updateValue(this.formula);
                                }}
                                className="gap-w-5 padding-w-5 item-hover round cursor flex h-30">
                                <span className="flex-fixed flex-center size-24"><Icon size={18} icon={FxSvg}></Icon></span>
                                <span className="flex-auto text-overflow">{fl.text}</span>
                            </div>
                        })}
                    </div>
                    <div className="gap-h-10">
                        <div className="gap-t-5 font-12 padding-l-5 flex cursor " onMouseDown={e => { this.typeSpread = !this.typeSpread; this.forceUpdate() }}>  <span className={" flex-fixed item-hover round text-1 size-16 flex-center ts " + (this.typeSpread ? "angle-180 " : "angle-90 ")}><Icon size={8} icon={TriangleSvg}></Icon></span><S>类型</S>
                        </div>
                        {this.typeSpread && this.formulaLangs.map((fl, k) => {
                            return <div className="gap-h-10" key={k}>
                                <div onClick={e => { fl.spread = fl.spread ? false : true; this.forceUpdate() }}
                                    className="flex font-14 padding-l-10">
                                    <span className="flex-fixed size-20 item-hover flex-center round cursor ts" style={{ transform: fl.spread ? 'rotateZ(90deg)' : 'rotateZ(0deg)' }}><Icon size={16} icon={ChevronRightSvg}></Icon></span>
                                    <span className="flex-fixed flex-center size-24"><Icon size={16} icon={GetFieldTypeSvg(fl.type)}></Icon></span>
                                    <span className="flex-auto text-overflow f-14">{fl.text}</span>
                                </div>
                                {fl.spread && <div>{fl.childs.map((f, g) => {
                                    return <div
                                        onMouseEnter={e => this.openData(f)}
                                        key={g}
                                        className="gap-w-5 padding-r-5 padding-l-30 item-hover round cursor flex h-30"><span className="f-14 inline-block gap-l-10">{f.text || f.name}</span></div>
                                })}</div>}
                            </div>
                        })}
                    </div>
                </div>
                <div ref={e => this.mdEl = e} className="padding-10 overflow-y flex-auto md" style={{ paddingBottom: 50 }}>
                    {this.md && <Markdown html={true} md={this.md}></Markdown>}
                </div>
            </div>
            <div className="flex h-40 padding-w-10 border-top">
                <div className="flex-fixed">
                    <HelpText url={window.shyConfig?.isUS ? "https://shy.red/ws/help/page/52" : "https://shy.live/ws/help/page/1889"}><S>了解更多数据表格公式列使用方法</S></HelpText>
                </div>
                <div className="flex-auto flex-end">
                    <Button onMouseDown={e => this.onSave()}>保存</Button>
                </div>
            </div>
        </div>
    }
    getFields() {
        var fs = this.schema.visibleFields.findAll(g => ![
            FieldType.formula,
            FieldType.rollup,
            FieldType.relation
        ].includes(g.type));
        return fs;
    }
    result: { formula: string, jsCode: any, exp: any } = null;
    onInput = lodash.debounce((e) => {
        this.formula = e;
        this.onCompile();
    }, 700)
    formula: string;
    md: string = '';
    mdEl: HTMLElement = null;
    mdUrl: string = '';
    error: string = '';
    fieldSpread = true;
    constSpread = true;
    logicSpread = true;
    fxSpread = true;
    typeSpread = true;
    open(schema: TableSchema, formula: string) {
        this.schema = schema;
        this.formula = formula;
        this.result = null;
        this.error = '';
        this.forceUpdate()
    }
    onCompile() {
        this.error = '';
        this.forceUpdate()
        var args = this.getFields().map(f => {
            var type = 'string';
            if ([FieldType.date, FieldType.createDate, FieldType.modifyDate].includes(f.type)) type = 'date'
            else if ([FieldType.number, FieldType.autoIncrement, FieldType.sort].includes(f.type)) type = 'number'
            else if ([FieldType.bool].includes(f.type)) type = 'bool'
            else if ([FieldType.id]) type = 'id'
            else if ([FieldType.comment, FieldType.browse, FieldType.vote, FieldType.like, FieldType.emoji]) type = 'interaction'
            else if ([FieldType.file, FieldType.image, FieldType.video, FieldType.audio]) type = 'file'
            else if ([FieldType.user, FieldType.modifyer, FieldType.creater]) type = 'user'
            else type = 'string'
            return {
                name: f.text,
                type: type as any,
                template: f.name
            }
        });
        args.push({ name: 'current', type: 'any', template: 'current' })
        var exp = new Express(args);
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
            if (!this.formula) this.error = ''
            else this.error = lst('语法不合法')
        }
        this.forceUpdate()
    }
    onSave() {
        this.onCompile();
        if (!this.error) {
            this.emit('save')
        }
    }
    componentDidMount(): void {
        this.formulaLangs = GetFormulaLangs();
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
            resolve(undefined);
        })
        fv.only('save', () => {
            popover.close();
            if (fv.formula) resolve(fv.result);
            else resolve({
                formula: '',
                jsCode: '',
                exp: null
            })
        })
        popover.only('close', () => {
            resolve(undefined)
        })
    })
}