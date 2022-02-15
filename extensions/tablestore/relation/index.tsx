import React from "react";
import { Field } from "../../../blocks/data-grid/schema/field";
import { EventsComponent } from "../../../component/lib/events.component";
import { PopoverSingleton } from "../../popover/popover";
import { PopoverPosition } from "../../popover/position";

class RelationPicker extends EventsComponent {
    render(): React.ReactNode {
        return <div className="shy-relation-picker"></div>
    }
    onSave(e) { }
    field: Field;
    relationDatas: any[]
    open(field: Field, relationDatas: any[]) {
        this.field = field;
        this.relationDatas = relationDatas;
        this.forceUpdate();
    }
}
/**
 * 挑选关联的数据
 * @param pos 
 * @param options 
 * @returns 
 */
export async function useRelationPickData(pos: PopoverPosition,
    options: {
        relationDatas: { id: string }[]
        field: Field
    }) {
    let popover = await PopoverSingleton(RelationPicker);
    let fv = await popover.open(pos);
    fv.open(options.field, options.relationDatas);
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