import React from "react";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { GetFieldTypeSvg } from "../../../blocks/data-grid/schema/util";
import { EventsComponent } from "../../../component/lib/events.component";
import { ChevronRightSvg, TypesNumberSvg } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
import { Textarea } from "../../../component/view/input/textarea";
import { Markdown } from "../../../component/view/markdown";
import { Express } from "../../../src/express";
import { util } from "../../../util/util";
import { PopoverSingleton } from "../../popover/popover";
import { PopoverPosition } from "../../popover/position";
import { constLangs, formulaLangs, funLangs, logcLangs } from "./data";

class FormulaSelector extends EventsComponent {
    schema: TableSchema;
    cacheDatas = new Map<string, string>()
    async openData(f) {
        try {
            var url = ASSERT_URL + 'assert/data-grid/formula/docs' + f.url;
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
    }
    render(): React.ReactNode {
        return <div className="w-500">
            <div className="h-80"><Textarea value={this.formula} onChange={e => this.formula = e} onEnter={e => this.onSave(e)}></Textarea></div>
            <div className="flex-full h-300">
                <div className="overflow-y w-150 bg-light  padding-b-100 flex-fixed">
                    <div className="gap-h-10">
                        <div className="remark font-12 padding-l-10">属性</div>
                        {this.schema && this.schema.userFields.map(f => {
                            return <div key={f.id} className="padding-w-10 item-hover round cursor flex h-30">
                                <span className="flex-center size-24 flex-fixed"><Icon size={16} icon={GetFieldTypeSvg(f.type)}></Icon></span>
                                <span className="f-14 inline-block text-overflow flex-auto">{f.text}</span>
                            </div>
                        })}
                    </div>
                    <div className="gap-h-10">
                        <div className="remark font-12 padding-l-10">常量</div>
                        {constLangs.map((fl, k) => {
                            return <div onClick={e => this.openData(fl)} key={k} className="padding-w-10 item-hover round cursor flex h-30">
                                <span className="flex-fixed flex-center size-24"><Icon size={16} icon={TypesNumberSvg}></Icon></span>
                                <span className="flex-auto text-overflow">{fl.text}</span>
                            </div>
                        })}
                    </div>
                    <div className="gap-h-10">
                        <div className="remark font-12 padding-l-10">运算符</div>
                        {logcLangs.map((fl, k) => {
                            return <div key={k}
                                onClick={e => this.openData(fl)}
                                className="padding-w-10 item-hover round cursor flex h-30">
                                <span className="gap-l-10 flex-auto text-overflow">{fl.text}</span>
                            </div>
                        })}
                    </div>
                    <div className="gap-h-10">
                        <div className="remark font-12 padding-l-10">函数</div>
                        {funLangs.map((fl, k) => {
                            return <div key={k}
                                onClick={e => this.openData(fl)}
                                className="padding-w-10 item-hover round cursor flex h-30">
                                <span className="flex-fixed flex-center size-24"><Icon size={16} icon={TypesNumberSvg}></Icon></span>
                                <span className="flex-auto text-overflow">{fl.text}</span>
                            </div>
                        })}
                    </div>
                    <div className="gap-h-10">
                        <div className="remark font-12 padding-l-10">类型</div>
                        {formulaLangs.map((fl, k) => {
                            return <div className="gap-h-10" key={k}>
                                <div onClick={e => { fl.spread = fl.spread ? false : true; this.forceUpdate() }}
                                    className="flex text-1 font-14 padding-l-10">
                                    <span className="flex-fixed size-24 item-hover flex-center round cursor" style={{ transform: fl.spread ? 'rotateZ(90deg)' : 'rotateZ(0deg)' }}><Icon size={16} icon={ChevronRightSvg}></Icon></span>
                                    <span className="flex-fixed flex-center size-24"><Icon size={16} icon={GetFieldTypeSvg(fl.types[0])}></Icon></span>
                                    <span className="flex-auto text-overflow">{fl.text}</span>
                                </div>
                                {fl.spread && <div>{fl.childs.map((f, g) => {
                                    return <div
                                        onClick={e => this.openData(f)}
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
        </div>
    }
    onSave(e) {
        this.error = '';
        this.forceUpdate()
        this.formula = e;
        var exp = new Express(this.schema.fields.map(f => {
            return {
                name: '@' + f.text,
                type: f.type as any,
                template: f.name
            }
        }));
        exp.parse(this.formula);
        exp.check();
        var jsCode = exp.compile();
        if (exp.checkOk) {
            this.emit('save', { formula: this.formula, jx: null, jsCode, exp: exp.exp.get() });
        }
        else {
            var logs = exp.getLogs();
            this.error = logs.findAll(g => g.type == 'error').map(c => c.message).join(" ");
            this.forceUpdate()
        }
    }
    formula: string;
    md: string = '';
    error: string = '';
    open(schema: TableSchema, formula: string) {
        this.schema = schema;
        this.formula = formula;
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
        fv.only('save', (data: { formula: string, jsCode: string, exp: any }) => {
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