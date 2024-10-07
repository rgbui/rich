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
import { Field } from "../../../blocks/data-grid/schema/field";
import { GetFieldTypeSvg } from "../../../blocks/data-grid/schema/util";
import { useSelectMenuItem } from "../../../component/view/menu";
import { MenuItemType } from "../../../component/view/menu/declare";
import { Rect } from "../../common/vector/point";

export class Page$Schema {
    /**
     * 表示数据已提交
     */
    dataSubmitId: string;
    submitedSpread: boolean;
    /**
     * 已经提交的数据总量
     */
    dataSumitTotal: number;
    formRowData: Record<string, any>;
    formUserEmojis: Record<string, string[]> = {};
    formPreRow: Record<string, any>;
    formNextRow: Record<string, any>;
    public isSchemaRecordViewTemplate: boolean;
    /**
     * 基于表单字段的表达式，获取实际的值
     * @param this 
     * @param express 
     * @returns 
     */
    getFormExpress(this: Page, express: string) {
        if (typeof express == 'string' && express.indexOf('{') > -1) {
            if (this.schema && this.formRowData) {
                return express.replace(/(\{[^\}]+\})/g, (a, b) => {
                    if (b) {
                        var fe = this.schema.fields.find(c => c.text == b.slice(1, -1));
                        if (fe) {
                            if (this.formRowData && this.formRowData[fe.name]) {
                                return this.formRowData[fe.name]
                            }
                        }
                    }
                    return a;
                });
            }
        }
        return express;
    }
    async loadPageSchema(this: Page) {
        if (!this.schema) {
            var schema = await TableSchema.loadTableSchema(this.pe.id, this.ws);
            if (schema)
                await schema.cacPermissions()
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
                    var cs: Record<string, any>[] = this.schema.getFormFields(this.isSchemaRecordViewTemplate, this.schemaView?.formType || 'doc').toArray(field => {
                        var r = GetFieldFormBlockInfo(field);
                        if (r) return Object.assign({
                            fieldMode: 'detail'
                        }, r);
                    })
                    if (!cs.includes(g => g.url == BlockUrlConstant.Title))
                        cs.splice(0, 0, { url: BlockUrlConstant.Title, align: this.isForm('doc-add') ? "center" : 'left' })
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
                    if (this.user?.id && sv.formType == 'doc-add') {
                        if (sv.disabledUserMultiple == true) {
                            var re = await this.schema.checkSubmit(this);
                            if (re.ok && re.data.data) {
                                this.formRowData = re.data.data;
                                this.dataSubmitId = this.formRowData.id;
                                this.submitedSpread = false;
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
                        else {
                            var re = await this.schema.checkSubmit(this);
                            if (re.ok) {
                                this.dataSumitTotal = re.data.total;
                                this.submitedSpread = true;
                            }
                        }
                    }
                }
                if (this.pe.type == ElementType.SchemaRecordView) {
                    var sv = this.schema.views.find(g => g.id == this.pe.id1);
                    if (sv.formType == 'doc-add') {
                        var bf = this.find(g => g.url == BlockUrlConstant.Button && (g as BlockButton).isFormSubmit() == true);
                        if (!bf) {
                            var rf = this.findReverse(g => g instanceof OriginFormField);
                            if (rf) {
                                var dc = await BlockFactory.createBlock(BlockUrlConstant.Button, this, {
                                    align: 'center',
                                    buttonText: lst('提交'),
                                    flow: {
                                        commands: [{ url: '/form/submit' }]
                                    }
                                }, rf.parent);
                                var sp = await BlockFactory.createBlock(BlockUrlConstant.TextSpan, this, {}, rf.parent);
                                rf.parentBlocks.insertAt(rf.at + 1, sp);
                                rf.parentBlocks.insertAt(rf.at + 2, dc);
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

        var isAddView = !this.isSchemaRecordViewTemplate && [ElementType.SchemaRecordView].includes(this.pe.type)
        if (isAddView) {
            if (this.schemaView?.formType != 'doc-add') {
                var title = this.find(c => c.url == BlockUrlConstant.Title) as Title;
                if (title) row.title = title.pageInfo.text;
                row.icon = this.formRowData.icon;
                row.cover = this.formRowData.cover;
                row.description = this.formRowData.description;
            }
        }

        util.clearObjectUndefined(row);
        util.clearObjectUndefined(this.formRowData);

        /**
         * 比较初始值，如果一样，说明没有任何修改，返回null
         */
        if (lodash.isEqual(this.formRowData, row) && !(isAddView && row.title)) {
            return null;
        }

        var plain = await this.getPlain();
        if (!(isAddView && this.schemaView?.formType == 'doc-add')) {
            row.plain = plain.slice(0, 200);
            row.thumb = await this.getThumb();
            row.pageContentPreview = await this.getPreviewContent();
        }
        return row;
    }
    clearFormData(this: Page) {
        this.each(g => {
            if (g instanceof OriginFormField) {
                var f = g.field;
                if (f) {
                    // g.value = g.field.getValue(this.formRowData);
                    if (f.type == FieldType.text || f.type == FieldType.title) {
                        g.value = ''
                    }
                    else if ([FieldType.option, FieldType.options].includes(f.type)) {
                        g.value = [];
                    }
                    else if ([FieldType.date].includes(f.type)) {
                        g.value = null;
                    }
                    else if ([FieldType.number, FieldType.price].includes(f.type)) {
                        g.value = null;
                    }
                    else if ([FieldType.bool].includes(f.type)) {
                        g.value = null;
                    }
                    else if ([FieldType.relation].includes(f.type)) {
                        g.value = [];
                    }
                    else if ([FieldType.image, FieldType.file, FieldType.audio, FieldType.video].includes(f.type)) {
                        g.value = [];
                    }
                    g.forceManualUpdate();
                    this.formRowData[f.name] = g.value;
                    if (g.url == '/form/text') {
                        if ((g.el.querySelector('input textarea') as HTMLTextAreaElement))
                            (g.el.querySelector('input textarea') as HTMLTextAreaElement).value = g.value;
                    }
                }
            }
        })
    }
    /**
     * 说明当前表单是基于页面，打开的
     * @param this 
     * @returns 
     */
    isFormPageItem(this: Page) {
        if (this.pe?.type == ElementType.SchemaRecordView && !this.isSchemaRecordViewTemplate) {
            var sv = this.schema.views.find(v => v.id == this.pe.id1);
            if (sv) {
                if (sv.formType == 'doc-add') {
                    if (this.pageInfo?.mime == 110) {
                        return true;
                    }
                }
            }
        }
    }
    /**
     * 判断是否为表单
     * @param this 
     * @param doc  表单类型为：doc, doc-add, doc-detail
     * @returns 
     */
    isForm(this: Page, doc: "doc" | "doc-add" | "doc-detail", isTemplate: boolean = false
    ) {
        if (this.pe?.type == ElementType.SchemaRecordView && (isTemplate == false && !this.isSchemaRecordViewTemplate || isTemplate == true && this.isSchemaRecordViewTemplate)) {
            var sv = this.schema.views.find(v => v.id == this.pe.id1);
            if (sv) {
                if (sv.formType == doc || !sv.formType && doc == 'doc') {
                    return true;
                }
            }
        }
    }
    /**
    * 
    * @param this 
    *  
    * @param status
    * 1. button-save 表示保存数据
    * 2. close-save 表示关闭页面时自动保存数据
    *  
    */
    async onSubmitForm(this: Page, status: 'button-save' | 'close-save') {
        if (this.isCanEdit) {
            if (this.pe.type == ElementType.SchemaData || this.pe.type == ElementType.SchemaRecordViewData) {
                var newRow = await this.getSchemaRow()
                if (newRow && Object.keys(newRow).length > 0) {
                    await this.schema.rowUpdate({ dataId: this.pe.id1, data: newRow }, 'Page.onSubmitForm')
                    this.submitedSpread = false;
                    this.views[0].forceManualUpdate();
                }
            }
            else if (this.pe.type == ElementType.SchemaRecordView) {
                var newRow = await this.getSchemaRow();
                if (this.dataSubmitId) {
                    if (newRow && Object.keys(newRow).length > 0) {
                        await this.schema.rowUpdate({
                            dataId: this.dataSubmitId,
                            data: newRow
                        }, 'Page.onSubmitForm')
                    }
                }
                else if (newRow) {
                    if (status == 'close-save' && this.schemaView?.formType == 'doc-add') return;
                    var r = await this.schema.rowAdd({ data: newRow, pos: { id: undefined, pos: 'after' } }, 'Page.onSubmitForm');
                    if (r) {
                        newRow = r.data;
                        if (this.schemaView?.formType == 'doc-add') {
                            this.dataSumitTotal = (this.dataSumitTotal || 0) + 1;
                            this.submitedSpread = false;
                            this.clearFormData();
                            this.views[0].forceManualUpdate();
                        }
                        var sv = this.schema.views.find(g => g.id == this.pe.id1);
                        if (this.isCanEdit && (sv.formType == 'doc' || !sv.formType))
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

    }
    /**
     * 切换页面的不同展示模式
     * 1. 将对话框 转成页面
     * 2. 将表单转成数据模板管理模式
     * 3. 打开数据记录的上一条，下一条
     * @param this 
     * @param source 
     */
    async onPageViewTurn(this: Page, source: Page['openSource'] | 'next' | 'prev' | 'template' | 'template-back') {
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
        else if (source == 'template-back') {
            var url: '/page/open' | '/page/dialog' | '/page/slide' = '/page/dialog'
            if (this.openSource == 'page') url = '/page/open'
            else if (this.openSource == 'slide') url = '/page/slide'
            await channel.act(url, {
                elementUrl: this.elementUrl,
                config: { wait: false, force: true }
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
                var eurl = getElementUrl(ElementType.SchemaData, this.schema?.id, this.formPreRow.id)
                if (this.pe.type == ElementType.SchemaRecordViewData) {
                    eurl = getElementUrl(ElementType.SchemaRecordViewData, this.schema?.id, this.pe.id1, this.formPreRow.id)
                }
                if (this.formPreRow)
                    await channel.act(url, { elementUrl: eurl, config: { wait: false, force: true } })
            }
            else if (source == 'next') {
                var eurl = getElementUrl(ElementType.SchemaData, this.schema?.id, this.formNextRow.id)
                if (this.pe.type == ElementType.SchemaRecordViewData) {
                    eurl = getElementUrl(ElementType.SchemaRecordViewData, this.schema?.id, this.pe.id1, this.formNextRow.id)
                }
                if (this.formNextRow)
                    await channel.act(url, { elementUrl: eurl, config: { wait: false, force: true } })
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
    async onOpenFormMenu(this: Page, event: React.MouseEvent) {
        var self = this;
        var view = this.schema.recordViews.find(g => g.id == this.pe.id1)
        // var viewType = this.getPageSchemaRecordType();
        if (view && !view?.formType) view.formType = 'doc';
        var r = await useSelectMenuItem(
            { roundArea: Rect.fromEvent(event) },
            [
                {
                    icon: { name: 'bytedance-icon', code: 'one-key' },
                    name: 'disabledUserMultiple',
                    text: lst('仅允许提交一次'),
                    type: MenuItemType.switch,
                    checked: view?.disabledUserMultiple,
                    visible: view?.formType == 'doc-add' ? true : false
                },
                {
                    name: 'editForm',
                    icon: { name: 'bytedance-icon', code: 'arrow-right-up' },
                    text: lst('编辑模板'),
                    visible: view?.formType == 'doc' && !this.isSchemaRecordViewTemplate
                },
                {
                    type: MenuItemType.gap,
                    visible: view?.formType == 'doc-add' || view?.formType == 'doc' && !this.isSchemaRecordViewTemplate ? true : false
                },
                { text: lst('显示字段'), type: MenuItemType.text },
                ...this.schema.getFormFields(this.isSchemaRecordViewTemplate ? true : false, view?.formType || 'doc').toArray(uf => {
                    return {
                        icon: GetFieldTypeSvg(uf),
                        name: uf.id,
                        text: uf.text,
                        type: MenuItemType.switch,
                        checked: this.exists(c => (c instanceof OriginFormField) && c.field?.id == uf.id)
                    }
                }),
                { type: MenuItemType.divide },
                {
                    name: 'hidePropTitle',
                    type: MenuItemType.switch,
                    visible: view?.formType == 'doc' ? false : true,
                    checked: this.findAll(g => g instanceof OriginFormField).every(c => (c as OriginFormField).hidePropTitle == true),
                    icon: { name: 'bytedance-icon', code: 'tag-one' },
                    text: lst('隐藏字段文本')
                },
                { type: MenuItemType.divide },
                {
                    name: 'hideAllFields',
                    icon: { name: 'byte', code: 'clear-format' },
                    text: lst('隐藏所有字段')
                },
                { type: MenuItemType.divide },
                {
                    text: lst('了解如何设置数据表记录页面'),
                    type: MenuItemType.help,
                    url: window.shyConfig?.isUS ? "https://help.shy.red/page/42#vQh5qaxCEC3aPjuFisoRh5" : "https://help.shy.live/page/1870#3Fgw3UNGQErf8tZdJnhjru"
                }
            ],
            {
                input: async (newItem) => {
                    if (['disabledUserMultiple', 'allowAnonymous'].includes(newItem.name)) {
                        self.onChangeSchemaView(view.id, { [newItem.name]: newItem.checked })
                    }
                    else if (newItem.name == 'hidePropTitle') {
                        self.onAction('hideAllFields', async () => {
                            var fs = self.findAll(c => (c instanceof OriginFormField));
                            var isHide = (fs[0] as OriginFormField)?.hidePropTitle ? false : true
                            for (let f of fs) {
                                await f.updateProps({ hidePropTitle: isHide }, BlockRenderRange.self)
                            }
                        })
                    }
                    else self.onToggleFieldView(this.schema.allowFormFields.find(g => g.id == newItem.name), newItem.checked)
                }
            }
        )
        if (r) {
            if (r.item.name == 'editForm') {
                self.onPageViewTurn('template');
            }
            else if (r.item.name == 'hideAllFields') {
                self.onAction('hideAllFields', async () => {
                    var fs = self.findAll(c => (c instanceof OriginFormField));
                    for (let f of fs) {
                        await f.delete()
                    }
                })
            }
            else if (r.item.name == 'hidePropTitle') {
                self.onAction('hideAllFields', async () => {
                    var fs = self.findAll(c => (c instanceof OriginFormField));
                    for (let f of fs) {
                        await f.updateProps({ hidePropTitle: true }, BlockRenderRange.self)
                    }
                })
            }
            else if (r.item.name == 'viewDisplay') {
                await this.onTurnForm(r.item.value);
            }
            else if (this.schema.fields.some(s => s.id == r.item.name)) {
                var sf = this.schema.fields.find(s => s.id == r.item.name);
                this.onToggleFieldView(sf, r.item.checked)
            }
        }
    }
    async onToggleFieldView(this: Page, field: Field, checked: boolean) {
        await this.onAction('onToggleFieldView', async () => {
            if (checked) {
                var b = GetFieldFormBlockInfo(field);
                if (b) {
                    var view = this.views[0];
                    var at = view.childs.length;
                    if (this.schemaView?.formType == 'doc-add') {
                        var bf = this.find(g => g.url == BlockUrlConstant.Button && (g as BlockButton).isFormSubmit() == true);
                        if (field.type != FieldType.title) {
                            if (bf) at = bf.at;
                        }
                        else {
                            var pageTitle = this.find(g => g.url == BlockUrlConstant.Title);
                            if (pageTitle) {
                                at = pageTitle.at + 1;
                            }
                        }
                    }
                    var newBlock = await this.createBlock(b.url, b, view, at);
                    if (this.formRowData)
                        await newBlock.updateProps({ value: field.getValue(this.formRowData) }, BlockRenderRange.self)
                }
            }
            else {
                var f = this.find(c => (c instanceof OriginFormField) && c.field.id == field.id);
                if (f) await f.delete()
            }
        });
    }
}