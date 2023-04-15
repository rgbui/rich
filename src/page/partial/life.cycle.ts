import ReactDOM from "react-dom";
import { Page } from "..";
import { langProvider } from "../../../i18n/provider";
import { Block } from "../../block";
import { View } from "../../block/element/view";
import { BlockFactory } from "../../block/factory/block.factory";
import { UserAction } from "../../history/action";
import { ActionDirective, OperatorDirective } from "../../history/declare";
import { PageDirective } from "../directive";
import { PageHistory } from "../interaction/history";
import { PageKeys } from "../interaction/keys";
import JSZip from 'jszip';
import { BlockUrlConstant } from "../../block/constant";
import { PageLayoutType } from "../declare";
import { GridMap } from "../grid";
import { Matrix } from "../../common/matrix";
import lodash from "lodash";
import { util } from "../../../util/util";
import { PageOutLine } from "../../../blocks/page/outline";
import { channel } from "../../../net/channel";
import { ElementType, parseElementUrl } from "../../../net/element.type";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { GetFieldFormBlockInfo, SchemaCreatePageFormData } from "../../../blocks/data-grid/element/service";
import { OriginFormField } from "../../../blocks/data-grid/element/form/origin.field";
import { Field } from "../../../blocks/data-grid/schema/field";
import { DataGridView } from "../../../blocks/data-grid/view/base";
import { QueueHandle } from "../../../component/lib/queue";

