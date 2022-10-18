
import { PageLayoutType } from "../../../../src/page/declare";
import { TableSchema } from "../../schema/meta";
import { FieldType } from "../../schema/type";
import { ViewField } from "../../schema/view";
import { DataGridView } from ".";

export class DataGridViewLife {
    async loadSchema(this: DataGridView) {
        if (this.schemaId && !this.schema) {
            this.schema = await TableSchema.loadTableSchema(this.schemaId);
        }
    }
    async loadViewFields(this: DataGridView) {
        if (this.fields.length == 0) {
            this.fields = this.schema.getViewFields()
        } else {
            if (!this.fields.every(s => s.fieldId || s.type ? true : false)) {
                this.fields = this.schema.getViewFields()
            }
            this.fields.each(f => {
                f.schema = this.schema;
            })
        }
        if (this.page.pageLayout.type == PageLayoutType.dbPickRecord) {
            if (!this.fields.some(s => s.type == 'check')) {
                this.fields.insertAt(0, new ViewField({ type: 'check', text: '选择' }, this.schema))
            }
        }
    }
    async loadRelationSchemas(this: DataGridView) {
        var tableIds: string[] = [];
        this.fields.each(f => {
            if (f.field?.type == FieldType.relation) {
                if (f.field.config.relationTableId) {
                    tableIds.push(f.field.config.relationTableId);
                }
            }
        });
        if (tableIds.length > 0) {
            this.relationSchemas = await TableSchema.loadListSchema(tableIds);
        }
    }
    async loadRelationDatas(this: DataGridView,) {
        if (this.relationSchemas.length > 0) {
            var maps: { key: string, ids: string[] }[] = [];
            this.data.forEach(row => {
                this.fields.each(f => {
                    if (f?.field?.type == FieldType.relation) {
                        var vs = row[f?.field.name];
                        if (!Array.isArray(vs)) vs = [];
                        var ms = maps.find(g => g.key == f?.field.config.relationTableId);
                        if (Array.isArray(ms?.ids)) {
                            vs.each(v => {
                                if (!ms?.ids.includes(v)) ms?.ids.push(v)
                            })
                        }
                        else {
                            maps.push({ key: f?.field.config.relationTableId, ids: vs })
                        }
                    }
                })
            });
            await maps.eachAsync(async (vr) => {
                var key = vr.key;
                var v = vr.ids;
                var sea = this.relationSchemas.find(g => g.id == key);
                if (sea) {
                    var rd = await sea.all({ page: 1, filter: { id: { $in: v } } });
                    if (rd.ok) {
                        this.relationDatas.set(key, rd.data.list);
                    }
                }
            })
        }
    }
    async loadData(this: DataGridView,) {
        if (this.schema) {
            var r = await this.schema.list({ page: this.index, size: this.size });
            if (r.data) {
                this.data = Array.isArray(r.data.list) ? r.data.list : [];
                this.total = r.data?.total || 0;
                this.isLoadData = true;
            }
        }
    }
    
}