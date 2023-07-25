
import dayjs from "dayjs";
import lodash from "lodash";
import React from "react";
import { ReactNode } from "react";
import { Field } from "../../../blocks/data-grid/schema/field";
import { FieldType } from "../../../blocks/data-grid/schema/type";
import { DataGridView } from "../../../blocks/data-grid/view/base";
import { EventsComponent } from "../../../component/lib/events.component";
import { Button } from "../../../component/view/button";
import { SelectBox } from "../../../component/view/select/box";
import { Spin } from "../../../component/view/spin";
import { channel } from "../../../net/channel";
import { exportCsv } from "../../../src/import-export/csv/export";
import { exportExcel } from "../../../src/import-export/excel/export";
import { exportHtmlDb } from "../../../src/import-export/html/db.export";
import { exportMarkdownDb } from "../../../src/import-export/markdown/db.export";
import { util } from "../../../util/util";
import { PopoverSingleton } from "../../popover/popover";
import { PopoverPosition } from "../../popover/position";

class TableExportView extends EventsComponent {
    get schema() {
        return this.dataGridView.schema;
    }
    dataGridView: DataGridView
    open(dataGridView: DataGridView) {
        this.dataGridView = dataGridView;
        this.exporting = false;
        this.forceUpdate()
    }
    total: number = 0;
    page: number = 1;
    size: number = 2;
    list: any[] = [];
    exporting: boolean = false;
    exportTip: string = '';
    exportError: string = '';
    config: { datasource: 'currentView' | 'datasource', format: 'csv' | 'excel' | 'markdown' | 'html', content: 'all' | 'no-file' } = { content: 'all', datasource: 'currentView', format: 'csv' }
    private async handleList(list: any[], fields: Field[]) {
        var gs: any[] = []; var ufs = fields.findAll(g => g.type == FieldType.user || g.type == FieldType.creater || g.type == FieldType.modifyer)
        var ops = fields.findAll(g => g.type == FieldType.option || g.type == FieldType.options);

        var ins = fields.findAll(g => [
            FieldType.oppose,
            FieldType.like,
            FieldType.vote,
            FieldType.love
        ].includes(g.type));
        var bs = fields.findAll(g => [FieldType.blog].includes(g.type));

        var uids: string[] = list.map(l => {
            return ufs.map(uf => {
                return l[uf.name]
            })
        }).flat(3);
        uids = lodash.uniq(uids);

        var us = await channel.get('/users/basic', { ids: uids });

        for (let i = 0; i < list.length; i++) {
            var row = list[i];
            ufs.forEach(uf => {
                if (row[uf.name]) {
                    if (Array.isArray(row[uf.name])) {
                        row[uf.name] = row[uf.name].map(g => {
                            return us.data.list.find(c => c.id == g)?.name
                        }).join(",")
                    }
                    else row[uf.name] = us.data.list.find(c => c.id == row[uf.name])?.name
                }
            });
            ops.forEach(op => {
                row[op.name] = op.config.options.find(c => c.value == row[op.name])?.text;
            });
            ins.forEach(ig => {
                if (row[ig.name])
                    row[ig.name] = row[ig.name].count;
            })
            bs.forEach(ig => {
                if (row[ig.name])
                    row[ig.name] = row[ig.name].text;
            })
            gs.push(row)
        }

        gs.forEach(element => {
            fields.forEach(f => {
                var cellValue = element[f.name];
                if (cellValue instanceof Date) cellValue = dayjs(cellValue).format('YYYY-MM-DD HH:mm:ss')
                else if (lodash.isNull(cellValue)) cellValue = ''
                else if (lodash.isObject(cellValue)) cellValue = JSON.stringify(cellValue)
                if (typeof cellValue == 'undefined') cellValue = '';
                element[f.name] = cellValue;
            })
        });
        return gs;
    }
    async loadData() {
        var rs: any[] = [];
        var r = await this.schema.list({ page: 1, size: this.size }, this.dataGridView.page);
        this.total = r.data.total;
        var pages = Math.ceil(r.data.total / this.size);
        rs.push(... await (this.handleList(r.data.list, this.getFields())));
        for (let i = 2; i <= pages; i++) {
            var rg = await this.schema.list({ page: i, size: this.size }, this.dataGridView.page);
            this.page = i;
            await util.delay(10);
            this.forceUpdate();
            var list = rg.data.list;
            rs.push(...(await this.handleList(list, this.getFields())))
        }
        this.list = rs;
    }
    async onExport() {
        this.exporting = true;
        this.exportTip = '导出' + this.config.format;
        this.exportError = '';
        this.forceUpdate();
        try {
            await this.loadData();
            if (this.config.format == 'csv') await this.exportCSV()
            else if (this.config.format == 'excel') await this.exportExcel()
            else if (this.config.format == 'markdown') await this.exportMarkdown()
            else if (this.config.format == 'html') await this.exportHtml()
            this.exporting = false;
            this.forceUpdate();
        }
        catch (ex) {
            console.error(ex);
            this.exportError = '导出出错';
            this.exporting = false;
            this.exportTip = '';
        }
    }
    async onCancel() {
        this.emit('close');
    }
    getFields() {
        var fs = this.config.datasource == 'currentView' ? this.dataGridView.fields.toArray(f => f.field) : this.schema.visibleFields;
        if (this.config.content == 'no-file') {
            fs = fs.findAll(g => ![FieldType.image, FieldType.video, FieldType.audio, FieldType.file].includes(g.type));
        }
        fs.removeAll(c => c.type == FieldType.formula);
        return fs;
    }
    async exportMarkdown() {
        var fs = this.getFields()
        exportMarkdownDb(fs.map(f => {
            return {
                column: f.name,
                title: f.text
            }
        }), this.list, this.schema.text);
        this.exportTip = '生成markdown成功';
        this.forceUpdate();
    }
    async exportHtml() {
        var fs = this.getFields()
        exportHtmlDb(fs.map(f => {
            return {
                column: f.name,
                title: f.text
            }
        }), this.list, this.schema.text);
        this.exportTip = '生成html成功';
        this.forceUpdate();
    }
    async exportCSV() {
        var fs = this.getFields()
        exportCsv(fs.map(f => {
            return {
                column: f.name,
                title: f.text
            }
        }), this.list, this.schema.text);
        this.exportTip = '生成csv成功';
        this.forceUpdate();
    }
    async exportExcel() {
        var fs = this.getFields()
        await exportExcel(fs.map(f => {
            return {
                column: f.name,
                title: f.text
            }
        }), this.list, this.schema.text);
        this.exportTip = '生成excel成功';
        this.forceUpdate();
    }
    render(): ReactNode {
        return <div className="flex-center  min-h-100 min-w-120">
            {
                !this.exporting && <div className="padding-14 min-w-200">
                    <div className="flex gap-h-10">
                        <label className="flex-auto">格式</label><div className="flex-fixed"><SelectBox
                            value={this.config.format}
                            onChange={e => { this.config.format = e; this.forceUpdate() }}
                            options={[{ text: 'CSV', value: 'csv' }, { text: 'Excel', value: 'excel' }, { text: 'Markdown', value: 'markdown' }, { text: 'Html', value: 'html' }]}
                        ></SelectBox></div>
                    </div>
                    <div className="flex gap-h-10">
                        <label className="flex-auto">数据</label>
                        <div className="flex-fixed">
                            <SelectBox value={this.config.datasource} onChange={e => { this.config.datasource = e; this.forceUpdate() }} options={[{ text: '当前视图', value: 'currentView' }, { text: '所有数据', value: 'database' }]}></SelectBox>
                        </div>
                    </div>
                    <div className="flex gap-h-10">
                        <label className="flex-auto">内容</label><div className="flex-fixed"><SelectBox value={this.config.content} onChange={e => { this.config.content = e; this.forceUpdate() }} options={[{ text: '所有', value: 'all' }, { text: '无文件或图片', value: 'no-file' }]}></SelectBox></div>
                    </div>
                    <div className="flex-end gap-h-10 gap-t-20">
                        <Button ghost className="gap-r-10" onClick={e => this.onCancel()}>取消</Button> <Button onClick={e => this.onExport()}>导出</Button>
                    </div>

                </div>
            }
            {
                this.exporting && <div className="padding-14 min-w-250">
                    <div className="flex gap-h-5">共{this.total}条</div>
                    <div className="flex">
                        <div className="flex-fixed gap-r-5"><Spin size={16}></Spin></div>
                        <div className="flex-auto border h-10 round">
                            <div className="h-10 bg-primary round" style={{ width: ((this.page / (Math.ceil(this.total / this.size))) * 100) + '%' }}></div>
                        </div>
                        <div className="flex-fixed gap-l-10">
                            <span>{Math.min(this.page * this.size, this.total)}/{this.total}</span>
                        </div>
                    </div>
                    {this.exportTip && <div>{this.exportTip}</div>}

                </div>
            }


        </div >
    }
}


export async function useTableExport(
    dataGridView: DataGridView) {
    let popover = await PopoverSingleton(TableExportView, { mask: true, shadow: true });
    let fv = await popover.open({ center: true, centerTop: 100 });
    fv.open(dataGridView);
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