
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
import lodash from "lodash";
import { util } from "../../../../util/util";
export class DataGridViewOperator {
    async onAddField(this: DataGridView, event: Rect, at?: number) {
        var self = this;
        var result = await useTableStoreAddField(
            { roundArea: event },
            { dataGrid: self }
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
                newFields.splice(at, 0, vf);
                this.changeFields(this.fields, newFields);
                this.data.forEach(row => {
                    var defaultValue = field.getDefaultValue();
                    if (typeof defaultValue != 'undefined')
                        row[field.name] = defaultValue
                });
                await this.createItem();
                this.forceUpdate();
            }
        }, { block: this });
    }
    async onCloneField(this: DataGridView, viewField: ViewField) {
        var result = {
            text: viewField.field.text + '副本',
            type: viewField.field.type,
            config: lodash.cloneDeep(viewField.field.config)
        };
        var at = this.fields.findIndex(g => g === viewField) + 1;
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
                var vf = this.schema.createViewField(field);
                var newFields = this.fields.map(f => f.clone());
                newFields.splice(at, 0, vf);
                this.changeFields(this.fields, newFields);
                this.data.forEach(row => {
                    var defaultValue = field.getDefaultValue();
                    if (typeof defaultValue != 'undefined')
                        row[field.name] = defaultValue
                });
                await this.createItem();
                this.forceUpdate();
            }
        }, { block: this });
    }
    async onUpdateField(this: DataGridView, viewField: ViewField, data: Record<string, any>) {
        await this.page.onAction(ActionDirective.onSchemaUpdateField, async () => {
            await this.schema.fieldUpdate({ fieldId: viewField.field.id, data });
            viewField.field.load(data);
            await this.createItem();
            this.forceUpdate();
        }, { block: this });
    }
    async onUpdateViewField(this: DataGridView, viewField: ViewField, data: Record<string, any>) {
        await this.page.onAction(ActionDirective.onSchemaUpdateField, async () => {
            var vfs = this.fields.map(f => f.clone());
            var vf = vfs.find(g => g.type && viewField.type == g.type || g.fieldId == viewField.fieldId);
            vf.load(data);
            this.changeFields(this.fields, vfs);
            await this.createItem();
            this.forceUpdate();
        }, { block: this });
    }
    async onMoveViewField(this: DataGridView, to: number, from: number) {
        this.page.onAction(ActionDirective.onSchemaDeleteField, async () => {

            var f = this.fields[from];
            var vs = this.fields.map(f => f.clone());
            vs.remove(g => g.type && f.type && g.type == f.type || g.field?.id == f.field?.id);
            vs.splice(to, 0, f.clone());
            this.changeFields(this.fields, vs);
            await this.createItem();
            this.forceUpdate();
        }, { block: this });
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
            }, { block: this });
        }
    }
    async onHideField(this: DataGridView, viewField: ViewField) {
        await this.page.onAction(ActionDirective.onSchemaHideField, async () => {
            var fields = this.fields.map(f => f.clone());
            fields.remove(g => g.type && g.type == viewField.type || g.field?.id == viewField?.field.id);
            this.changeFields(this.fields, fields);
            await this.createItem();
            this.forceUpdate();
        }, { block: this });
    }
    async onShowField(this: DataGridView, field: Field) {
        if (this.fields.some(s => s.field?.id == field.id)) return;
        await this.page.onAction(ActionDirective.onSchemaShowField, async () => {
            var fields = this.fields.map(f => f.clone());
            var newFeild = this.schema.createViewField(field);
            fields.push(newFeild);
            this.changeFields(this.fields, fields);
            await this.createItem();
            this.forceUpdate();
        }, { block: this });
    }
    async onHideAllField(this: DataGridView) {
        await this.page.onAction(ActionDirective.onSchemaShowField, async () => {
            this.changeFields(this.fields, this.fields.findAll(g => g.field?.type == FieldType.title));
            await this.createItem();
            this.forceUpdate();
        }, { block: this });
    }
    async onShowAllField(this: DataGridView) {
        await this.page.onAction(ActionDirective.onSchemaShowField, async () => {
            var fs = this.schema.userFields.map(g => this.schema.createViewField(g));
            var oss = this.fields.map(f => f.clone()).filter(g => g.type ? true : false);
            fs.each(f => { oss.push(f) });
            this.changeFields(this.fields, oss);
            await this.createItem();
            this.forceUpdate();
        }, { block: this });

    }
    async onSetSortField(this: DataGridView, viewField: ViewField, sort?: 0 | 1 | -1) {
        if (this.sorts.some(s => s.field == viewField.field.id && s.sort == sort)) {
            return;
        }
        await this.page.onAction(ActionDirective.onTablestoreUpdateViewField, async () => {
            var sos = lodash.cloneDeep(this.sorts);
            var so = sos.find(g => g.field == viewField.field.id);
            if (so) so.sort = sort;
            else sos.push({ id: util.guid(), field: viewField.field.id, sort });
            this.manualUpdateProps({ sorts: this.sorts }, { sorts: sos });
            await this.loadData();
            await this.createItem();
        }, { block: this });
        var rect = this.getVisibleContentBound();
        rect.height = 20;
        await this.onOpenViewConfig(rect, 'sort')
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
        }, { block: this });
    }
    async onDataGridTurnView(this: DataGridView, viewId: string) {
        if (this.syncBlockId != viewId) {
            this.page.onAction(ActionDirective.onDataGridTurnView, async () => {
                var view = this.schema.views.find(g => g.id == viewId);
                await this.page.createBlock(view.url,
                    {
                        syncBlockId: viewId,
                        schemaId: this.schema.id
                    },
                    this.parent,
                    this.at
                );
                await this.delete();
            })
        }
    }
    async onCopySchemaView(this: DataGridView) {
        var r = await this.schema.onSchemaOperate([{
            name: 'duplicateSchemaView',
            id: this.schemaView.id,
            data: { snap: await this.getSyncString() }
        }]);
        console.log(r, this.schema);
        var act = r?.data?.actions[0];
        if (act.id) {
            this.onDataGridTurnView(act.id);
        }
    }
    async onUpdateSorts(this: DataGridView, sorts: { field: string, sort: number }[]) {
        this.page.onAction(ActionDirective.onDataGridUpdateSorts, async () => {
            this.updateProps({ sorts })
        }, { block: this })
    }
    async onUpdateFilter(this: DataGridView, filter: SchemaFilter) {
        this.page.onAction(ActionDirective.onDataGridUpdateFilter, async () => {
            this.updateProps({ filter })
        }, { block: this })
    }
    async onAddFilter(this: DataGridView, viewField: ViewField) {
        await this.page.onAction(ActionDirective.onDataGridUpdateFilter, async () => {
            if (!Array.isArray(this.filter.items)) {
                this.filter = { logic: 'and', items: [] }
            }
            this.filter.items.push({
                operator: '$contain',
                field: viewField.field.id,
                value: ''
            })
            this.updateProps({ filter: this.filter })
        }, { block: this });
        var rect = this.getVisibleContentBound();
        rect.height = 20;
        await this.onOpenViewConfig(rect, 'filter')
    }
    async onShowNum(this: DataGridView, visible: boolean) {
        var newFields = this.fields.map(f => f.clone());
        if (visible == true && newFields.some(s => s.type == 'rowNum')) {
            return
        }
        else if (visible == false && !newFields.some(s => s.type == 'rowNum')) {
            return
        }
        this.page.onAction(ActionDirective.onDataGridShowRowNum, async () => {
            if (visible == true) {
                newFields.insertAt(0, new ViewField({ type: 'rowNum', text: '序号' }, this.schema))
            }
            else newFields.remove(g => g.type == 'rowNum');
            this.updateProps({ showRowNum: visible });
            this.changeFields(this.fields, newFields);
            await this.createItem();
            this.forceUpdate();
        }, { block: this })
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
        }, { block: this });
    }
    async onShowCheck(this: DataGridView, visible: boolean) {
        var newFields = this.fields.map(f => f.clone());
        if (visible == true && newFields.some(s => s.type == 'check')) return
        else if (visible == false && !newFields.some(s => s.type == 'check')) return
        this.page.onAction(ActionDirective.onDataGridShowCheck, async () => {
            if (visible == true) {
                newFields.insertAt(0, new ViewField({ type: 'check', text: '选择' }, this.schema))
            }
            else newFields.remove(g => g.type == 'check');
            this.updateProps({ showCheckRow: visible });
            this.changeFields(this.fields, newFields);
            await this.createItem();
            this.forceUpdate();
        }, { block: this })
    }
    changeFields(this: DataGridView, oldFields: ViewField[], newFields: ViewField[]) {
        this.manualUpdateProps({ fields: oldFields }, { fields: newFields }, BlockRenderRange.none, true);
        // this.fields = newFields;
    }
    async onChangeFields(this: DataGridView, oldFields: ViewField[], newFields: ViewField[]) {
        await this.page.onAction(ActionDirective.onDataGridChangeFields, async () => {
            this.changeFields(oldFields, newFields);
            await this.createItem();
            this.forceUpdate();
        }, { block: this })
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
        this.page.onAction(ActionDirective.onDataGridChangeSize, async () => {
            this.updateProps({ size });
            await this.loadData();
            await this.createItem();
            this.forceUpdate();
        }, { block: this })
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