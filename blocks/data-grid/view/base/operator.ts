
import { Confirm } from "../../../../component/lib/confirm";
import { useTableStoreAddField } from "../../../../extensions/data-grid/field";
import { BlockRenderRange } from "../../../../src/block/enum";
import { Rect } from "../../../../src/common/vector/point";
import { ActionDirective, OperatorDirective } from "../../../../src/history/declare";
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
import { BlockUrlConstant } from "../../../../src/block/constant";
import { useDataSourceView } from "../../../../extensions/data-grid/datasource";
import { SnapshootDataGridViewPos } from "../../../../src/history/snapshoot";
import { useTableExport } from "../../../../extensions/data-grid/export";
import { BlockFactory } from "../../../../src/block/factory/block.factory";

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
                var field = this.schema.fields.find(g => g.id == fieldData.data.actions[0].id);
                if (typeof at == 'undefined') at = this.fields.length;
                var vf = this.schema.createViewField(field);
                await this.arrayPush({ prop: 'fields', data: vf, at });
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
    async onCloneViewField(this: DataGridView, viewField: ViewField) {
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
                var field = this.schema.fields.find(g => g.id == fieldData.data.actions[0].id)
                var vf = this.schema.createViewField(field);
                await this.arrayPush({ prop: 'fields', data: vf, at });

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
    async onCloneField(this: DataGridView, field: Field) {
        var result = {
            text: field.text + '副本',
            type: field.type,
            config: lodash.cloneDeep(field.config)
        };
        var at = this.fields.findIndex(g => g.field == field) + 1;
        this.page.onAction(ActionDirective.onSchemaCreateField, async () => {
            var fieldData = await this.schema.fieldAdd({
                text: result.text,
                type: result.type,
                config: result.config
            });
            if (fieldData.ok) {
                var field = this.schema.fields.find(g => g.id == fieldData.data.actions[0].id)
                var vf = this.schema.createViewField(field);
                await this.arrayPush({ prop: 'fields', data: vf, at })
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
    async onUpdateField(this: DataGridView, field: Field, data: Record<string, any>) {
        await this.page.onAction(ActionDirective.onSchemaUpdateField, async () => {
            await this.schema.fieldUpdate({ fieldId: field.id, data });
            field.load(data);
            await this.createItem();
            this.forceUpdate();
        }, { block: this });
    }
    async onUpdateFieldConfig(this: DataGridView, field: Field, configProps: Record<string, any>) {
        var nc: Record<string, any> = util.extendKey(configProps, 'config');
        await this.onUpdateField(field, nc);
    }
    async onUpdateViewField(this: DataGridView, viewField: ViewField, data: Record<string, any>) {
        await this.page.onAction(ActionDirective.onSchemaUpdateField, async () => {
            await this.arrayUpdate<ViewField>({
                prop: 'fields',
                data: g => g.type && viewField.type == g.type || g.fieldId == viewField.fieldId,
                update: data
            })
            await this.createItem();
            this.forceUpdate();
        }, { block: this });
    }
    async onMoveViewField(this: DataGridView, to: number, from: number) {
        this.page.onAction(ActionDirective.onSchemaDeleteField, async () => {
            await this.arrayMove({ prop: 'fields', from, to })
            await this.createItem();
            this.forceUpdate();
        }, { block: this });
    }
    async onDeleteViewField(this: DataGridView, viewField: ViewField, force?: boolean) {
        if (force == true || await Confirm('确定要删除该列吗')) {
            var field = viewField.field;
            this.page.onAction(ActionDirective.onSchemaDeleteField, async () => {
                var r = await this.schema.fieldRemove(field.id);
                if (r.ok) {
                    await this.arrayRemove<ViewField>({ prop: 'fields', data: g => g.fieldId == field.id })
                    await this.createItem();
                    this.forceUpdate();
                }
            }, { block: this });
        }
    }
    async onDeleteField(this: DataGridView, field: Field, force?: boolean) {
        if (force == true || await Confirm('确定要删除该列吗')) {
            this.page.onAction(ActionDirective.onSchemaDeleteField, async () => {
                var r = await this.schema.fieldRemove(field.id);
                if (r.ok) {
                    await this.arrayRemove<ViewField>({ prop: 'fields', data: g => g.fieldId == field.id })
                    await this.createItem();
                    this.forceUpdate();
                }
            }, { block: this });
        }
    }
    async onHideField(this: DataGridView, viewField: ViewField) {
        await this.page.onAction(ActionDirective.onSchemaHideField, async () => {
            await this.arrayRemove<ViewField>({ prop: 'fields', data: g => g.type && g.type == viewField.type || g.field?.id == viewField?.field.id })
            await this.createItem();
            this.forceUpdate();
        }, { block: this });
    }
    async onShowField(this: DataGridView, field: Field) {
        if (this.fields.some(s => s.field?.id == field.id)) return;
        await this.page.onAction(ActionDirective.onSchemaShowField, async () => {
            var newFeild = this.schema.createViewField(field);
            await this.arrayPush({ prop: 'fields', data: newFeild })
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
    async onTurnField(this: DataGridView, viewField: ViewField, type: FieldType, options: { text?: string, config?: Record<string, any> }) {
        var field = viewField.field;
        await this.page.onAction(ActionDirective.onSchemaTurnField, async () => {
            var r = await this.schema.turnField({ fieldId: field.id, text: options.text, type: type, config: options.config });
            if (r.ok) {
                field.type = type;
                if (options.text) field.text = options.text;
                if (options.config) Object.assign(field.config, options.config);
                await this.loadData();
                await this.createItem();
                this.forceUpdate();
            }
        }, { block: this });
    }
    /**
     * 将当前表格切换成相对应的视图url
     * 
     */
    async onDataGridChangeView(this: DataGridView, url: string) {
        await this.page.onAction('onDataGridChangeView', async () => {
            await this.dataGridChangeView(url);
        })
    }
    async dataGridChangeView(this: DataGridView, url: string) {
        var view = this.schema.views.find(g => g.id == this.syncBlockId);
        var oldViewUrl = view.url;
        var actions: any[] = [{ name: 'changeSchemaView', id: this.syncBlockId, data: { url } }];
        var result = await this.schema.onSchemaOperate(actions);
        var at = this.at;
        var pa = this.parent;
        var id = this.id;
        await this.delete();
        var newBlock = await this.page.createBlock(url,
            {
                syncBlockId: view.id,
                schemaId: this.schema.id
            },
            pa,
            at
        );
        this.page.addBlockUpdate(newBlock.parent);
        this.page.addUpdateEvent(async () => {
            newBlock.url = url;
            newBlock.id = id;
            await newBlock.didMounted();
        })
        this.page.snapshoot.record(OperatorDirective.$data_grid_change_view_url, {
            pos: newBlock.pos,
            from: oldViewUrl,
            to: url
        }, this);
    }
    /**
     * 将表格切换成其它视图
     * @param this 
     * @param viewId 
     * @param schemaId 
     */
    async onDataGridTurnView(this: DataGridView, viewId: string, schemaId?: string) {
        if (this.syncBlockId != viewId) {
            await this.page.onAction(ActionDirective.onDataGridTurnView, async () => {
                await this.dataGridTrunView(viewId, schemaId);
            })
        }
    }
    async dataGridTrunView(this: DataGridView, viewId: string, schemaId?: string) {
        var oldViewId = this.syncBlockId;
        if (!this.schema) {
            await this.loadSchema();
        }
        var view = this.schema.views.find(g => g.id == viewId);
        var newBlock = await BlockFactory.createBlock(view.url, this.page, {
            syncBlockId: viewId,
            schemaId: schemaId || this.schema.id
        }, this.parent)
        var bs = this.parentBlocks;
        var at = this.at;
        bs[at] = newBlock;
        newBlock.id = this.id;
        this.page.addBlockUpdate(newBlock.parent);
        this.page.snapshoot.record(OperatorDirective.$data_grid_trun_view, {
            pos: newBlock.pos,
            from: oldViewId,
            to: viewId
        }, this);
    }
    async onOtherDataGridTurnView(this: DataGridView, viewId: string, type: 'form' | 'view', schemaId: string, viewUrl?: string) {
        if (this.syncBlockId != viewId) {
            await this.page.onAction(ActionDirective.onDataGridTurnView, async () => {
                await this.otherDataGridTrunView(viewId, type, schemaId, viewUrl);
            })
        }
    }
    async otherDataGridTrunView(this: DataGridView,
        viewId: string,
        type: 'form' | 'view',
        schemaId: string,
        viewUrl?: string) {
        if (!this.schema) {
            await this.loadSchema();
        }
        var from: SnapshootDataGridViewPos = this.pos as any;
        from.schemaId = this.schema.id;
        from.viewId = this.syncBlockId;
        from.viewUrl = this.url;
        from.type = 'view';
        var newBlock = await this.page.createBlock(viewUrl,
            {
                syncBlockId: viewId,
                schemaId: schemaId
            },
            this.parent,
            this.at
        );
        var bs = this.parent.blocks[this.parentKey];
        lodash.remove(bs, g => g === this);
        var to: SnapshootDataGridViewPos = newBlock.pos as any;
        to.blockId = this.id;
        to.schemaId = schemaId;
        to.viewId = viewId;
        to.viewUrl = viewUrl;
        to.type = type;
        this.page.addBlockUpdate(newBlock.parent);
        this.page.addUpdateEvent(async () => {
            newBlock.id = this.id;
            await newBlock.didMounted();
        })
        this.page.snapshoot.record(OperatorDirective.$data_grid_trun_view_new, { from, to }, this);
    }
    async onCopySchemaView(this: DataGridView) {
        var r = await this.schema.onSchemaOperate([{
            name: 'duplicateSchemaView',
            id: this.schemaView.id,
            data: { snap: await this.getSyncString() }
        }]);
        var act = r?.data?.actions[0];
        if (act.id) {
            this.onDataGridTurnView(act.id);
        }
    }
    async onSchemaViewMove(this: DataGridView, viewId: string, from: number, to: number) {
        await this.schema.onSchemaOperate([{
            name: 'moveSchemaView',
            id: this.schemaView.id,
            data: { from, to }
        }]);
    }
    async onSchemaViewCreate(this: DataGridView, text: string, url: string) {
        var actions: any[] = [{ name: 'createSchemaView', text: text, url: url }];
        if (url == '/data-grid/board' && !this.schema.fields.some(f => f.type == FieldType.option || f.type == FieldType.options)) {
            actions.push({ name: 'addField', field: { text: '状态', type: FieldType.option } })
        }
        var result = await this.schema.onSchemaOperate(actions)
        var oneAction = result.data.actions.first();
        if (result.data.actions.length > 1) {
            var action = result.data.actions[1];
            var f = new Field();
            f.load({
                id: action.id,
                name: action.name,
                text: '状态',
                type: FieldType.option
            });
            this.schema.fields.push(f);
        }
        this.schema.views.push({ id: oneAction.id, text: text, url: url } as any);
        await this.onDataGridTurnView(oneAction.id);
    }
    async onSchemaViewRename(this: DataGridView, viewId: string, text: string) {
        var self = this;
        self.schema.onSchemaOperate([
            {
                name: 'updateSchemaView',
                id: viewId,
                data: { text: text }
            }
        ]);
        self.forceUpdate()
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
    async onShowRowNum(this: DataGridView, visible: boolean) {
        var newFields = this.fields.map(f => f.clone());
        if (visible == true && newFields.some(s => s.type == 'rowNum')) {
            return
        }
        else if (visible == false && !newFields.some(s => s.type == 'rowNum')) {
            return
        }
        this.page.onAction(ActionDirective.onDataGridShowRowNum, async () => {
            if (visible == true) await this.arrayPush({ prop: 'fields', data: new ViewField({ type: 'rowNum', text: '序号' }, this.schema), at: 0 })
            else await this.arrayRemove<ViewField>({ prop: 'fields', data: g => g.type == 'rowNum' });
            this.updateProps({ showRowNum: visible });
            await this.createItem();
            this.forceUpdate();
        }, { block: this })
    }
    async onShowCheck(this: DataGridView, value: DataGridView['checkRow']) {
        var newFields = this.fields.map(f => f.clone());
        if (value == 'checkbox' && newFields.some(s => s.type == 'check')) return
        else if (value == 'none' && !newFields.some(s => s.type == 'check')) return
        this.page.onAction(ActionDirective.onDataGridShowCheck, async () => {
            this.updateProps({ checkRow: value });
            if (value == 'checkbox') await this.arrayPush({ prop: 'fields', at: 0, data: new ViewField({ type: 'check', text: '选择' }, this.schema) })
            else await this.arrayRemove<ViewField>({ prop: 'fields', data: g => g.type == 'check' })
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
    async onListPageIndex(this: DataGridView, index: number) {
        await this.onLoadingAction(async () => {
            this.pageIndex = index;
            await this.loadData();
            await this.createItem();
        })
    }
    async onChangeSize(this: DataGridView, size: number) {
        this.page.onAction(ActionDirective.onDataGridChangeSize, async () => {
            var totalPage = Math.ceil(this.total / size);
            if (!(this.pageIndex >= 1 && this.pageIndex <= totalPage)) {
                this.pageIndex = 1;
            }
            this.updateProps({ size });
            await this.onLoadingAction(async () => {
                await this.loadData();
                await this.createItem();
            })
        });
    }
    async onSearch(this: DataGridView) {
        await this.onReloadData();
    }
    onOver(this: DataGridView, isOver: boolean) {
        if (this.dataGridTool && this.dataGridTool.isOpenTool) return;
        this.isOver = isOver;
        if (this.dataGridTool) this.dataGridTool.forceUpdate();
    }
    onCopyViewLink(this: DataGridView,) {
        var url = getWsElementUrl({
            type: ElementType.SchemaView,
            id: this.schema.id,
            id1: this.schemaView.id
        });
        CopyText(url);
        ShyAlert('视图链接已复制')
    }
    async onExtendControlBlock(this: DataGridView, url: BlockUrlConstant, props: Record<string, any>, visible: boolean) {
        await this.page.onAction('onExtendControlBlock', async () => {
            if (url == BlockUrlConstant.DataGridPage) {
                var newBlock = await this.page.createBlock(url, { refBlockId: this.id, ...props }, this.parent, this.at + 1, this.parentKey);
                this.registerReferenceBlocker(newBlock);
            }
            else if (url == BlockUrlConstant.Button) {
                var pre = this.prev;
                if (pre && !pre.isLine && pre.find(g => g.url == BlockUrlConstant.Button)) {
                    var newBlock = await this.page.createBlock(url, {
                        url,
                        refBlockId: this.id,
                        ...props
                    }, pre, pre.childs.length,
                    );
                    this.registerReferenceBlocker(newBlock);
                }
                else {
                    var newBlock = await this.page.createBlock(BlockUrlConstant.TextSpan, {
                        blocks: {
                            childs: [{ url, refBlockId: this.id, ...props }]
                        }
                    },
                        this.parent,
                        this.at,
                        this.parentKey);
                    this.registerReferenceBlocker(newBlock);
                }

            }
        })
    }
    async onExtendControlFilter(this: DataGridView, field: Field) {
        var url: string = '';
        if ([FieldType.bool].includes(field.type)) {
            url = '/field/filter/check';
        }
        else if ([FieldType.image, FieldType.video, FieldType.audio, FieldType.file].includes(field.type)) {
            url = '/field/filter/null';
        }
        else if ([FieldType.createDate, FieldType.modifyDate, FieldType.date].includes(field.type)) {
            url = '/field/filter/date';
        }
        else if ([FieldType.creater, FieldType.modifyer, FieldType.user].includes(field.type)) {
            url = '/field/filter/user';
        }
        else if ([FieldType.option, FieldType.options].includes(field.type)) {
            url = '/field/filter/option';
        }
        else if ([FieldType.relation].includes(field.type)) {
            url = '/field/filter/relation';
        }
        else if ([FieldType.number].includes(field.type)) {
            url = '/field/filter/number';
        } else if ([
            FieldType.title,
            FieldType.text,
            FieldType.email,
            FieldType.like,
            FieldType.phone
        ].includes(field.type)) {
            url = '/field/filter/search';
        }
        await this.page.onAction('onExtendControlFilter', async () => {
            var newBlock = await this.page.createBlock(url,
                { refBlockId: this.id, refFieldId: field.id, },
                this.parent,
                this.at,
                this.parentKey
            );
            this.registerReferenceBlocker(newBlock);
        })
    }
    async onExtendControlSort(this: DataGridView, field: Field) {
        var url: string = '/field/filter/sort';
        await this.page.onAction('onExtendControlSort', async () => {
            var newBlock = await this.page.createBlock(url,
                { refBlockId: this.id, refFieldId: field.id, },
                this.parent,
                this.at,
                this.parentKey
            );
            this.registerReferenceBlocker(newBlock);
        })
    }
    async onOpenDataSource(this: DataGridView, event: Rect) {
        var g = await useDataSourceView({ roundArea: event }, {
            tableId: this.schema.id,
            viewId: this.syncBlockId,
            selectView: true,
            editTable: true
        });
        if (g) {
            if (typeof g != 'string' && g.type == 'view') {
                this.onOtherDataGridTurnView(
                    g.viewId,
                    g.type,
                    g.tableId,
                    g.viewUrl)
            }
        }
    }
    async onReloadData(this: DataGridView) {
        await this.loadData();
        await this.createItem();
        this.view.forceUpdate()
    }
    async onSortRank(this: DataGridView) {
        var c = lodash.cloneDeep(this.data);
        this.data = c.sort((x, y) => {
            if (x.sort < y.sort) return -1
            else if (x.sort == y.sort) return 0;
            else return 1;
        });
        await this.createItem();
        this.view.forceUpdate()
    }
    async onBatchDelete(this: DataGridView, ids?: string[]) {
        if (typeof ids == 'undefined') ids = this.checkItems.map(c => c.id);
        if (ids.length > 0) {
            if (await Confirm(`确定删除这些数据吗`)) {
                await this.schema.rowRemoves(ids);
                this.onReloadData()
                ShyAlert('删除成功')
            }
        }
        else ShyAlert('请选择删除项')
    }
    async onBatchEdit(this: DataGridView, viewId?: string) {

    }
    async onImport(this: DataGridView) {

    }
    async onExport(this: DataGridView, rect: Rect) {
        await useTableExport({ roundArea: rect }, this)
    }
}