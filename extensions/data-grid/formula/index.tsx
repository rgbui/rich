import React from "react";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { EventsComponent } from "../../../component/lib/events.component";
import { Textarea } from "../../../component/view/input/textarea";
import { PopoverSingleton } from "../../popover/popover";
import { PopoverPosition } from "../../popover/position";
import "./style.less";

class FormulaSelector extends EventsComponent {
    schema: TableSchema;
    render(): React.ReactNode {
        return <div className="shy-formula-selector">
            <Textarea value={this.formula} onChange={e => this.formula = e} onEnter={e => this.onSave(e)}></Textarea>
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