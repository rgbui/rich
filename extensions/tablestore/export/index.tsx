import React from "react";
import { ReactNode } from "react";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { EventsComponent } from "../../../component/lib/events.component";
import { Button } from "../../../component/view/button";
import { exportCsv } from "../../../src/import-export/csv/export";
import { PopoverSingleton } from "../../popover/popover";
import { PopoverPosition } from "../../popover/position";

class TableExportView extends EventsComponent {
    schema: TableSchema;
    open(options: { schema: TableSchema }) {
        this.schema = options.schema;
    }
    async exportCSV(button: Button) {
        button.loading = true;
        try {
            var size = 200;
            var rs: any[] = [];
            var r = await this.schema.list({ page: 1, size });
            var pages = Math.ceil(r.data.total / size);
            rs.push(...r.data.list);
            for (let i = 2; i <= pages; i++) {
                var rg = await this.schema.list({ page: i, size });
                rs.push(...rg.data.list);
            }
            await exportCsv(this.schema.fields.filter(g => g.text ? true : false).map(f => {
                return {
                    column: f.name,
                    title: f.text
                }
            }), rs, this.schema.text + '.csv');
        }
        catch (ex) {

        }
        finally {
            button.loading = false;
        }
    }
    render(): ReactNode {
        return <div className="shy-data-grid-export-box">
            <Button onClick={(e, b) => this.exportCSV(b)}>导出CSV</Button>
        </div>
    }
}


export async function useTableExport(pos: PopoverPosition,
    option: {
        schema: TableSchema
    }) {
    let popover = await PopoverSingleton(TableExportView, { mask: true });
    let fv = await popover.open(pos);
    fv.open(option);
    return new Promise((resolve: (r: any) => void, reject) => {
        fv.only('save', () => {
            popover.close();
            resolve(true);
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