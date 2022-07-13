
import { Confirm } from "../../../../component/lib/confirm";
import { useTableStoreAddField } from "../../../../extensions/data-grid/field";
import { BlockRenderRange } from "../../../../src/block/enum";
import { Rect } from "../../../../src/common/vector/point";
import { ActionDirective } from "../../../../src/history/declare";
import { PageDirective } from "../../../../src/page/directive";
import { SchemaFilter } from "../../schema/declare";
import { Field } from "../../schema/field";
import { FieldType } from "../../schema/type";
import { ViewField } from "../../schema/view";
import { DataGridView } from ".";
import { ElementType, getWsElementUrl } from "../../../../net/element.type";
import { CopyText } from "../../../../component/copy";
import { ShyAlert } from "../../../../component/lib/alert";
export class DataGridViewOperator {
    async onAddField(this: DataGridView, event: React.MouseEvent | MouseEvent, at?: number) {
        event.stopPropagation();
        var self = this;
        var result = await useTableStoreAddField(
            { roundArea: Rect.fromEle(event.target as HTMLDivElement) },
            {
                dataGrid: self
            }
        );
        if (!result) return;
        this.page.onAction(ActionDirective.onSchemaCreateField, async () => {
            var fieldData = await this.schema.fieldAdd({
                text: result.text,
                type: result.type,
                config: result.config
            });
            if (fieldData.ok) {
                var field = new Field();
                field.load(Object.assign(result, fieldData.data.actions[0]));
                this.schema.fields.push(field);
                if (typeof at == 'undefined') at = this.fields.length;
                var vf = this.schema.createViewField(field);
                var newFields = this.fields.map(f => f.clone());
                newFields.push(vf);
                this.changeFields(this.fields, newFields);
                this.data.forEach(row => {
                    var defaultValue = field.getDefaultValue();
                    if (typeof defaultValue != 'undefined')
                        row[field.name] = defaultValue
                });
                await this.createItem();
                this.forceUpdate();
            }
        });
    }
    async onUpdateField(this: DataGridView, viewField: ViewField, data: Record<string, any>) {
        await this.page.onAction(ActionDirective.onSchemaUpdateField, async () => {
            await this.schema.fieldUpdate({ fieldId: viewField.field.id, data });
            viewField.field.load(data);
            await this.createItem();
            this.forceUpdate();
        });
    }
    async onUpdateViewField(this: DataGridView, viewField: ViewField, data: Record<string, any>) {
        await this.page.onAction(ActionDirective.onSchemaUpdateField, async () => {
            var vfs = this.fields.map(f => f.clone());
            var vf = vfs.find(g => g.type && viewField.type == g.type || g.fieldId == viewField.fieldId);
            vf.load(data);
            this.changeFields(this.fields, vfs);
            await this.createItem();
            this.forceUpdate();
        });
    }
    async onDeleteField(this: DataGridView, viewField: ViewField) {
        if (await Confirm('确定要删除该列吗')) {
            var field = viewField.field;
            this.page.onAction(ActionDirective.onSchemaDeleteField, async () => {
                var r = await this.schema.fieldRemove(field.id);
                if (r.ok) {
                    var name = field.name;
                    var fields = this.fields.map(c => c.clone());
                    fields.remove(g => g.fieldId == field.id);
                    this.changeFields(this.fields, fields);
                    this.data.forEach(row => {
                        delete row[name];
                    });
                    await this.createItem();
                    this.forceUpdate();
                }
            });
        }
    }
    async onHideField(this: DataGridView, viewField: ViewField) {
        await this.page.onAction(ActionDirective.onSchemaHideField, async () => {
            var fields = this.fields.map(f => f.clone());
            fields.remove(g => g.type && g.type == viewField.type || g.field?.id == viewField?.field.id);
            this.changeFields(this.fields, fields);
            await this.createItem();
            this.forceUpdate();
        });
    }
    async onShowField(this: DataGridView, field: Field) {
        if (this.fields.some(s => s.field.id == field.id)) return;
        await this.page.onAction(ActionDirective.onSchemaShowField, async () => {
            var fields = this.fields.map(f => f.clone());
            var newFeild = this.schema.createViewField(field);
            fields.push(newFeild);
            this.changeFields(this.fields, fields);
            await this.createItem();
            this.forceUpdate();
        });
    }
    async onShowAllField(this: DataGridView, show: boolean) {
        await this.page.onAction(ActionDirective.onSchemaShowField, async () => {
            if (show) {
                var fs = this.schema.fields.map(g => this.schema.createViewField(g));
                var oss = this.fields.map(f => f.clone()).filter(g => g.type ? true : false);
                fs.each(f => { oss.push(f) });
                this.changeFields(this.fields, oss);
                await this.createItem();
                this.forceUpdate();
            }
            else {
                this.changeFields(this.fields, []);
                await this.createItem();
                this.forceUpdate();
            }
        });
    }
    async onSetSortField(this: DataGridView, viewField: ViewField, sort?: 0 | 1 | -1) {
        if (this.sorts.some(s => s.field == viewField.field.id && s.sort == sort)) {
            return;
        }
        await this.page.onAction(ActionDirective.onTablestoreUpdateViewField, async () => {
            var so = this.sorts.find(g => g.field == viewField.field.id);
            if (so) so.sort = sort;
            else this.sorts.push({ field: viewField.field.id, sort });
            await this.loadData();
            await this.createItem();
        });
    }
    async onTurnField(this: DataGridView, viewField: ViewField, type: FieldType, config?: Record<string, any>) {
        var field = viewField.field;
        await this.page.onAction(ActionDirective.onSchemaTurnField, async () => {
            var r = await this.schema.turnField({ fieldId: field.id, type: type, config });
            if (r.ok) {
                field.type = type;
                if (config) Object.assign(field.config, config);
                await this.loadData();
                await this.createItem();
                this.forceUpdate();
            }
        });
    }
    async onDataGridTurnView(this: DataGridView, viewId: string) {
        if (this.syncBlockId != viewId) {
            this.onAction(ActionDirective.onDataGridTurnView, async () => {
                this.page.snapshoot.setSyncBlock(false);
                var view = this.schema.views.find(g => g.id == viewId);
                var newBlock = await this.page.createBlock(view.url,
                    {
                        syncBlockId: viewId,
                        schemaId: this.schema.id
                    },
                    this.parent,
                    this.at
                );
                if (!(newBlock as any).tableText) await newBlock.updateProps({ tableText: this.schema.text });
                await this.delete();
            })
        }
    }
    async onUpdateSorts(this: DataGridView, sorts: { field: string, sort: number }[]) {
        this.onAction(ActionDirective.onDataGridUpdateSorts, async () => {
            this.updateProps({ sorts })
        })
    }
    async onUpdateFilter(this: DataGridView, filter: SchemaFilter) {
        this.onAction(ActionDirective.onDataGridUpdateFilter, async () => {
            this.updateProps({ filter })
        })
    }
    async onAddFilter(this: DataGridView, viewField: ViewField) {
        this.onAction(ActionDirective.onDataGridUpdateFilter, async () => {
            if (!Array.isArray(this.filter.items)) {
                this.filter = { logic: 'and', items: [] }
            }
            this.filter.items.push({
                operator: '$contain',
                field: viewField.field.id
            })
            this.updateProps({ filter: this.filter })
        })
    }
    async onShowNum(this: DataGridView, visible: boolean) {
        var newFields = this.fields.map(f => f.clone());
        if (visible == true && newFields.some(s => s.type == 'rowNum')) {
            return
        }
        else if (visible == false && !newFields.some(s => s.type == 'rowNum')) {
            return
        }
        this.onAction(ActionDirective.onDataGridShowRowNum, async () => {
            if (visible == true) {
                newFields.insertAt(0, new ViewField({ type: 'rowNum', text: '序号' }, this.schema))
            }
            else newFields.remove(g => g.type == 'rowNum');
            this.updateProps({ showRowNum: visible });
            this.changeFields(this.fields, newFields);
            await this.createItem();
            this.forceUpdate();
        })
    }
    async onShowAutoIncrement(this: DataGridView, visible: boolean) {
        var newFields = this.fields.map(f => f.clone());
        if (visible == true && newFields.some(s => s.field?.type == FieldType.autoIncrement)) {
            return
        }
        else if (visible == false && !newFields.some(s => s.field?.type == FieldType.autoIncrement)) {
            return
        }
        this.page.onAction(ActionDirective.onSchemaCreateField, async () => {
            var sf = this.schema.fields.find(g => g.type == FieldType.autoIncrement);
            if (visible == true) {
                newFields.insertAt(0, new ViewField({ text: '编号', fieldId: sf.id }, this.schema))
            }
            else newFields.remove(g => g.field?.type == FieldType.autoIncrement);
            this.changeFields(this.fields, newFields);
            await this.createItem();
            this.forceUpdate();
        });
    }
    async onShowCheck(this: DataGridView, visible: boolean) {
        var newFields = this.fields.map(f => f.clone());
        if (visible == true && newFields.some(s => s.type == 'check')) return
        else if (visible == false && !newFields.some(s => s.type == 'check')) return
        this.onAction(ActionDirective.onDataGridShowCheck, async () => {
            if (visible == true) {
                newFields.insertAt(0, new ViewField({ type: 'check', text: '选择' }, this.schema))
            }
            else newFields.remove(g => g.type == 'check');
            this.updateProps({ showCheckRow: visible });
            this.changeFields(this.fields, newFields);
            await this.createItem();
            this.forceUpdate();
        })
    }
    changeFields(this: DataGridView, oldFields: ViewField[], newFields: ViewField[]) {
        this.manualUpdateProps({
            fields: oldFields.map(o => o.get())
        }, {
            fields: newFields.map(f => f.get())
        }, BlockRenderRange.none, true);
        this.fields = newFields;
    }
    async onChangeFields(this: DataGridView, oldFields: ViewField[], newFields: ViewField[]) {
        await this.onAction(ActionDirective.onDataGridChangeFields, async () => {
            this.changeFields(oldFields, newFields);
            await this.createItem();
            this.forceUpdate();
        })
    }
    async onCheckRow(this: DataGridView, row: Record<string, any>, checked: boolean) {
        if (checked) {
            if (!this.checkItems.some(s => s.id == row.id)) {
                this.checkItems.push(row);
            }
        }
        else {
            this.checkItems.remove(r => r.id == row.id);
        }
        this.page.emit(PageDirective.selectRows, this, this.checkItems)
    }
    async onChangeIndex(this: DataGridView, index: number) {
        this.index = index;
        this.emit('changeIndex', this.index);
        await this.loadData();
        this.forceUpdate();
    }
    async onChangeSize(this: DataGridView, size: number) {
        this.onAction(ActionDirective.onDataGridChangeSize, async () => {
            this.updateProps({ size });
            await this.loadData();
            await this.createItem();
            this.forceUpdate();
        })
    }
    async onSearch(this: DataGridView,) {

    }
    onOver(this: DataGridView, isOver: boolean) {
        if (this.dataGridTool && this.dataGridTool.isOpenTool) return;
        this.isOver = isOver;
        if (this.dataGridTool) this.dataGridTool.forceUpdate();
    }
    onCopyViewLink(this: DataGridView,) {
        var url = getWsElementUrl({
            type: ElementType.SchemaView,
            id: this.syncBlockId,
            id1: this.schemaView.id
        });
        CopyText(url);
        ShyAlert('视图链接已复制')
    }
}