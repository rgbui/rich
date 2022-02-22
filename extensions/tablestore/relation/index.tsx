import React from "react";
import { Field } from "../../../blocks/data-grid/schema/field";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { EventsComponent } from "../../../component/lib/events.component";
import { channel } from "../../../net/channel";
import { Page } from "../../../src/page";
import { PageDirective } from "../../../src/page/directive";
import { PopoverSingleton } from "../../popover/popover";
import { PopoverPosition } from "../../popover/position";
import { createFormPage } from "./page";
class RelationPicker extends EventsComponent {
    render(): React.ReactNode {
        return <div className="shy-relation-picker">
            <div ref={e => this.el = e}></div>
        </div>
    }
    componentDidMount(): void {
        if (this.el && this.relationSchema) this.renderPage();
    }
    pageView: Page;
    async renderPage() {
        var self = this;
        if (!this.pageView) {
            this.pageView = await createFormPage(this.el, { schema: this.relationSchema, ids: [], isMultiple: this.isMultiple });
            this.pageView.on(PageDirective.selectRows, function (rows) {
                if (self.isMultiple == true) self.emit('change', rows);
                else { self.emit('save', rows) };
            })
        }
    }
    private el: HTMLElement;
    field: Field;
    relationDatas: any[];
    isMultiple: boolean;
    relationSchema: TableSchema;
    async open(options: {
        relationDatas: { id: string }[],
        field: Field,
        isMultiple?: boolean
    }) {
        this.field = options.field;
        this.relationDatas = options.relationDatas;
        this.isMultiple = options.isMultiple;
        var rr = await channel.get('/schema/query', { id: options.field.config.relationTableId as string });
        if (rr.ok) {
            this.relationSchema = this.relationSchema;
        }
        this.forceUpdate(() => {
            if (this.el && this.relationSchema) this.renderPage();
        });
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
        relationDatas: { id: string }[],
        field: Field,
        isMultiple?: boolean,
        change?: (rows: any[]) => void
    }) {
    let popover = await PopoverSingleton(RelationPicker, { mask: true });
    let fv = await popover.open(pos);
    await fv.open(options);
    return new Promise((resolve: (data: string) => void, reject) => {
        fv.only('save', (data: string) => {
            popover.close();
            resolve(data);
        });
        fv.only('close', () => {
            popover.close();
            resolve(null);
        });
        fv.only('change', (rows) => {
            options.change(rows);
        })
        popover.only('close', () => {
            resolve(null)
        })
    })
}