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

export class Page$Schema {
    formRowData: Record<string, any>;
    formUserEmojis: Record<string, string[]> = {};
    formPreRow: Record<string, any>;
    formNextRow: Record<string, any>;
    schema: TableSchema;
    public isSchemaRecordViewTemplate: boolean
    async loadPageSchema(this: Page) {
        if (!this.schema) {
            this.schema = await TableSchema.loadTableSchema(this.pe.id, this.ws);
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
                if (this.loadDefault == true) {
                    var cs: Record<string, any>[] = this.schema.allowFormFields.toArray(field => {
                        if (field?.type == FieldType.title && this.isSchemaRecordViewTemplate) return undefined;
                        var r = GetFieldFormBlockInfo(field);
                        if (r) return Object.assign({
                            fieldMode: 'detail'
                        }, r);
                    })
                    cs.splice(0, 0, { url: BlockUrlConstant.Title })
                    this.views = [];
                    await this.loadViews({ views: [{ url: BlockUrlConstant.View, blocks: { childs: cs } }] })
                    this.loadDefault = false;
                }
                if (!this.isSchemaRecordViewTemplate) {
                    var r = this.find(g => (g as OriginFormField).field?.name == 'title');
                    if (r) {
                        lodash.remove(r.parentBlocks, g => g == r);
                    }
                }
                if (this.pe.type == ElementType.SchemaData || this.pe.type == ElementType.SchemaRecordViewData) {
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
            var es = fs.map(f => {
                return getElementUrl(ElementType.SchemaFieldNameData, this.schema.id, f.name, this.formRowData.id)
            })
            if (this.formRowData) {
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
        /**
         * 比较初始值，如果一样，说明没有任何修改，返回null
         */
        if (lodash.isEqual(this.formRowData, row) && !this.pageModifiedOrNot) {
            return null;
        }
        row.icon = this.formRowData.icon;
        row.cover = this.formRowData.cover;
        row.title = this.formRowData.title;
        row.plain = await this.getPlain();
        row.plain = row.plain.slice(0, 200);
        row.thumb = await this.getThumb();
        return row;
    }
     /**
     * 
     * @param this 
     * @param options {
     *   isClose:是否关闭页面
     *   isFormBlank:是否清空表单
     * }
     */
     async onSubmitForm(this: Page, options?: { isClose?: boolean, isFormMargin?: boolean }) {
        if (this.pe.type == ElementType.SchemaData) {
            this.onPageSave();
            var newRow = await this.getSchemaRow()
            if (this.isCanEdit && newRow && Object.keys(newRow).length > 0) {
                await this.schema.rowUpdate({ dataId: this.pe.id1, data: newRow })
            }
        }
        else if (this.pe.type == ElementType.SchemaRecordView) {
            var newRow = await this.getSchemaRow();
            if (newRow) {
                var r = await this.schema.rowAdd({ data: newRow, pos: { id: undefined, pos: 'after' } });
                if (r.ok) {
                    newRow = r.data.data;
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
                        })
                }
            }
        }
        if (options?.isClose)
            this.onPageClose()
    }
    async onFormOpen(this: Page, source: Page['openSource'] | 'next' | 'prev' | 'template') {
        if (source == 'page') {
            await channel.air('/page/open', { elementUrl: this.elementUrl, config: { force: true, wait: false } });
            this.onPageClose();
        }
        else if (source == 'template') {
            var url: '/page/open' | '/page/dialog' | '/page/slide' = '/page/dialog'
            if (this.openSource == 'page') url = '/page/open'
            else if (this.openSource == 'slide') url = '/page/slide'
            await channel.air(url, {
                elementUrl: this.elementUrl,
                config: { wait: false, force: true, isTemplate: true }
            })
        }
        else {
            var url: '/page/open' | '/page/dialog' | '/page/slide' = '/page/dialog'
            if (this.openSource == 'page') url = '/page/open'
            else if (this.openSource == 'slide') url = '/page/slide'
            if (source == 'prev') {
                if (this.formPreRow)
                    await channel.air(url, { elementUrl: getElementUrl(ElementType.SchemaData, this.schema?.id, this.formPreRow.id), config: { wait: false, force: true } })
            }
            else if (source == 'next') {
                if (this.formNextRow)
                    await channel.air(url, { elementUrl: getElementUrl(ElementType.SchemaData, this.schema?.id, this.formNextRow.id), config: { wait: false, force: true } })
            }
        }
    }
    formType: 'doc' | 'doc-add' | 'doc-detail' = 'doc';
    /**
     * 判断当前页面在数据表中是什么类型
     * add 表单，添加新数据（需要指定模板）
     * template-edit 记录页面，按指定的模板显示
     * origin-edit 记录页面，按在首次添加数据时，保存的页面显示
     * template 模板页面，用于管理设置模板
     */
    getPageSchemaRecordType(this: Page) {
        var viewType: "add" | 'template-edit' | 'origin-edit' | 'template' = null;
        if (this.pe.type == ElementType.SchemaData) {
            viewType = 'origin-edit'
        }
        else if (this.pe.type == ElementType.SchemaRecordViewData) {
            viewType = 'template-edit'
        }
        else if (this.pe.type == ElementType.SchemaRecordView) {
            if (this.isSchemaRecordViewTemplate) {
                viewType = 'template'
            }
            else viewType = 'add'
        }
        return viewType;
    }
    async onTurnForm(this: Page, value: 'doc' | 'doc-add' | 'doc-detail') {
        var self = this;
        await this.onAction('onTurnForm', async () => {
            var fs = this.findAll(g => g instanceof OriginFormField) as OriginFormField[];
            for (let i = 0; i < fs.length; i++) {
                var off = fs[i];
                await off.turnForm(value);
            }
            if (value == 'doc-add') {
                var title = self.find(g => g.url == BlockUrlConstant.Title) as Title;
                await title.updateProps({ align: 'center' })
                var button = self.find(g => g.url == BlockUrlConstant.Button && (g as BlockButton).isFormSubmit() == true) as BlockButton;
                if (!button) {
                    var last: Block = self.findReverse(g => (g instanceof OriginFormField));
                    if (!last) {
                        last = self.views[0].childs.last();
                    }
                    if (last) {
                        await last.visibleDownCreateBlock(BlockUrlConstant.Button, {
                            align: 'center',
                            buttonText: lst('提交') + this.getPageDataInfo()?.text,
                            flow: {
                                commands: [{ url: '/form/submit' }]
                            }
                        });
                    }
                }
            }
            else {
                var button = self.find(g => g.url == BlockUrlConstant.Button && (g as BlockButton).isFormSubmit() == true) as BlockButton;
                if (button) await button.delete();
            }
            await this.updateProps({ formType: value })
        })
    }
    async onChangeSchemaView(this: Page, viewId: string, props) {
        var view = this.schema.views.find(g => g.id == viewId);
        if (view) {
            this.schema.onSchemaOperate([{ name: 'updateSchemaView', id: view.id, data: props }])
        }
    }
}