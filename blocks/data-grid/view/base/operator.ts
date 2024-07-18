
import { Confirm } from "../../../../component/lib/confirm";
import { useTableStoreAddField } from "../../../../extensions/data-grid/field";
import { BlockRenderRange } from "../../../../src/block/enum";
import { Point, Rect } from "../../../../src/common/vector/point";
import { ActionDirective } from "../../../../src/history/declare";
import { PageDirective } from "../../../../src/page/directive";
import { SchemaFilter, SchemaFilterJoin } from "../../schema/filter";
import { Field } from "../../schema/field";
import { FieldType, SysHiddenFieldTypes } from "../../schema/type";
import { ViewField } from "../../schema/view";
import { DataGridView } from ".";
import { ElementType, getElementUrl } from "../../../../net/element.type";
import { CopyText } from "../../../../component/copy";
import { ShyAlert } from "../../../../component/lib/alert";
import lodash from "lodash";
import { util } from "../../../../util/util";
import { BlockUrlConstant } from "../../../../src/block/constant";
import { useDataSourceView } from "../../../../extensions/data-grid/datasource";
import { useTableExport } from "../../../../extensions/data-grid/export";
import { Block } from "../../../../src/block";
import { lst } from "../../../../i18n/store";
import { IconValueType } from "../../../../component/view/icon";
import { CardFactory } from "../../template/card/factory/factory";
import { TableSchema } from "../../schema/meta";
import { OptionColorRandom } from "../../../../extensions/color/data";
import { useSelectMenuItem } from "../../../../component/view/menu";
import { GroupHeadType } from "../declare";
import dayjs from "dayjs";

