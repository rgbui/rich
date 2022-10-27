import React from "react";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { GetFieldTypeSvg } from "../../../blocks/data-grid/schema/util";
import { EventsComponent } from "../../../component/lib/events.component";
import { Icon } from "../../../component/view/icon";
import { Textarea } from "../../../component/view/input/textarea";
import { Markdown } from "../../../component/view/markdown";
import { Express } from "../../../src/express";
import { util } from "../../../util/util";
import { PopoverSingleton } from "../../popover/popover";
import { PopoverPosition } from "../../popover/position";
import { formulaLangs } from "./data";
import "./style.less";

class FormulaSelector extends EventsComponent {
    schema: TableSchema;
    cacheDatas = new Map<string, string>()
    async openData(f) {
        var url = ASSERT_URL + '/assert/data-grid/formula/docs' + f.url;
        var d = this.cacheDatas.get(url);
        if (!d) {
            d = await util.getText(url);
            this.cacheDatas.set(url, d);
        }
        this.md = d;
        this.forceUpdate()
    }
    render(): React.ReactNode {
        return <div className="shy-formula-selector">
            <div><Textarea value={this.formula} onChange={e => this.formula = e} onEnter={e => this.onSave(e)}></Textarea></div>
            <div className="flex-full min-h-200 max-h-300">
                <div className="padding-10 overflow-y">
                    <div className="gap-p-10">
                        <div className="text-1 font-14">字段</div>
                        {this.schema.userFields.map(f => {
                            return <a key={f.id} className="item-hover cursor flex h-24"><span className="inline-block size-24"><Icon icon={GetFieldTypeSvg(f.type)}></Icon></span><span className="f-14 inline-block gap-l-10">{f.text}</span></a>
                        })}
                    </div>
                    <div className="gap-p-10">
                        <div className="text-1 font-14">函数</div>
                        {formulaLangs.map((fl, k) => {
                            return <div className="gap-p-10" key={k}>
                                <div className="text-1 font-14">{fl.text}</div>
                                {fl.childs.map((f, g) => {
                                    return <a
                                        onMouseDown={e => this.openData(f)}
                                        key={g}
                                        className="item-hover cursor flex h-24"><span className="f-14 inline-block gap-l-10">{f.text}</span></a>
                                })}
                            </div>
                        })}
                    </div>
                </div>
                <div className="padding-10 overflow-y">
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
                name: f.text,
                type: f.type as any,
                template: f.name
            }
        }));
        exp.parse(this.formula);
        exp.check();
        var jsCode = exp.compile();
        if (exp.checkOk) {
            this.emit('save', { formula: this.formula, jsCode, exp: exp.exp.get() });
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
    }
}
export async function useFormula(pos: PopoverPosition, options: {
    schema: TableSchema,
    formula: string
}) {
    let popover = await PopoverSingleton(FormulaSelector);
    let fv = await popover.open(pos);
    fv.open(options.schema, options.formula);
    return new Promise((resolve: (data: string) => void, reject) => {
        fv.only('save', (data: string) => {
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