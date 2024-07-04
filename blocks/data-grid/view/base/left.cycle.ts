
import { TableSchema } from "../../schema/meta";
import { FieldType } from "../../schema/type";
import { DataGridView } from ".";
import { channel } from "../../../../net/channel";
import { ElementType, getElementUrl } from "../../../../net/element.type";
import lodash from "lodash";
import { BlockUrlConstant } from "../../../../src/block/constant";


export class DataGridViewLife {
    async loadSchema(this: DataGridView) {
        if (this.schemaId && !this.schema) {
            this.schema = await TableSchema.loadTableSchema(this.schemaId, this.page.ws);
            await this.schema.cacPermissions()
        }
    }
    async loadViewFields(this: DataGridView) {
        if (this.fields.length == 0) {
            this.fields = this.schema.getViewFields()
            if (this.url == BlockUrlConstant.DataGridBoard) {
                lodash.remove(this.fields, c => c.fieldId == (this as any).groupFieldId);
            }
        } else {
            if (!this.fields.every(s => s.fieldId || s.type ? true : false)) {
                this.fields = this.schema.getViewFields()
                if (this.url == BlockUrlConstant.DataGridBoard) {
                    lodash.remove(this.fields, c => c.fieldId == (this as any).groupFieldId);
                }
            }
            this.fields.each(f => {
                f.schema = this.schema;
            })
            for (let j = this.fields.length - 1; j >= 0; j--) {
                if (!(this.fields[j].field || this.fields[j].type))
                    this.fields.splice(j, 1);
            }
            lodash.remove(this.fields,
                g => [FieldType.description,
                FieldType.sort,
                FieldType.cover,
                FieldType.plain,
                FieldType.thumb,
                FieldType.deleted].includes(g.field?.type)
            )
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
            this.relationSchemas = await TableSchema.loadListSchema(tableIds, this.page);
        }
    }
    /***
     * 加载当前页面视图数据
     */
    async loadDataGridData(this: DataGridView) {
        await this.loadData();
        if (window.shyConfig?.isDev) {
            //await util.delay(10000);
        }
        await this.loadRelationDatas();
        await this.loadDataInteraction();
    }

    async loadRelationDatas(this: DataGridView, parentId?: string) {
        if (this.relationSchemas.length > 0) {
            var maps: { key: string, ids: string[] }[] = [];
            this.data.forEach(row => {
                if (parentId && row.parentId != parentId) {
                    return;
                }
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
                    var rd = await sea.all({ page: 1, filter: { id: { $in: v } } }, this.page.ws);
                    if (rd.ok) {
                        this.relationDatas.set(key, rd.data.list);
                    }
                }
            })
        }
    }
    /**
     * 仅加载表格数据，
     * 不包括关联的数据
     * 不包括交互的数据
     * @param this 
     */
    async loadData(this: DataGridView) {
        if (this.schema) {
            if (this.hasGroup) {
                var rc = await this.schema.gridList({
                    page: this.pageIndex,
                    size: this.size,
                    filter: this.getSearchFilter(),
                    sorts: this.getSearchSorts(),
                    groupView: this.groupView
                }, this.page.ws);
                if (rc.ok) {
                    this.dataGroupHeads = []
                    this.data = [];
                    rc.data.groupList.forEach(gl => {
                        this.dataGroupHeads.push({
                            id: gl.id,
                            spread: false,
                            count: gl.count,
                            total: gl.total,
                            value: gl.id,
                            text: gl.id as any
                        })
                        gl.list.forEach(g => {
                            g.__group = gl.id;
                            this.data.push(g);
                        })
                    })
                    if (this.groupView.sort == 'asc') {
                        this.dataGroupHeads.sort((a, b) => {
                            if (lodash.isNull(b.id)) return -1;
                            if (typeof (a.id as any)?.min == 'number') {
                                return (a.id as any).min > (b.id as any).min ? 1 : -1
                            }
                            return a.id > b.id ? 1 : -1
                        })
                        var nd = this.dataGroupHeads.find(g => lodash.isNull(g.id));
                        if (nd) {
                            lodash.remove(this.dataGroupHeads, c => lodash.isNull(c.id));
                            this.dataGroupHeads.splice(0, 0, nd);
                        }
                    }
                    else if (this.groupView.sort == 'desc') {
                        this.dataGroupHeads.sort((a, b) => {
                            if (lodash.isNull(a.id)) return -1;
                            if (typeof (a.id as any)?.min == 'number') {
                                return (a.id as any).min < (b.id as any).min ? 1 : -1
                            }
                            return a.id < b.id ? 1 : -1
                        })
                        var nd = this.dataGroupHeads.find(g => lodash.isNull(g.id));
                        if (nd) {
                            lodash.remove(this.dataGroupHeads, c => lodash.isNull(c.id));
                            this.dataGroupHeads.push(nd);
                        }
                    }
                }
            }
            else {
                var r = await this.schema.list({
                    page: this.pageIndex,
                    size: this.size,
                    filter: this.getSearchFilter(),
                    sorts: this.getSearchSorts()
                }, this.page.ws);
                if (r.data) {
                    this.data = Array.isArray(r.data.list) ? r.data.list : [];
                    this.total = r.data?.total || 0;
                    this.size = r.data.size;
                    this.pageIndex = r.data.page;
                }
            }
        }
    }
    async loadDataInteraction(this: DataGridView, parentId?: string) {
        if (!this.page.isSign) return;
        if (this.schema) {
            var fs = this.schema.fields.findAll(g => [FieldType.like, FieldType.oppose, FieldType.vote, FieldType.love].includes(g.type))
            if (fs.length > 0) {
                var ds = this.data.findAll(g => {
                    if (parentId && g.parentId != parentId) {
                        return false;
                    }
                    return fs.some(f => typeof g[f.name]?.count == 'number' && g[f.name]?.count > 0)
                });
                var ids = ds.map(d => d.id);
                if (ids.length > 0) {
                    var r = await channel.get('/user/interactives', {
                        schemaId: this.schema.id,
                        ids: ids,
                        ws: this.page.ws,
                        es: fs.map(f => getElementUrl(ElementType.SchemaFieldNameData, this.schema.id, f.name, ids[0]))
                    });
                    if (r.ok) {
                        if (parentId) {
                            for (let n in r.data.list) {
                                var um = this.userEmojis[n];
                                if (!um) {
                                    um = [];
                                    this.userEmojis[n] = um;
                                }
                                r.data.list[n].forEach(id => {
                                    if (!um.includes(id)) um.push(id)
                                })
                            }
                        }
                        else
                            this.userEmojis = r.data.list;
                    }
                }
            }
        }
    }
}