export class DataGridViewOperator {
    async onAddField(this: DataGridView, event: Rect, at?: number) {
        var self = this;
        var result = await useTableStoreAddField(
            { roundArea: event },
            { dataGrid: self }
        );
        if (!result || !result?.text) return;
        var vs = this.schema.fields.find(g => g.visible === false && g.type == result.type);
        if (vs) {
            await this.page.onAction(ActionDirective.onSchemaCreateField, async () => {
                await this.schema.fieldUpdate({ fieldId: vs.id, data: { visible: true } }, this.id);
                var vf = this.schema.createViewField(vs);
                if (typeof at == 'undefined') at = this.fields.length;
                await this.arrayPush({ prop: 'fields', data: vf, at });
                await this.createItem(true);
            });
        }
        else
            await this.page.onAction(ActionDirective.onSchemaCreateField, async () => {
                var fieldData = await this.schema.fieldAdd({
                    text: result.text,
                    type: result.type,
                    config: result.config
                }, this.id);
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
                    if (field.type == FieldType.relation) {
                        await this.loadRelationSchemas()
                        if (result.config?.relationDouble) {
                            var rs = this.relationSchemas.find(c => c.id == result.config.relationTableId);
                            var nff = await rs.fieldAdd({
                                text: result.config?.relationFieldText,
                                type: FieldType.relation,
                                config: {
                                    relationTableId: this.schema.id,
                                    relationFieldId: field.id,
                                    relationDouble: true,
                                    relationFieldText: field.text
                                }
                            }, this.id)
                            var cfg = lodash.cloneDeep(field.config) || {};
                            cfg.relationFieldId = nff.data.actions[0].id;
                            await this.schema.fieldUpdate({
                                fieldId: field.id,
                                data: {
                                    config: cfg
                                }
                            }, this.id)
                        }
                    }
                    await this.createItem(true);
                }
            });
    }
    async onCloneViewField(this: DataGridView, field: Field, viewField: ViewField) {
        var result = {
            text: field.text + lst('副本'),
            type: field.type,
            config: lodash.cloneDeep(field.config)
        };

        this.page.onAction(ActionDirective.onSchemaCreateField, async () => {
            // this.page.notifyActionBlockSync(this);
            var fieldData = await this.schema.fieldAdd({
                text: result.text,
                type: result.type,
                config: result.config
            }, this.id);
            if (fieldData.ok) {
                var field = this.schema.fields.find(g => g.id == fieldData.data.actions[0].id)
                if (viewField) {
                    var at = this.fields.findIndex(g => g === viewField) + 1;
                    var vf = this.schema.createViewField(field);
                    await this.arrayPush({ prop: 'fields', data: vf, at });
                }
                this.data.forEach(row => {
                    var defaultValue = field.getDefaultValue();
                    if (typeof defaultValue != 'undefined')
                        row[field.name] = defaultValue
                });
                await this.createItem(true);
            }
        });
    }
    async onCloneField(this: DataGridView, field: Field) {
        var result = {
            text: field.text + lst('副本'),
            type: field.type,
            config: lodash.cloneDeep(field.config)
        };
        var at = this.fields.findIndex(g => g.field == field) + 1;
        this.page.onAction(ActionDirective.onSchemaCreateField, async () => {
            // this.page.notifyActionBlockSync(this);
            var fieldData = await this.schema.fieldAdd({
                text: result.text,
                type: result.type,
                config: result.config
            }, this.id);
            if (fieldData.ok) {
                var field = this.schema.fields.find(g => g.id == fieldData.data.actions[0].id)
                var vf = this.schema.createViewField(field);
                await this.arrayPush({ prop: 'fields', data: vf, at })
                this.data.forEach(row => {
                    var defaultValue = field.getDefaultValue();
                    if (typeof defaultValue != 'undefined')
                        row[field.name] = defaultValue
                });
                await this.createItem(true);
            }
        });
    }
    async onUpdateField(this: DataGridView,
        field: Field,
        data: Record<string, any>) {
        await this.schema.fieldUpdate({ fieldId: field.id, data }, this.id);
        field.load(data);
        if (this.url == BlockUrlConstant.DataGridBoard) {
            if (((this as any).groupFieldId == field.id)) {
                var ops = field.config?.options;
                lodash.remove((this as any).dataGroups as { value: any }[], d => lodash.isNull(d.value) || ops.some(s => s.value == d.value) ? false : true)
            }
        }
        this.onNotifyReferenceBlocks()
        await this.createItem(true);
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
            this.onNotifyReferenceBlocks()
            await this.createItem();
            this.forceManualUpdate();
        });
    }
    async onMoveViewField(this: DataGridView, to: number, from: number) {
        await this.page.onAction(ActionDirective.onSchemaDeleteField, async () => {
            // this.page.notifyActionBlockSync(this);
            await this.arrayMove({ prop: 'fields', from, to })
            await this.createItem();
            this.forceManualUpdate();
        });
    }
    async onReplaceViewField(this: DataGridView, fields: ViewField[]) {
        await this.page.onAction(ActionDirective.onSchemaDeleteField, async () => {
            // this.page.notifyActionBlockSync(this);
            // await this.arrayMove({ prop: 'fields', from, to })
            await this.updateProps({ fields }, BlockRenderRange.self)
            await this.createItem();
            this.forceManualUpdate();
        });
    }
    async onDeleteViewField(this: DataGridView, field: Field, force?: boolean) {
        if (force == true || await Confirm(lst('确定要删除该列吗'))) {

            this.page.onAction(ActionDirective.onSchemaDeleteField, async () => {
                var r = await this.schema.fieldRemove(field.id, this.id);
                if (r.ok) {
                    await this.arrayRemove<ViewField>({ prop: 'fields', data: g => g.fieldId == field.id })
                    await this.createRowsItem(true);
                }
            });
        }
    }
    async onDeleteField(this: DataGridView, field: Field, force?: boolean) {
        if (force == true || await Confirm(lst('确定要删除该列吗'))) {
            await this.page.onAction(ActionDirective.onSchemaDeleteField, async () => {
                var r = await this.schema.fieldRemove(field.id, this.id);
                if (r.ok) {
                    await this.arrayRemove<ViewField>({ prop: 'fields', data: g => g.fieldId == field.id })
                    await this.createRowsItem(true);
                }
            });
        }
    }
    async onHideField(this: DataGridView, viewField: ViewField) {
        await this.page.onAction(ActionDirective.onSchemaHideField, async () => {
            await this.arrayRemove<ViewField>({ prop: 'fields', data: g => g.type && g.type == viewField.type || g.field?.id == viewField?.field.id })
            await this.createItem();
            this.forceManualUpdate();
        });
    }
    async onShowField(this: DataGridView, field: Field) {
        if (this.fields.some(s => s.field?.id == field.id)) return;
        await this.page.onAction(ActionDirective.onSchemaShowField, async () => {
            var newFeild = this.schema.createViewField(field);
            await this.arrayPush({ prop: 'fields', data: newFeild })
            if (field.type == FieldType.relation || field.type == FieldType.rollup) {
                await this.loadRelationSchemas();
                await this.loadRelationDatas();
            }
            await this.createItem();
            this.forceManualUpdate();
        });
    }
    async onHideAllField(this: DataGridView) {
        await this.page.onAction(ActionDirective.onSchemaShowField, async () => {
            await this.changeFields(this.fields, this.fields.findAll(g => g.field?.type == FieldType.title));
            await this.createItem();
            this.forceManualUpdate();
        });
    }
    async onShowAllField(this: DataGridView) {
        await this.page.onAction(ActionDirective.onSchemaShowField, async () => {
            var fs = this.schema.fields.filter(c => c.text && !SysHiddenFieldTypes.includes(c.type)).map(g => this.schema.createViewField(g));
            var oss = this.fields.map(f => f.clone()).filter(g => g.type ? true : false);
            fs.each(f => {
                if (!oss.exists(c => c.id == f.fieldId))
                    oss.push(f)
            });
            await this.changeFields(this.fields, oss);
            if (oss.some(s => s?.field?.type == FieldType.relation || s?.field?.type == FieldType.rollup)) {
                await this.loadRelationSchemas();
                await this.loadRelationDatas();
            }
            await this.createItem();
            this.forceManualUpdate();
        });
    }
    async onSetSortField(this: DataGridView, field: Field, sort?: 0 | 1 | -1) {
        if (this.sorts.some(s => s.field == field.id && s.sort == sort)) {
            return;
        }
        await this.page.onAction(ActionDirective.onTablestoreUpdateViewField, async () => {
            // this.page.notifyActionBlockSync(this);
            var sos = lodash.cloneDeep(this.sorts);
            var so = sos.find(g => g.field == field.id);
            if (so) so.sort = sort;
            else sos.push({ id: util.guid(), field: field.id, sort });
            await this.manualUpdateProps({ sorts: this.sorts }, { sorts: sos });
            await this.loadData();
            await this.createItem();
        });
        var rect = this.getVisibleContentBound();
        rect.height = 20;
        await this.onOpenViewConfig(rect, 'sort')
    }
    async onTurnField(this: DataGridView, field: Field, type: FieldType, options: { text?: string, config?: Record<string, any> }) {

        var r = await this.schema.turnField({ fieldId: field.id, data: { text: options.text, type: type, config: options.config } }, this.id);

        if (r.ok) {
            await this.onReloadData()
        }
    }
    /**
     * 将当前表格切换成相对应的视图url
     * 
     */
    async onDataGridChangeView(this: DataGridView, url: string) {
        var newBlock: Block;
        await this.page.onAction('onDataGridChangeView', async () => {
            newBlock = await this.dataGridChangeView(url);
        }, { disabledSyncBlock: true })
        if (newBlock)
            await newBlock.page.onAction('onSaveSyncBlocks', async () => {
                {
                    await newBlock.updateProps({ editor: newBlock.page.user?.id, editDate: new Date() });
                }
            }, { immediate: true, disabledJoinHistory: false, })
    }
    async onDataGridChangeViewByTemplate(this: DataGridView, url: string) {
        var newBlock: Block;
        await this.page.onAction('onDataGridChangeViewByTemplate', async () => {
            var cm = CardFactory.CardModels.get(url)?.model;
            var viewUrl = cm.forUrls[0];
            var ps = cm.props.toArray(pro => {
                var f = this.schema.fields.find(x => x.text == pro.text && x.type == pro.types[0]);
                if (f) {
                    return {
                        name: pro.name,
                        visible: true,
                        // bindFieldId: f.id,
                        bindFieldIds: [f.id]
                    }
                }
            })
            var viewProps = ({
                openRecordSource: 'page',
                cardConfig: {
                    auto: false,
                    showCover: false,
                    coverFieldId: "",
                    coverAuto: false,
                    showMode: 'define',
                    templateProps: {
                        url: url,
                        props: ps
                    }
                }
            });
            newBlock = await this.dataGridChangeView(viewUrl, viewProps);
        }, { disabledSyncBlock: true })
        if (newBlock)
            await newBlock.page.onAction('onSaveSyncBlocks', async () => {
                {
                    await newBlock.updateProps({ editor: newBlock.page.user?.id, editDate: new Date() });
                }
            }, { immediate: true, disabledJoinHistory: false, })
    }
    async dataGridChangeView(this: DataGridView, url: string, viewProps?: Record<string, any>) {
        var dt = this.dataGridTab;
        var view = this.schema.views.find(g => g.id == this.syncBlockId);
        var actions: any[] = [{ name: 'changeSchemaView', id: this.syncBlockId, data: { url } }];
        await this.schema.onSchemaOperate(actions, this.id);
        var bs = this.referenceBlockers;
        var at = this.at;
        var pa = this.parent;
        var pk = this.parentKey;
        await this.delete();
        if (url == BlockUrlConstant.DataGridBoard) {
            if (!this.schema.fields.some(s => s.type == FieldType.option || s.type == FieldType.options)) {

                await this.schema.fieldAdd({
                    text: lst('状态'),
                    type: FieldType.option,
                    config: {
                        options: [
                            { text: lst('未开始'), value: util.guid(), ...OptionColorRandom() },
                            { text: lst('进行中'), value: util.guid(), ...OptionColorRandom() },
                            { text: lst('已完成'), value: util.guid(), ...OptionColorRandom() },
                        ]
                    }
                }, this.id);
            }
        }
        var newBlock = await this.page.createBlock(url,
            {
                syncBlockId: view.id,
                schemaId: this.schema.id
            },
            pa,
            at,
            pk
        ) as DataGridView;
        if (viewProps && Object.keys(viewProps).length > 0) {
            await newBlock.updateProps(viewProps, BlockRenderRange.self);
        }
        else {
            if ([
                BlockUrlConstant.DataGridGallery,
                BlockUrlConstant.DataGridBoard,
                BlockUrlConstant.DataGridList].includes(newBlock.url as any)
            ) {
                await newBlock.updateProps({
                    cardConfig: {
                        auto: false,
                        showCover: false,
                        coverFieldId: "",
                        showField: 'none',
                        coverAuto: false,
                        showMode: 'default',
                        templateProps: {}
                    }
                }, BlockRenderRange.self);
                if (newBlock.url == BlockUrlConstant.DataGridBoard) {
                    await this.arrayRemove<ViewField>({ prop: 'fields', data: g => g.fieldId == (newBlock as any).groupFieldId })
                }
            }
        }
        for (let i = 0; i < bs.length; i++) {
            await bs[i].updateProps({ refBlockId: newBlock.id }, BlockRenderRange.self)
        }
        bs.forEach(c => {
            newBlock.registerReferenceBlocker(c);
        })
        this.page.notifyActionBlockUpdate(newBlock.parent);
        if (dt) {
            await dt.updateTabItems(newBlock);
        }
        return newBlock;
    }
    /**
     * 将表格切换成其它视图
     * 可能是其它shema view
     * @param this 
     * @param viewId 
     * @param schemaId 
     */
    async onDataGridTurnView(this: DataGridView, viewId: string, viewProps?: Record<string, any>, schemaId?: string) {
        if (this.syncBlockId != viewId) {
            await this.page.onAction(ActionDirective.onDataGridTurnView, async () => {
                await this.dataGridTrunView(viewId, viewProps, schemaId);
            }, { disabledSyncBlock: true })
        }
    }
    async dataGridTrunView(this: DataGridView, viewId: string, viewProps?: Record<string, any>, schemaId?: string) {
        var dt = this.dataGridTab;
        if (!this.schema) {
            await this.loadSchema();
        }
        var sch = this.schema;
        if (schemaId && this.schemaId != schemaId) {
            sch = await TableSchema.loadTableSchema(schemaId, this.page.ws);
            await sch.cacPermissions();
        }
        var v = sch.views.find(g => g.id == viewId);
        var bs = this.referenceBlockers;
        var at = this.at;
        var pa = this.parent;
        var pk = this.parentKey;
        await this.delete();
        var newBlock = await this.page.createBlock(v.url,
            {
                syncBlockId: v.id,
                schemaId: schemaId || this.schema.id
            },
            pa,
            at,
            pk
        ) as DataGridView;
        if (viewProps && Object.keys(viewProps).length > 0) {
            await newBlock.updateProps(viewProps, BlockRenderRange.self);
        }
        for (let i = 0; i < bs.length; i++) {
            await bs[i].updateProps({ refBlockId: newBlock.id }, BlockRenderRange.self)
        }
        bs.forEach(c => {
            newBlock.registerReferenceBlocker(c);
        })
        this.page.notifyActionBlockUpdate(newBlock.parent);
        this.page.addActionCompletedEvent(async () => {
            for (let i = 0; i < bs.length; i++) {
                await bs[i].forceManualUpdate();
            }
        })
        if (dt) {
            await dt.updateTabItems(newBlock);
        }
    }
    async onCopySchemaView(this: DataGridView) {
        var r = await this.schema.onSchemaOperate([{
            name: 'duplicateSchemaView',
            id: this.schemaView.id,
            data: { snap: await this.getSyncString() }
        }], this.id);
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
        }], this.id);
    }
    async onSchemaViewCreate(this: DataGridView, text: string, url: string) {
        var sv = await this.schema.createSchemaView(text, url, this.id);
        await this.onDataGridTurnView(sv.view.id, sv.props);
    }
    async onSchemaViewUpdate(this: DataGridView, viewId: string, data: { text?: string, icon?: IconValueType }) {
        var self = this;
        await self.schema.onSchemaOperate([
            {
                name: 'updateSchemaView',
                id: viewId,
                data: data
            }
        ], this.id);
        self.forceManualUpdate()
        if (this.dataGridTab) {
            await this.dataGridTab.onUpdateTabItems(this);
        }
    }
    async onUpdateSorts(this: DataGridView, sorts: { field: string, sort: number }[]) {
        await this.page.onAction(ActionDirective.onDataGridUpdateSorts, async () => {
            await this.updateProps({ sorts }, BlockRenderRange.self)
        })
    }
    async onUpdateFilter(this: DataGridView, filter: SchemaFilter) {
        await this.page.onAction(ActionDirective.onDataGridUpdateFilter, async () => {
            await this.updateProps({ filter }, BlockRenderRange.self)
        })
    }
    async onAddFilter(this: DataGridView, field: Field) {
        await this.page.onAction(ActionDirective.onDataGridUpdateFilter, async () => {

            var newFilter = SchemaFilterJoin(this.filter, {
                operator: '$isNotNull',
                field: field.id,
            }, this.filter?.logic || "and")
            await this.updateProps({ filter: newFilter }, BlockRenderRange.self)
        });
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
        await this.page.onAction(ActionDirective.onDataGridShowRowNum, async () => {
            // this.page.notifyActionBlockSync(this);
            if (visible == true) await this.arrayPush({ prop: 'fields', data: new ViewField({ type: 'rowNum', colWidth: 80, text: "No." }, this.schema), at: 0 })
            else await this.arrayRemove<ViewField>({ prop: 'fields', data: g => g.type == 'rowNum' });
            await this.updateProps({ showRowNum: visible });
            await this.createItem();
            this.forceManualUpdate();
        })
    }
    async onBreakRow(this: DataGridView, visible: boolean) {
        await this.page.onAction(ActionDirective.onDataGridShowRowNum, async () => {
            // this.page.notifyActionBlockSync(this);
            // if (visible == true) await this.arrayPush({ prop: 'fields', data: new ViewField({ type: 'rowNum', colWidth: 80, text: "No." }, this.schema), at: 0 })
            // else await this.arrayRemove<ViewField>({ prop: 'fields', data: g => g.type == 'rowNum' });
            await this.updateProps({ breakRow: visible }, BlockRenderRange.self);
            await this.createItem();
            this.forceManualUpdate();
        })
    }
    async onShowCheck(this: DataGridView, value: DataGridView['checkRow']) {
        var newFields = this.fields.map(f => f.clone());
        if (value == 'checkbox' && newFields.some(s => s.type == 'check')) return
        else if (value == 'none' && !newFields.some(s => s.type == 'check')) return
        await this.page.onAction(ActionDirective.onDataGridShowCheck, async () => {
            // this.page.notifyActionBlockSync(this);
            await this.updateProps({ checkRow: value }, BlockRenderRange.self);
            if (value == 'checkbox') await this.arrayPush({ prop: 'fields', at: 0, data: new ViewField({ colWidth: 80, type: 'check', text: lst('选择') }, this.schema) })
            else await this.arrayRemove<ViewField>({ prop: 'fields', data: g => g.type == 'check' })
            await this.createItem();
            this.forceManualUpdate();
        })
    }
    async changeFields(this: DataGridView, oldFields: ViewField[], newFields: ViewField[]) {
        await this.manualUpdateProps({ fields: oldFields }, { fields: newFields }, BlockRenderRange.none, { isOnlyRecord: true });
        this.fields = newFields;
    }
    async onChangeFields(this: DataGridView, oldFields: ViewField[], newFields: ViewField[]) {
        await this.page.onAction(ActionDirective.onDataGridChangeFields, async () => {
            await this.changeFields(oldFields, newFields);
            // await this.manualUpdateProps({ fields: oldFields }, { fields: newFields }, BlockRenderRange.self, { isOnlyRecord: true });
            // this.fields = newFields;
            await this.createItem();
            this.forceManualUpdate();
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
    async onListPageIndex(this: DataGridView, index: number) {
        await this.onLoadingAction(async () => {
            this.pageIndex = index;
            await this.loadData();
            this.forceManualUpdate();
            await this.createItem();
            this.referenceBlockers.forEach(b => {
                b.forceManualUpdate();
            })
        })
    }
    async onChangeSize(this: DataGridView, size: number) {
        await this.page.onAction(ActionDirective.onDataGridChangeSize, async () => {
            var totalPage = Math.ceil(this.total / size);
            if (!(this.pageIndex >= 1 && this.pageIndex <= totalPage)) {
                this.pageIndex = 1;
            }
            await this.updateProps({ size }, BlockRenderRange.self);
            await this.onLoadingAction(async () => {
                await this.loadData();
                this.forceManualUpdate();
                await this.createItem();
                await this.onNotifyReferenceBlocks()
            })
        });
    }
    async onSearch(this: DataGridView) {
        await this.onReloadData();
    }
    async onDataGridTool(this: DataGridView, fn: () => Promise<void>) {
        if (this.dataGridTab) {
            await this.dataGridTab.onDataGridTool(fn);
            return;
        }
        try {
            if (this.dataGridTool)
                this.dataGridTool.isOpenTool = true;
            await fn();
        }
        catch (ex) {
            this.page.onError(ex);
        }
        finally {
            if (this.dataGridTool) {
                this.dataGridTool.isOpenTool = false;
                this.onOver(this.getVisibleContentBound().contain(Point.from(this.page.kit.operator.moveEvent)))
            }
        }
    }
    onOver(this: DataGridView, isOver: boolean) {
        if (this.dataGridTool && this.dataGridTool.isOpenTool) return;
        if (!lodash.isEqual(this.isOver, isOver)) {
            this.isOver = isOver;
            if (this.dataGridTool) this.dataGridTool.forceUpdate();
        }
    }
    onCopyViewLink(this: DataGridView) {
        var url = this.page.ws.resolve({ elementUrl: getElementUrl(ElementType.SchemaView, this.schema.id, this.schemaView.id) })
        CopyText(url);
        ShyAlert(lst('视图链接已复制'))
    }
    hasTriggerBlock(this: DataGridView, url: string) {
        return this.page.exists(c => c.url == url && c.refBlockId == this.id)
    }
    async onExtendTriggerBlock(this: DataGridView, url: BlockUrlConstant | string, props: Record<string, any>, visible?: boolean) {
        await this.page.onAction('onExtendTriggerBlock', async () => {
            if (typeof visible == 'boolean') {
                if (visible) {
                    var newBlock = await this.page.createBlock(url, { refBlockId: this.id, ...props }, this.parent, url == BlockUrlConstant.DataGridPage ? (this.at + 1) : this.at, this.parentKey);
                    this.registerReferenceBlocker(newBlock);
                }
                else {
                    var rs = this.page.findAll(g => g.url == BlockUrlConstant.DataGridPage && g.refBlockId == this.id);
                    if (rs) {
                        for (let r of rs) {
                            await r.delete()
                        }
                    }
                }
            }
            else {
                var newBlock: Block = await this.page.createBlock(url,
                    {
                        refBlockId: this.id,
                        ...props
                    },
                    this.parent, this.at, this.parentKey);
                this.registerReferenceBlocker(newBlock);
            }
        })
    }
    async onOpenDataSource(this: DataGridView, event: Rect) {
        var g = await useDataSourceView({ roundArea: event }, {
            page: this.page,
            tableId: this.schema.id,
            viewId: this.syncBlockId,
            selectView: true,
            editTable: true,
            createTable: true
        }, () => {
            this.onDataGridCreate()
        });
        if (g) {
            if (typeof g != 'string' && g.type == 'view') {
                this.onDataGridTurnView(
                    g.viewId,
                    {},
                    g.tableId
                )
            }
        }
    }
    async onReloadData(this: DataGridView, beforeAction?: () => Promise<void>) {
        await this.onLoadingAction(async () => {
            try {
                if (typeof beforeAction == 'function') await beforeAction()
            }
            catch (ex) {
                console.error(ex);
            }
            await this.loadDataGridData();
            await this.createItem();
            this.referenceBlockers.forEach(b => {
                b.forceManualUpdate();
            })
        })
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
            if (await Confirm(lst(`确定删除这些数据吗`))) {
                await this.schema.rowRemoves(ids, this.id);
                this.onReloadData()
                ShyAlert(lst('删除成功'))
            }
        }
        else ShyAlert(lst('请选择删除项'))
    }
    async onBatchEdit(this: DataGridView, viewId?: string) {

    }
    async onImport(this: DataGridView) {

    }
    async onExport(this: DataGridView) {
        await useTableExport(this)
    }
    async onOpenGroupHead(this: DataGridView, dg: GroupHeadType, event: React.MouseEvent) {
        var isHide = this.groupView?.hideGroups?.some(s => lodash.isEqual(s, dg.value));
        var r = await useSelectMenuItem({
            roundArea: Rect.fromEle(event.currentTarget as HTMLElement)
        },
            [{
                text: isHide ? lst('显示分组') : lst('隐藏分组'),
                name: 'hide',
                icon: { name: 'byte', code: isHide ? "preview-open" : 'preview-close-one' }
            }])
        if (r?.item) {
            var gv = lodash.cloneDeep(this.groupView);
            if (!Array.isArray(gv.hideGroups)) gv.hideGroups = [];
            if (!gv.hideGroups.some(s => lodash.isEqual(s, dg.value))) {
                gv.hideGroups.push(dg.value);
            }
            else {
                lodash.remove(gv.hideGroups, s => lodash.isEqual(s, dg.value));
            }
            await this.onUpdateProps({ groupView: gv },
                { range: BlockRenderRange.self }
            );
        }
    }
    getGroupCreateDataProps(this: DataGridView, dg: GroupHeadType) {
        var props: Record<string, any> = {

        }
        if (!dg) return props;
        var gf = this.schema.fields.find(g => g.id == this.groupView.groupId);
        if ([FieldType.creater, FieldType.modifyer, FieldType.user].includes(gf.type)) {
            if (gf.type == FieldType.user) {
                props[gf.name] = lodash.isNull(dg.value) ? null : [dg.value]
            }
        }
        else if ([
            FieldType.date,
            FieldType.createDate,
            FieldType.modifyDate
        ].includes(gf.type)) {
            if (gf.type == FieldType.date) {
                if (this.groupView.by == 'year') {
                    var c = dayjs().year(typeof dg.value == 'number' ? dg.value : parseFloat(dg.text))
                    props[gf.name] = c.toDate();
                }
                else if (this.groupView.by == 'month') {
                    var c = dayjs(dg.value as string, 'YYYY-MM')
                    props[gf.name] = c.toDate();
                }
                else if (this.groupView.by == 'day') {
                    var c = dayjs(dg.value as string, 'YYYY-MM-DD')
                    props[gf.name] = c.toDate();
                }
                else if (this.groupView.by == 'week') {
                    var year = parseInt(dg.text.split('~')[0]);
                    var week = parseInt(dg.text.split('~')[1]);
                    var wd = dayjs().year(year).week(week + 1).startOf('week')
                    props[gf.name] = wd.toDate()
                }
            }
        }
        else if ([FieldType.option, FieldType.options].includes(gf.type)) {
            if (!lodash.isNull(dg.value))
                props[gf.name] = [dg.value]
        }
        else if ([FieldType.number, FieldType.autoIncrement, FieldType.sort, FieldType.price].includes(gf.type)) {
            if ([FieldType.number, FieldType.price].includes(gf.type)) {
                var dv = dg.value as { min: number, max: number }
                if (typeof dv?.min == 'number')
                    props[gf.name] = dv?.min;
            }
        }
        else {
            if ([FieldType.text,
            FieldType.title,
            FieldType.link,
            FieldType.phone,
            FieldType.email,
            FieldType.bool
            ].includes(gf.type))
                props[gf.name] = dg.value;
        }
        return props;
    }
}