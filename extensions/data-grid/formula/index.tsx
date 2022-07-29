import React from "react";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { getTypeSvg } from "../../../blocks/data-grid/schema/util";
import { EventsComponent } from "../../../component/lib/events.component";
import { Icon } from "../../../component/view/icon";
import { Textarea } from "../../../component/view/input/textarea";
import { PopoverSingleton } from "../../popover/popover";
import { PopoverPosition } from "../../popover/position";
import { formulaLangs } from "./data";
import "./style.less";

class FormulaSelector extends EventsComponent {
    schema: TableSchema;
    openData(f) { }
    render(): React.ReactNode {
        return <div className="shy-formula-selector">
            <div><Textarea value={this.formula} onChange={e => this.formula = e} onEnter={e => this.onSave(e)}></Textarea></div>
            <div className="flex-full min-h-200 max-h-300">
                <div className="pad-10 overflow-y">
                    <div className="gap-p-10">
                        <div className="text-1 font-14">字段</div>
                        {this.schema.userFields.map(f => {
                            return <a key={f.id} className="item-hover cursor flex h-24"><span className="inline-block size-24"><Icon icon={getTypeSvg(f.type)}></Icon></span><span className="f-14 inline-block gap-l-10">{f.text}</span></a>
                        })}
                    </div>
                    {formulaLangs.map(fl => {
                        return <div className="gap-p-10" key={fl.text}>
                            <div className="text-1 font-14">{fl.text}</div>
                            {fl.childs.map(f => {
                                return <a onMouseDown={e => this.openData(f)} key={f.name} className="item-hover cursor flex h-24"><span className="f-14 inline-block gap-l-10">{f.text}</span></a>
                            })}
                        </div>
                    })}
                </div>
                <div className="pad-10 overflow-y">

                </div>
            </div>

        </div>
    }
    onSave(e) {
        this.formula = e;
        this.forceUpdate();
        this.emit('save', this.formula);
    }
    formula: string;
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