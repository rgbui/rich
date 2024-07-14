import lodash from "lodash";
import { Page } from "..";
import { OriginFormField } from "../../../blocks/data-grid/element/form/origin.field";
import { GetFieldFormBlockInfo } from "../../../blocks/data-grid/element/service";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { FieldType } from "../../../blocks/data-grid/schema/type";
import { DataGridView } from "../../../blocks/data-grid/view/base";
import { channel } from "../../../net/channel";
import { ElementType, getElementUrl } from "../../../net/element.type";
import { BlockUrlConstant } from "../../block/constant";
import { BlockFactory } from "../../block/factory/block.factory";
import { BlockButton } from "../../../blocks/interaction/button";
import { Title } from "../../../blocks/interaction/title";
import { lst } from "../../../i18n/store";
import { Block } from "../../block";
import { BlockRenderRange } from "../../block/enum";
import { util } from "../../../util/util";

export class Page$Schema {
    /**
     * 表示数据已提交
     */
    dataSubmitId: string;
    formRowData: Record<string, any>;
    formUserEmojis: Record<string, string[]> = {};
    formPreRow: Record<string, any>;
    formNextRow: Record<string, any>;
    schema: TableSchema;
    public isSchemaRecordViewTemplate: boolean
    async loadPageSchema(this: Page) {
        if (!this.schema) {
            this.schema = await TableSchema.loadTableSchema(this.pe.id, this.ws);
            if (this.schema)
                await this.schema.cacPermissions()
        }
        if (this.schema) {
            if (this.pe.type == ElementType.Schema || this.pe.type == ElementType.SchemaView) {
                if (!this.exists(g => g instanceof DataGridView)) {
                    var view = this.pe.type == ElementType.Schema ? this.schema.listViews.first() : this.schema.listViews.find(g => g.id == this.pe.id1);
                    if (!view) {
                        view = this.schema.listViews.first();
                    }
                    var dc = await BlockFactory.createBlock(view.url, this, {
                        schemaId: this.schema.id,
                        syncBlockId: view.id,
                    }, this.views.first());
                    this.views.first().blocks.childs.push(dc);
                }
            }
            else {
                if (this.loadedDefaultData == true) {
                    var cs: Record<string, any>[] = this.schema.allowFormFields.toArray(field => {
                        if (field?.type == FieldType.title && (this.pe.type == ElementType.SchemaData || this.pe.type == ElementType.SchemaRecordView || this.pe.type == ElementType.SchemaRecordViewData)) return undefined;
                        var r = GetFieldFormBlockInfo(field);
                        if (r) return Object.assign({
                            fieldMode: 'detail'
                        }, r);
                    })
                    cs.splice(0, 0, { url: BlockUrlConstant.Title })
                    this.views = [];
                    await this.loadViews({ views: [{ url: BlockUrlConstant.View, blocks: { childs: cs } }] })
                    this.loadedDefaultData = false;
                }
                if (this.pe.type == ElementType.SchemaData || this.pe.type == ElementType.SchemaRecordViewData) {
                    var r = this.find(g => (g as OriginFormField).field?.name == 'title');
                    if (r) {
                        lodash.remove(r.parentBlocks, g => g == r);
                    }
                    var rg = await this.schema.rowGetPrevAndNext(this.pe.type == ElementType.SchemaRecordViewData ? this.pe.id2 : this.pe.id1, this.ws);
                    if (rg) {
                        this.formRowData = lodash.cloneDeep(rg.data.data);
                        this.formPreRow = lodash.cloneDeep(rg.data.prev);
                        this.formNextRow = lodash.cloneDeep(rg.data.next);
                        this.each(g => {
                            if (g instanceof OriginFormField) {
                                var f = g.field;
                                if (f) {
                                    g.value = g.field.getValue(this.formRowData);
                                }
                            }
                        })
                    }
                }
                else if (this.pe.type == ElementType.SchemaRecordView && !this.isSchemaRecordViewTemplate) {
                    var sv = this.schema.views.find(g => g.id == this.pe.id1);
                    if (sv.formType != 'doc-add') {
                        var r = this.find(g => (g as OriginFormField).field?.name == 'title');
                        if (r) {
                            lodash.remove(r.parentBlocks, g => g == r);
                        }
                    }
                    if (this.user?.id) {

                        if (sv.disabledUserMultiple == true) {
                            var re = await this.schema.checkSubmit(this);
                            if (re.ok && re.data.data) {
                                this.formRowData = re.data.data;
                                this.dataSubmitId = this.formRowData.id;
                                this.each(g => {
                                    if (g instanceof OriginFormField) {
                                        var f = g.field;
                                        if (f) {
                                            g.value = g.field.getValue(this.formRowData);
                                        }
                                    }
                                })
                            }
                        }
                    }
                }
                if (typeof this.formRowData == 'undefined') {
                    this.formRowData = {};
                }
                if (typeof this.openPageData?.formData != 'undefined') Object.assign(this.formRowData, this.openPageData.formData)
                this.each(g => {
                    if (g instanceof OriginFormField) {
                        var f = g.field;
                        if (f) {
                            this.formRowData[f.name] = g.value;
                        }
                    }
                })
            }
            var fs = this.schema.fields.findAll(g => [FieldType.like, FieldType.oppose, FieldType.love].includes(g.type))
            if (this.formRowData && this.formRowData.id) {
                var es = fs.map(f => {
                    return getElementUrl(ElementType.SchemaFieldNameData, this.schema.id, f.name, this.formRowData.id)
                })
                if (es.length > 0) {
                    var rgc = await channel.get('/user/interactives',
                        {

                            schemaId: this.schema?.id,
                            ids: [this.formRowData.id],
                            ws: this.ws,
                            es: es
                        });
                    if (rgc.ok) {
                        this.formUserEmojis = rgc.data.list;
                        this.forceUpdate();
                    }
                }

            }
            this.formRowData = lodash.cloneDeep(this.formRowData);
        }
    }
    async getSchemaRow(this: Page) {
        var row: Record<string, any> = {};
        this.each(g => {
            if (g instanceof OriginFormField) {
                var f = g.field;
                if (f) {
                    row[f.name] = g.value;
                }
            }
        })

        if (!this.isSchemaRecordViewTemplate && [ElementType.SchemaRecordView].includes(this.pe.type)) {
            var title = this.find(c => c.url == BlockUrlConstant.Title) as Title;
            if (title) row.title = title.pageInfo.text;
            row.icon = this.formRowData.icon;
            row.cover = this.formRowData.cover;
            row.description = this.formRowData.description;
        }

        util.clearObjectUndefined(row);
        util.clearObjectUndefined(this.formRowData);
        
        /**
         * 比较初始值，如果一样，说明没有任何修改，返回null
         */
        if (lodash.isEqual(this.formRowData, row)) {
            return null;
        }

        var plain = await this.getPlain();
        row.plain = plain.slice(0, 200);
        row.thumb = await this.getThumb();
        row.pageContentPreview = await this.getPreviewContent();
        return row;
    }
    /**
    * 
    * @param this 
    *  
    *  
    */
    async onSubmitForm(this: Page) {
        if (this.pe.type == ElementType.SchemaData || this.pe.type == ElementType.SchemaRecordViewData) {
            var newRow = await this.getSchemaRow()
            console.log('newRow', newRow);
            if (newRow && Object.keys(newRow).length > 0) {
                await this.schema.rowUpdate({ dataId: this.pe.id1, data: newRow }, 'Page.onSubmitForm')
            }
        }
        else if (this.pe.type == ElementType.SchemaRecordView) {
            var newRow = await this.getSchemaRow();
            if (this.dataSubmitId) {
                if (newRow && Object.keys(newRow).length > 0) {
                    await this.schema.rowUpdate({ dataId: this.dataSubmitId, data: newRow }, 'Page.onSubmitForm')
                }
            }
            else if (newRow) {
                var r = await this.schema.rowAdd({ data: newRow, pos: { id: undefined, pos: 'after' } }, 'Page.onSubmitForm');
                if (r) {
                    newRow = r.data;
                    var sv = this.schema.views.find(g => g.id == this.pe.id1);
                    if (this.isCanEdit && sv.formType != 'doc-add')
                        await channel.act('/view/snap/store',
                            {
                                elementUrl: getElementUrl(ElementType.SchemaData,
                                    this.schema.id,
                                    newRow.id
                                ),
                                seq: 0,
                                plain: await this.getPlain(),
                                thumb: await this.getThumb(),
                                content: await this.getString(),
                                text: newRow.title,
                            }
                        )
                }
            }
        }
    }
    /**
     * 切换页面的不同展示模式
     * 1. 将对话框 转成页面
     * 2. 将表单转成数据模板管理模式
     * 3. 打开数据记录的上一条，下一条
     * @param this 
     * @param source 
     */
    async onPageViewTurn(this: Page, source: Page['openSource'] | 'next' | 'prev' | 'template') {
        /**
         * 这个表示将当前对话框模式，
         * 转变成页面模板
         */
        if (source == 'page') {
            await channel.act('/page/open', { elementUrl: this.elementUrl, config: { force: true, wait: false } });
            this.onPageClose();
        }
        /**
         * 这个表示将当前表单 转变成 数据模板管理模式
         * 
         */
        else if (source == 'template') {
            var url: '/page/open' | '/page/dialog' | '/page/slide' = '/page/dialog'
            if (this.openSource == 'page') url = '/page/open'
            else if (this.openSource == 'slide') url = '/page/slide'
            await channel.act(url, {
                elementUrl: this.elementUrl,
                config: { wait: false, force: true, isTemplate: true }
            })
        }
        else {
            /**
             * 这个表示当前数据记录的上一条，下一条
             */
            var url: '/page/open' | '/page/dialog' | '/page/slide' = '/page/dialog'
            if (this.openSource == 'page') url = '/page/open'
            else if (this.openSource == 'slide') url = '/page/slide'
            if (source == 'prev') {
                if (this.formPreRow)
                    await channel.act(url, { elementUrl: getElementUrl(ElementType.SchemaData, this.schema?.id, this.formPreRow.id), config: { wait: false, force: true } })
            }
            else if (source == 'next') {
                if (this.formNextRow)
                    await channel.act(url, { elementUrl: getElementUrl(ElementType.SchemaData, this.schema?.id, this.formNextRow.id), config: { wait: false, force: true } })
            }
        }
    }

