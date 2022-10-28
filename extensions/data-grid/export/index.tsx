
import React from "react";
import { ReactNode } from "react";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { EventsComponent } from "../../../component/lib/events.component";
import { exportCsv } from "../../../src/import-export/csv/export";
import { exportExcel } from "../../../src/import-export/excel";
import { util } from "../../../util/util";
import { PopoverSingleton } from "../../popover/popover";
import { PopoverPosition } from "../../popover/position";

class TableExportView extends EventsComponent {
    schema: TableSchema;
    open(options: { schema: TableSchema }) {
        this.schema = options.schema;
        this.exporting = false;
        this.forceUpdate()
    }
    total: number = 0;
    page: number = 1;
    size: number = 200;
    exporting: boolean = false;
    exportTip: string = '';
    exportError: string = '';
    async exportCSV(event: React.MouseEvent) {
        this.exporting = true;
        this.exportTip = '';
        this.exportError = '';
        try {
            var rs: any[] = [];
            var r = await this.schema.list({ page: 1, size: this.size });
            this.total = r.data.total;
            var pages = Math.ceil(r.data.total / this.size);
            rs.push(...r.data.list);
            for (let i = 2; i <= pages; i++) {
                var rg = await this.schema.list({ page: i, size: this.size });
                this.page = i;
                this.forceUpdate()
                rs.push(...rg.data.list);
            }
            this.exportTip = '生成csv中';
            this.forceUpdate();
            await util.delay(100);
            exportCsv(this.schema.fields.filter(g => g.text ? true : false).map(f => {
                return {
                    column: f.name,
                    title: f.text
                }
            }), rs, this.schema.text + '.csv');
            this.exportTip = '生成csv成功';
            this.forceUpdate();
            this.exporting = false;
        }
        catch (ex) {
            this.exportError = '导出出错';
            this.exporting = false;
            this.exportTip = '';
        }
    }
    async exportExcel(e: React.MouseEvent) {
        this.exporting = true;
        this.exportTip = '';
        this.exportError = '';
        try {
            var rs: any[] = [];
            var r = await this.schema.list({ page: 1, size: this.size });
            this.total = r.data.total;
            var pages = Math.ceil(r.data.total / this.size);
            rs.push(...r.data.list);
            for (let i = 2; i <= pages; i++) {
                var rg = await this.schema.list({ page: i, size: this.size });
                this.page = i;
                this.forceUpdate()
                rs.push(...rg.data.list);
            }
            this.exportTip = '生成csv中';
            this.forceUpdate();
            await util.delay(100);
            await exportExcel(this.schema.fields.filter(g => g.text ? true : false).map(f => {
                return {
                    column: f.name,
                    title: f.text
                }
            }), rs, this.schema.text);
            this.exportTip = '生成csv成功';
            this.forceUpdate();
            this.exporting = false;
        }
        catch (ex) {
            this.exportError = '导出出错';
            this.exporting = false;
            this.exportTip = '';
        }
    }
    render(): ReactNode {
        return <div className="shy-data-grid-export-box">
            {!this.exporting && <div className="flex">
                <div onClick={(e) => { this.exportCSV(e) }}>
                    <span>导出CSV</span>
                </div>
                <div onClick={(e) => { this.exportExcel(e) }}>
                    <span>导出Excel</span>
                </div>
            </div>}
            {this.exporting && <div className="padding-10">
                <div className="flex">
                    <div className="flex-auto border h-20">
                        <div className="h-20 bg-primary" style={{ width: ((this.page / (Math.ceil(this.total / this.size))) * 100) + '%' }}></div>
                    </div>
                    <div className="flex-fixed">
                        <span>{this.page * this.size}/{this.total}</span>
                    </div>
                </div>
                {this.exportTip && <div>{this.exportTip}</div>}

            </div>}


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