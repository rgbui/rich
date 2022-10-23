
import React from "react";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { GetFieldTypeSvg } from "../../../blocks/data-grid/schema/util";
import { EventsComponent } from "../../../component/lib/events.component";
import { Icon } from "../../../component/view/icon";
import { PopoverSingleton } from "../../popover/popover";
import { PopoverPosition } from "../../popover/position";
import { DataGridCards } from "./data";

export class DataGridCardSelector extends EventsComponent {
    render() {
        return <div className="data-grid-card-selector card">
            <div className="flex-full h-400 w-800">
                <div className="flex-fixed w-200 gap-p-10">
                    <div className="text-1"><span>字段</span></div>
                    <div className="pad-10">
                        {this.schema.userFields.map(f => {
                            return <a key={f.id} className="block h-24 item-hover round flex cursor"><span
                                className="inline-block size-24 flex-fixed"><Icon size={16} icon={GetFieldTypeSvg(f.type)} ></Icon></span>
                                <span className="flex-auto gap-l-10">{f.text}</span>
                            </a>
                        })}
                    </div>
                </div>
                <div className="flex-auto"></div>
                <div className="flex-fixed w-200 gap-p-10">
                    {DataGridCards.map(card => {
                        return <div key={card.text} className="card w-120 round-16 item-hover cursor gap-10">
                            <img className="round-16 object-cover w-120 h-120" />
                            <div className="flex-center h-30">{card.text}</div>
                        </div>
                    })}
                </div>
            </div>
        </div>
    }
    schema: TableSchema;
    record: Record<string, any>;
    open(options: { schema: TableSchema, record: Record<string, any> }) {

    }
}

export async function useDataGridCreate(pos: PopoverPosition, options: { schema: TableSchema, record: Record<string, any> }) {
    let popover = await PopoverSingleton(DataGridCardSelector, { mask: true });
    let fv = await popover.open(pos);
    fv.open(options);
    return new Promise((resolve: (data: {
        text: string,
        url: string
    }) => void, reject) => {
        fv.only('save', (value) => {
            popover.close();
            resolve(value);
        });
        fv.only('close', () => {
            popover.close();
            resolve(null);
        });
        popover.only('close', () => {
            resolve(null)
        });
    })
}