    /**
     * 判断当前页面在数据表中是什么类型
     * add 表单，添加新数据（需要指定模板）
     * template-edit 记录页面，按指定的模板显示
     * origin-edit 记录页面，按在首次添加数据时，保存的页面显示
     * template 模板页面，用于管理设置模板
     */
    getPageSchemaRecordType(this: Page) {
        var viewType: "add-data" | 'data-template-edit' | 'data-origin-edit' | 'template' = null;
        if (this.pe.type == ElementType.SchemaData) {
            viewType = 'data-origin-edit'
        }
        else if (this.pe.type == ElementType.SchemaRecordViewData) {
            viewType = 'data-template-edit'
        }
        else if (this.pe.type == ElementType.SchemaRecordView) {
            if (this.isSchemaRecordViewTemplate) {
                viewType = 'template'
            }
            else viewType = 'add-data'
        }
        return viewType;
    }
    async onTurnForm(this: Page, value: 'doc' | 'doc-add' | 'doc-detail') {
        var self = this;
        await this.onAction('onTurnForm', async () => {
            var sv = this.schema.views.find(g => g.id == this.pe.id1);
            if (sv) sv.formType = value;
            var fs = this.findAll(g => g instanceof OriginFormField) as OriginFormField[];
            for (let i = 0; i < fs.length; i++) {
                var off = fs[i];
                this.notifyActionBlockUpdate(off)
            }
            if (value == 'doc-add') {
                var title = self.find(g => g.url == BlockUrlConstant.Title) as Title;
                await title.updateProps({ align: 'center' }, BlockRenderRange.self)
                var button = self.find(g => g.url == BlockUrlConstant.Button && (g as BlockButton).isFormSubmit() == true) as BlockButton;
                if (!button) {
                    var last: Block = self.findReverse(g => (g instanceof OriginFormField));
                    if (!last) {
                        last = self.views[0].childs.last();
                    }
                    if (last) {
                        await last.visibleDownCreateBlock(BlockUrlConstant.Button, {
                            align: 'center',
                            buttonText: lst('提交'),
                            flow: {
                                commands: [{ url: '/form/submit' }]
                            }
                        });
                    }
                }
                var r = GetFieldFormBlockInfo(this.schema.fields.find(c => c.type == FieldType.title));
                await title.visibleDownCreateBlock(r.url, { ...r, fieldMode: 'detail' });
            }
            else {
                var title = self.find(g => g.url == BlockUrlConstant.Title) as Title;
                await title.updateProps({ align: 'left' }, BlockRenderRange.self)
                var button = self.find(g => g.url == BlockUrlConstant.Button && (g as BlockButton).isFormSubmit() == true) as BlockButton;
                if (button) await button.delete();
                var tf = this.schema.fields.find(c => c.type == FieldType.title);
                var titleFormField = self.find(g => g instanceof OriginFormField && g.fieldId == tf.id) as Title;
                if (titleFormField) await titleFormField.delete();
            }
            await this.schema.onSchemaOperate([{
                name: 'updateSchemaView',
                id: this.pe.id1,
                data: { formType: value }
            }], 'Page.onTurnForm')
        })
    }
    async onChangeSchemaView(this: Page, viewId: string, props) {
        var view = this.schema.views.find(g => g.id == viewId);
        if (view) {
            this.schema.onSchemaOperate([{ name: 'updateSchemaView', id: view.id, data: props }], "Page.onChangeSchemaView")
        }
    }
}