export class Page$Cycle {
    async init(this: Page) {
        this.gridMap = new GridMap(this);
        PageHistory(this, this.snapshoot);
        PageKeys(this, this.keyboardPlate);
        this.emit(PageDirective.init);
        await langProvider.import();
    }
    async onReplace(this: Page, itemId: string, content: any, operates?: any) {
        await this.clear();
        await this.load(content);
        if (Array.isArray(operates) && operates.length > 0) {
            var operates = operates.map(op => op.operate ? op.operate : op) as any;
            await this.syncUserActions(operates, 'load');
        }
        await this.onAction(ActionDirective.onPageUpdateProps, async () => {
            await this.updateProps({ sourceItemId: itemId });
        });
    }
    async clear(this: Page) {
        this.views = [];
    }
    async load(this: Page, data?: Record<string, any>) {
        try {
            if (!data || typeof data == 'object' && Object.keys(data).length == 0) {
                //这里加载默认的页面数据
                data = await this.getDefaultData();
            }
            else this.requireSelectLayout = false;
            await this.emit(PageDirective.loading);
            for (var n in data) {
                if (n == 'views') continue;
                else if (n == 'matrix') {
                    this.matrix = new Matrix(...data[n]);
                }
                else this[n] = util.clone(data[n]);
            }
            if (Array.isArray(data.views)) {
                for (var i = 0; i < data.views.length; i++) {
                    var dv = data.views[i];
                    var dc = await BlockFactory.createBlock(dv.url, this, dv, null);
                    this.views.push(dc as View);
                }
            }
            if (typeof this.pageLayout == 'undefined') this.pageLayout = Object.assign(this.pageLayout || {}, { type: PageLayoutType.doc });
            if ([
                PageLayoutType.dbForm,
                PageLayoutType.dbPickRecord
            ].some(s => s == this.pageLayout.type)) {
                this.requireSelectLayout = false;
            }
            if ([PageLayoutType.db].some(s => s == this.pageLayout.type) && !this.exists(g => g instanceof DataGridView)) {
                await this.loadDefaultScheamView();
            }
            await this.onRepair();
            await this.emit(PageDirective.loaded);
        }
        catch (ex) {
            this.onError(ex);
            console.error(ex);
            console.log(JSON.stringify(data));
        }
    }
    async reload(this: Page, data?: Record<string, any>) {
        this.views = [];
        for (var n in data) {
            if (n == 'views') continue;
            else if (n == 'matrix') {
                this.matrix = new Matrix(...data[n]);
            }
            else this[n] = util.clone(data[n]);
        }
        if (Array.isArray(data.views)) {
            for (var i = 0; i < data.views.length; i++) {
                var dv = data.views[i];
                var dc = await BlockFactory.createBlock(dv.url, this, dv, null);
                this.views.push(dc as View);
            }
        }
        if (typeof this.pageLayout == 'undefined') this.pageLayout = Object.assign(this.pageLayout, { type: PageLayoutType.doc });
        if ([
            PageLayoutType.dbForm,
            PageLayoutType.dbPickRecord,
        ].some(s => s == this.pageLayout.type)) {
            this.requireSelectLayout = false;
        }
        if ([PageLayoutType.db].some(s => s == this.pageLayout.type) && !this.exists(g => g instanceof DataGridView)) {
            await this.loadDefaultScheamView();
        }
        await this.onRepair();
    }
    async syncUserActions(this: Page, actions: UserAction[], source: 'load' | 'notify' | 'notifyView') {
        await this.onAction(ActionDirective.onLoadUserActions, async () => {
            for (let i = 0; i < actions.length; i++) {
                let action = actions[i];
                try {
                    await this.snapshoot.redoUserAction(action, source);
                }
                catch (ex) {
                    this.onError(ex);
                }
            }
        })
        await this.onRepair();
    }
    async get(this: Page) {
        var json: Record<string, any> = {
            id: this.id,
            date: this.date,
            cover: util.clone(this.cover),
            isFullWidth: this.isFullWidth,
            smallFont: this.smallFont,
            version: this.version,
            sourceItemId: this.sourceItemId,
            loadElementUrl: this.customElementUrl
        };
        json.requireSelectLayout = this.requireSelectLayout;
        json.onlyDisplayContent = this.onlyDisplayContent;
        json.pageLayout = util.clone(this.pageLayout);
        json.matrix = this.matrix.getValues();
        json.nav = this.nav;
        json.autoRefPages = this.autoRefPages;
        json.views = await this.views.asyncMap(async x => {
            return await x.get()
        })
        json.addedSubPages = this.addedSubPages.map(s => s);
        return json;
    }
    async getString(this: Page) {
        return JSON.stringify(await this.get());
    }
    async getFile(this: Page) {
        var zip = new JSZip();
        zip.file("page.shy", JSON.stringify(await this.get()));
        var zipFile = await zip.generateAsync({
            type: 'blob',
            compression: "DEFLATE" // <-- here 
        });
        return zipFile;
    }
    async getPlain(this: Page) {
        return (await this.views.asyncMap(async v => await v.getPlain())).join(" ");
    }
    async loadFile(this: Page, blob: Blob) {
        if (blob) {
            var zip = new JSZip();
            var rj = await zip.loadAsync(blob);
            var str = await rj.file('page.shy').async("string");
            var content = JSON.parse(str);
            await this.load(content);
        }
        else await this.load()
    }
    async getDefaultData(this: Page) {
        if (this.pageLayout?.type == PageLayoutType.docCard) {
            var g = await import('../template/doc.cards');
            return g.data;
        }
        var r = await import("../template/default.page");
        return r.data;
    }
    async loadDefaultData(this: Page) {
        var data = await this.getDefaultData();
        await this.load(data);
    }
    async loadDefaultScheamView(this: Page) {
        this.schema = await TableSchema.loadTableSchema(this.pageInfo.id);
        var view = this.schema.views.first();
        var dc = await BlockFactory.createBlock(view.url, this, {
            schemaId: this.schema.id,
            syncBlockId: view.id,
        }, this.views.first());
        this.views.first().blocks.childs.push(dc);
    }
    onSave(this: Page) {
        this.emit(PageDirective.save);
    }
    onClose(this: Page) {
        this.emit(PageDirective.close);
    }
    private willUpdateAll: boolean = false;
    private willUpdateBlocks: Block[];
    private willLayoutBlocks: Block[];
    private updatedFns: (() => Promise<void>)[] = [];
    get hasUpdate() {
        return this.willUpdateBlocks.length > 0 || this.willUpdateAll;
    }
    addPageUpdate() {
        this.willUpdateAll = true;
    }
    addBlockUpdate(block: Block) {
        if (this.willUpdateBlocks) {
            var pa = this.willUpdateBlocks.find(g => g.contains(block));
            if (!pa) this.willUpdateBlocks.push(block);
        }
    }
    addBlockClearLayout(block: Block) {
        if (this.willLayoutBlocks && !this.willLayoutBlocks.exists(block))
            this.willLayoutBlocks.push(block);
    }
    /**
     * 绑定更新后触发的事件
     * @param fn 
     */
    addUpdateEvent(fn: () => Promise<void>) {
        this.updatedFns.push(fn);
    }
    /**
     * 触发需要更新的view,
     * 这个可以手动触发多次
     */
    private notifyUpdateBlock(this: Page) {
        var ups = this.willUpdateBlocks.map(c => c);
        var fns = this.updatedFns.map(f => f);
        this.willUpdateBlocks = [];
        this.updatedFns = [];
        var self = this;
        var fn = async function () {
            try {
                if (self.willUpdateAll) { self.willUpdateAll = false; await self.forceUpdate(); }
                else await ups.eachAsync(async (up) => {
                    await up.forceUpdate();
                })
            }
            catch (ex) {
                console.error(ex);
                self.onError(ex);
            }
            await fns.eachAsync(async g => await g());
            try {
                self.onNotifyChanged()
            }
            catch (ex) {
                console.error(ex);
                self.onError(ex);
            }
        }
        fn()
    }
    /**
     * 对于将要删除的块
     * 这里触发通知事件
     * 这里不做任何的复杂的耗时操作，
     * 避免阻塞正常的删除的交互操作
     * @param this 
     * @param block 
     */
    async onNotifyWillRemove(this: Page, block: Block) {
        var predict = (g) => g.url == BlockUrlConstant.Text && (g.asTextContent.link ? true : false) && g.asTextContent.link.name == 'page';
        var deleteBlocks: string[] = [];
        if (block.exists(predict, true)) {
            var rs = block.findAll(predict, true);
            deleteBlocks = rs.map(r => r.id);
        }
        var cs: {
            rowBlockId: string;
            text: string;
        }[] = [];
        if (block.isLine) {
            var rowBlock = block.closest(x => x.isBlock);
            if (rowBlock.exists(c => c.url == BlockUrlConstant.Text && predict(c) && c !== block)) {
                cs.push({ rowBlockId: rowBlock.id, text: JSON.stringify(rowBlock.childs.map(g => g.get())) })
            }
        }
        if (deleteBlocks.length > 0 || cs.length > 0)
            this.addUpdateEvent(async () => {
                await channel.patch('/block/ref/sync', {
                    data: { deleteBlockIds: deleteBlocks, updates: cs }
                })
            })
    }
    private async onNotifyChanged(this: Page) {
        var ua = this.snapshoot.action;
        /**
         * 这里主要是同步大纲
         * 双链的引用数据更新
         * 定时器的引用数据更新
         * 
         */
        var changes: { head: boolean } = { head: false };
        var blockSyncs: {
            deleteBlockIds: string[]; updates: { rowBlockId: string; text: string; }[]
        } = { deleteBlockIds: [], updates: [] };
        for (let i = 0; i < this.snapshoot.action.operators.length; i++) {
            var op = this.snapshoot.action.operators[i];
            switch (op.directive) {
                case OperatorDirective.$delete:
                    /**
                     * 如果在块删除之前，请在onNotifyWillRemove处理
                     */
                    if (op.data.data.url == BlockUrlConstant.Head) changes.head = true;
                    break;
                case OperatorDirective.$create:
                    if (op.data.data.url == BlockUrlConstant.Head) changes.head = true;
                    /**
                     * 这里只考虑撤消时的的重建
                     */
                    var block = this.find(g => g.id == op.data.pos.blockId);
                    if (block) {
                        if (block.exists(g => g.isTextBlock && g.asTextContent?.link?.name == 'page')) {
                            var rb = block.closest(g => g.isBlock);
                            blockSyncs.updates.push({ rowBlockId: rb.id, text: JSON.stringify(rb.childs.map(c => c.get())) })
                        }
                    }
                    break;
                case OperatorDirective.$update:
                    var block = this.find(g => g.id == op.data.pos.blockId);
                    if (block) {
                        if (block.url == BlockUrlConstant.Head) changes.head = true;
                        if (Object.keys(op.data.new_value).includes('content')) {
                            var rb = block.closest(x => x.isBlock);
                            if (rb && rb.exists(g => g.isTextBlock && g.asTextContent?.link?.name == 'page')) {
                                var rb = block.closest(g => g.isBlock);
                                blockSyncs.updates.push({ rowBlockId: rb.id, text: JSON.stringify(rb.childs.map(c => c.get())) })
                            }
                        }
                    }
                    break;
                case OperatorDirective.$turn:
                    if (op.data.from.startsWith(BlockUrlConstant.Head) || op.data.to.startsWith(BlockUrlConstant.Head)) changes.head = true;
                    break;
                case OperatorDirective.$move:
                    var block = this.find(g => g.id == op.data.from.blockId);
                    if (block && block.url == BlockUrlConstant.Head) changes.head = true;
                    break;
            }
        }
        if (changes.head) {
            var r = this.find(g => g.url == BlockUrlConstant.Outline);
            if (r) {
                (r as PageOutLine).updateOutLine()
            }
        }
        if (blockSyncs.deleteBlockIds.length > 0 || blockSyncs.updates.length > 0) {
            await channel.patch('/block/ref/sync', {
                data: blockSyncs
            })
        }
    }
    /**
     * onAction在执行时，会出现并发的情况，
     * 这时通过onActionQueue把并发的请求变成一个队列，然后有序执行
     */
    onActionQueue: QueueHandle;
    async onAction(this: Page,
        directive: ActionDirective | string,
        fn: () => Promise<void>,
        options?: { block?: Block, disabledStore?: boolean }
    ) {
        if (typeof this.onActionQueue == 'undefined') this.onActionQueue = new QueueHandle();
        await this.onActionQueue.create(
            async () => {
                await this.snapshoot.sync(directive, async () => {
                    this.willUpdateBlocks = [];
                    this.willLayoutBlocks = [];
                    this.willUpdateAll = false;
                    this.updatedFns = [];
                    try {
                        if (typeof fn == 'function') await fn();
                    } catch (ex) {
                        this.onError(ex);
                    }
                    finally {
                        try {
                            if (Array.isArray(this.willLayoutBlocks) && this.willLayoutBlocks.length > 0) {
                                var bs = this.willLayoutBlocks;
                                await bs.eachAsync(async (block) => {
                                    await block.layoutCollapse();
                                });
                                this.willLayoutBlocks = [];
                            }
                        }
                        catch (ex) {
                            this.onError(ex);
                        }
                        this.notifyUpdateBlock();
                    }
                }, options)
            }
        )
    }
    onUnmount(this: Page) {
        ReactDOM.unmountComponentAtNode(this.root);
    }
    onError(this: Page, error: Error) {
        this.emit(PageDirective.error, error);
    }
    onWarn(this: Page, error: string | Error) {
        this.emit(PageDirective.warn, error);
    }
    onFocus(this: Page, event: FocusEvent) {
        if (this.isFocus == false) {
            this.isFocus = true;
            this.emit(PageDirective.focus, event);
        }
    }
    onBlur(this: Page, event: FocusEvent) {
        if (this.isFocus == true) {
            this.isFocus = false;
            this.emit(PageDirective.blur, event);
        }
    }
    onHighlightBlock(this: Page, blocks: Block[]) {
        var bs = this.getAtomBlocks(blocks);
        bs.forEach(b => {
            b.el.classList.remove('shy-block-highlight');
        })
        bs.forEach(b => {
            b.el.classList.add('shy-block-highlight')
        });
        setTimeout(() => {
            bs.forEach(b => {
                b.el.classList.remove('shy-block-highlight');
            })
        }, 5000);
    }
    public hoverBlock: Block;
    onHoverBlock(this: Page, block: Block) {
        var isChange = this.hoverBlock != block;
        if (isChange && this.hoverBlock) {
            this.onOutHoverBlock(this.hoverBlock);
        }
        if (isChange) {
            this.hoverBlock = block;
            if (this.hoverBlock?.el) {
                this.hoverBlock.el.classList.add('shy-block-hover');
            }
            this.emit(PageDirective.hoverBlock, this.hoverBlock);
        }
        if (this.hoverBlock) this.kit.handle.onShowBlockHandle(this.hoverBlock);
        else this.kit.handle.onCloseBlockHandle();
    }
    onOutHoverBlock(this: Page, block: Block) {
        if (block?.el) {
            block.el.classList.remove('shy-block-hover');
        }
        this.emit(PageDirective.hoverOutBlock, block);
        this.kit.handle.onCloseBlockHandle();
    }
    /**
     * 修复一些不正常的block
     */
    async onRepair(this: Page) {
        var rs: Block[] = [];
        await this.views.eachAsync(async (view) => {
            if (view.url != BlockUrlConstant.View) {
                rs.push(view);
                return;
            }
            view.eachReverse(b => {
                /**
                 * 如果是空文本块，则删除掉空文本块
                 */
                if (b.isTextContent && !b.content) {
                    rs.push(b);
                }
                /**
                 * 如果当前的block是row,col，但没有子元素块,
                 * 那么block应该需要删除
                 */
                else if ((b.isRow || b.isCol) && !b.isPart && !b.hasChilds) {
                    rs.push(b);
                }
            });
            return
        });
        await rs.eachAsync(async r => {
            r.parentBlocks.remove(r);
        })
        if (this.pageLayout.type == PageLayoutType.doc) {
            if (this.nav) {
                var view = this.views[0];
                var second = this.views[1];
                if (view && second) {
                    if (view.exists(c => c.url == BlockUrlConstant.Outline) && !second.exists(c => c.url == BlockUrlConstant.Outline)) {
                        this.views = [second, view];
                    }
                }
            }
        }
    }
    async updateProps(this: Page, props: Record<string, any>) {
        var oldValue: Record<string, any> = {};
        var newValue: Record<string, any> = {};
        for (let prop in props) {
            if (!lodash.isEqual(lodash.get(this, prop), lodash.get(props, prop))) {
                oldValue[prop] = util.clone(lodash.get(this, prop));
                newValue[prop] = util.clone(lodash.get(props, prop));
                lodash.set(this, prop, util.clone(lodash.get(props, prop)));
            }
        }
        if (Object.keys(oldValue).length > 0 || Object.keys(newValue).length > 0) {
            this.snapshoot.record(OperatorDirective.pageUpdateProp, {
                old: oldValue,
                new: newValue
            }, this);
        }
    }
    async onUpdateProps(this: Page, props: Record<string, any>, isUpdate?: boolean) {
        await this.onAction(ActionDirective.onPageUpdateProps, async () => {
            await this.updateProps(props);
            if (isUpdate) this.addPageUpdate();
        });
    }
    formRowData: Record<string, any>;
    async loadSchemaView(this: Page, elementUrl: string) {
        var pe = parseElementUrl(elementUrl);
        if (!this.schema) {
            this.schema = await TableSchema.loadTableSchema(pe.id);
        }
        var pageData = SchemaCreatePageFormData(this.schema, elementUrl, pe.type == ElementType.SchemaRecordViewData ? true : false);
        this.views = [];
        await this.load(pageData);
        if (pe.type == ElementType.SchemaRecordViewData) {
            var row = await this.schema.rowGet(pe.id2);
            if (row) {
                this.formRowData = lodash.cloneDeep(row);
                this.loadSchemaRecord(row);
            }
        }
    }
    loadSchemaRecord(this: Page, row: Record<string, any>) {
        this.each(g => {
            if (g instanceof OriginFormField) {
                var f = g.field;
                if (f) {
                    g.value = g.field.getValue(row);
                }
            }
        })
    }
    getSchemaRow(this: Page,) {
        var row: Record<string, any> = {};
        this.each(g => {
            if (g instanceof OriginFormField) {
                var f = g.field;
                if (f) {
                    row[f.name] = g.value;
                }
            }
        })
        if (this.formRowData) {
            row.icon = this.formRowData.icon;
            row.cover = this.formRowData.cover;
            row.title = this.formRowData.title;
        }
        return row;
    }
    async onToggleFieldView(this: Page, field: Field, checked: boolean) {
        await this.onAction('onToggleFieldView', async () => {
            if (checked) {
                var b = GetFieldFormBlockInfo(field);
                if (b) {
                    var newBlock = await this.createBlock(b.url, b, this.views[0]);
                    if (this.formRowData)
                        newBlock.updateProps({ value: field.getValue(this.formRowData) })
                }
            }
            else {
                var f = this.find(c => (c instanceof OriginFormField) && c.field.id == field.id);
                if (f) await f.delete()
            }
        });
    }
}

