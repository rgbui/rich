import ReactDOM from "react-dom";
import { Page } from "..";
import { Block } from "../../block";
import { View } from "../../block/element/view";
import { BlockFactory } from "../../block/factory/block.factory";
import { UserAction, ViewOperate } from "../../history/action";
import { ActionDirective, OperatorDirective } from "../../history/declare";
import { PageDirective } from "../directive";
import { PageHistory } from "../interaction/history";
import { PageKeys } from "../interaction/keys";
import { BlockUrlConstant } from "../../block/constant";
import { PageLayoutType } from "../declare";
import { GridMap } from "../grid";
import { Matrix } from "../../common/matrix";
import lodash from "lodash";
import JSZip from 'jszip';
import { util } from "../../../util/util";
import { PageOutLine } from "../../../blocks/page/outline";
import { channel } from "../../../net/channel";
import { ElementType, getElementUrl } from "../../../net/element.type";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { GetFieldFormBlockInfo } from "../../../blocks/data-grid/element/service";
import { OriginFormField } from "../../../blocks/data-grid/element/form/origin.field";
import { Field } from "../../../blocks/data-grid/schema/field";
import { DataGridView } from "../../../blocks/data-grid/view/base";
import { QueueHandle } from "../../../component/lib/queue";
import { Image } from "../../../blocks/media/image";
import { FieldType } from "../../../blocks/data-grid/schema/type";
import { ls } from "../../../i18n/store";
import { BuildTemplate } from "../template/build";

export class Page$Cycle {
    async init(this: Page) {
        this.gridMap = new GridMap(this);
        PageHistory(this, this.snapshoot);
        PageKeys(this, this.keyboardPlate);
        this.emit(PageDirective.init);
        await ls.import()
    }
    async onLoadContentOperates(this: Page, itemId: string, content: any, operates?: any) {
        await this.clear();
        await this.load(content);
        if (Array.isArray(operates) && operates.length > 0) {
            var operates = operates.map(op => op.operate ? op.operate : op) as any;
            await this.onSyncUserActions(operates, 'load');
        }
        await this.onAction(ActionDirective.onPageUpdateProps, async () => {
            await this.updateProps({ sourceItemId: itemId });
        });
    }
    async clear(this: Page) {
        this.views = [];
    }
    /**
     * 标记当前页面是否加载的是默认的数据
     * 
     */
    loadDefault: boolean = false;
    async load(this: Page, data?: Record<string, any>, operates?: ViewOperate[]) {
        try {
            if (!data || typeof data == 'object' && Object.keys(data).length == 0) {
                //这里加载默认的页面数据
                data = this.getDefaultData();
                this.loadDefault = true;
            }
            else {
                this.requireSelectLayout = false;
                this.loadDefault = false;
            }
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
            if (typeof this.pageLayout == 'undefined') {
                if (this.pe.type == ElementType.Room) {
                    this.pageLayout = Object.assign(this.pageLayout || {}, { type: PageLayoutType.textChannel });
                }
                else this.pageLayout = Object.assign(this.pageLayout || {}, { type: PageLayoutType.doc });
            }
            if ([
                PageLayoutType.recordView
            ].some(s => s == this.pageLayout.type)) {
                this.requireSelectLayout = false;
            }
            if (this.pe && [ElementType.SchemaRecordView, ElementType.SchemaRecordViewData, ElementType.Schema, ElementType.SchemaData].includes(this.pe.type)) {
                this.requireSelectLayout = false;
                await this.loadPageSchema();
            }
            await this.onRepair();
            await this.views.eachAsync(async v => {
                await v.loadSyncBlock()
            })
            await this.emit(PageDirective.loaded);
            if (Array.isArray(operates) && operates.length > 0) {
                var ops = operates.map(op => op.operate ? op.operate : op) as any;
                await this.onSyncUserActions(ops, 'load');
            }
        }
        catch (ex) {
            this.onError(ex);
            console.error(ex);
            console.log(JSON.stringify(data));
        }
        
    }
    async loadViews(this: Page, data?: Record<string, any>) {
        this.views = [];
        if (Array.isArray(data.views)) {
            for (var i = 0; i < data.views.length; i++) {
                var dv = data.views[i];
                var dc = await BlockFactory.createBlock(dv.url, this, dv, null);
                this.views.push(dc as View);
            }
        }
    }
    async reload(this: Page, data: Record<string, any>) {
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
            PageLayoutType.recordView,
        ].some(s => s == this.pageLayout.type)) {
            this.requireSelectLayout = false;
        }
        if (this.pe && [ElementType.SchemaRecordView, ElementType.Schema, ElementType.SchemaData].includes(this.pe.type)) {
            this.requireSelectLayout = false;
            await this.loadPageSchema();
        }
        await this.onRepair();
    }
    async onSyncUserActions(this: Page, actions: UserAction[], source: 'load' | 'loadSyncBlock' | 'notify' | 'notifyView') {
        if (source == 'notifyView' || source == 'notify') {
            this.pageModifiedExternally = true;
        }
        var isOk: boolean = true;
        await this.onAction(ActionDirective.onLoadUserActions, async () => {
            for (let i = 0; i < actions.length; i++) {
                let action = actions[i];
                try {
                    await this.snapshoot.redoUserAction(action, source);
                }
                catch (ex) {
                    isOk = false;
                    this.onError(ex);
                }
            }
        })
        if (source == 'notifyView') {
            actions.forEach(action => {
                if (action.directive == ActionDirective.onPageLock) {

                }
            })
        }
        await this.onRepair();
        if (this.isCanEdit && isOk && actions.length > 0) {
            var seq = actions.max(g => g.seq);
            var op = actions.find(g => g.seq == seq);
            this.emit(PageDirective.syncHistory, {
                seq,
                creater: op.userid,
                force: source == 'load' ? true : false
            });
        }
    }
    async get(this: Page) {
        var json: Record<string, any> = {
            id: this.id,
            date: this.date,
            isFullWidth: this.isFullWidth,
            smallFont: this.smallFont,
            version: this.version,
            sourceItemId: this.sourceItemId,
            loadElementUrl: this.customElementUrl
        };
        json.pageTheme = lodash.cloneDeep(this.pageTheme);
        json.requireSelectLayout = this.requireSelectLayout;
        json.hideDocTitle = this.hideDocTitle;
        json.pageLayout = util.clone(this.pageLayout);
        if (typeof this.matrix != 'undefined' && typeof this.matrix.getValues == 'function')
            json.matrix = this.matrix.getValues();
        json.nav = this.nav;
        json.formType = this.formType;
        json.views = await this.views.asyncMap(async x => {
            return await x.get()
        })
        json.addedSubPages = this.addedSubPages.map(s => s);
        json.locker = lodash.cloneDeep(this.locker);
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
    async getMd(this: Page) {
        return (await this.views.asyncMap(async v => await v.getMd())).join(" \n");
    }
    async getThumb(this: Page) {
        var r = this.findAll(g => g.url == BlockUrlConstant.Image && ((g as Image).src ? true : false));
        if (r) {
            return lodash.cloneDeep((r as Image[]).map(i => i.src));
        }
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
    getDefaultData(this: Page) {
        return BuildTemplate(this);
    }
    async loadDefaultData(this: Page) {
        var data = this.getDefaultData();
        await this.load(data);
    }
    onPageSave(this: Page) {
        this.emit(PageDirective.save);
    }
    onPageClose(this: Page) {
        this.emit(PageDirective.close);
    }
    async onBack(this: Page) {
        if (ElementType.SchemaRecordView == this.pe.type) {
            var url: '/page/open' | '/page/dialog' | '/page/slide' = '/page/dialog'
            if (this.openSource == 'page') url = '/page/open'
            else if (this.openSource == 'slide') url = '/page/slide'
            await channel.air(url, {
                elementUrl: this.elementUrl,
                config: { wait: false, force: true }
            })
            return;
        }
        if (this.openSource == 'page') {
            if (this.isCanEdit) {
                if ([ElementType.SchemaData, ElementType.SchemaRecordView].includes(this.pe.type)) {
                    await this.onSubmitForm();
                }
                else {
                    this.onPageSave();
                }
            }
            this.emit(PageDirective.back);
        }
        else this.onPageClose();
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
    private willUpdateAll: boolean = false;
    private willUpdateBlocks: Block[];
    private willLayoutBlocks: Block[];
    private willChangeBlocks: Block[] = [];
    private updatedFns: (() => Promise<void>)[] = [];
    get hasUpdate() {
        return this.willUpdateBlocks.length > 0 || this.willUpdateAll;
    }
    addBlockChange(block: Block) {
        this.willChangeBlocks.push(block);
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
        var cos = Object.assign({}, this.recordSyncRowBlocks);
        var cgs = Object.assign({}, this.recordOutlineChanges);
        this.recordSyncRowBlocks = { rowBlocks: [], deletes: [] };
        this.recordOutlineChanges = { isChangeAll: false, changeBlocks: [] }
        this.willUpdateBlocks = [];
        this.updatedFns = [];
        this.willChangeBlocks = []
        var self = this;
        var fn = async function () {
            try {
                if (self.willUpdateAll) {
                    self.willUpdateAll = false;
                    await self.forceUpdate();
                }
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
                self.onNotifyChanged(cos, cgs)
            }
            catch (ex) {
                console.error(ex);
                self.onError(ex);
            }
        }
        fn()
    }
    private async onNotifyChanged(this: Page, recordSyncRowBlocks: Page['recordSyncRowBlocks'], recordOutlineChanges: Page['recordOutlineChanges']) {
        if (!this.pageInfo?.id) return;
        try {
            if (recordSyncRowBlocks.deletes.length > 0 || recordSyncRowBlocks.rowBlocks.length > 0) {
                var ds = recordSyncRowBlocks.deletes;
                var rs = recordSyncRowBlocks.rowBlocks;
                var ops = []
                for (let i = 0; i < rs.length; i++) {
                    var row = rs[i];
                    var rfs = row.childs.filter(g => Array.isArray(g.refLinks) && g.refLinks.length > 0);
                    if (rfs.length > 0) {
                        await rfs.eachAsync(async rf => {
                            await rf.refLinks.eachAsync(async f => {
                                ops.push({
                                    id: f.id,
                                    type: f.type,
                                    ref: lodash.cloneDeep(f),
                                    elementUrl: getElementUrl(ElementType.BlockLine, this.pageInfo.id, row.id, rf.id),
                                    html: (await row.childs.asyncMap(async c => await c.getHtml())).join("")
                                })
                            })
                        })
                    }
                }
                ds.forEach(c => {
                    ops.push({
                        id: c.id,
                        type: c.type,
                        ref: lodash.cloneDeep(c),
                    })
                })
                if (ops.length > 0)
                    await channel.post('/row/block/sync/refs', {
                        pageId: this.pageInfo.id,
                        operators: ops,
                        ws: this.ws
                    })
            }
        }
        catch (ex) {
            this.onError(ex);
            console.error(ex);
        }
        try {
            if (recordOutlineChanges.isChangeAll == true || recordOutlineChanges.changeBlocks.length > 0) {
                var outLineBlock = this.find(g => g.url == BlockUrlConstant.Outline) as PageOutLine;
                if (outLineBlock) {
                    if (recordOutlineChanges.isChangeAll) outLineBlock.updateOutLine();
                    else {
                        for (var i = 0; i < recordOutlineChanges.changeBlocks.length; i++) {
                            outLineBlock.updateHeadBlock(recordOutlineChanges.changeBlocks[i], i == recordOutlineChanges.changeBlocks.length - 1)
                        }
                    }
                }
            }
        }
        catch (ex) {
            this.onError(ex);
            console.error(ex);
        }
    }
    recordOutlineChanges: { isChangeAll: boolean, changeBlocks: Block[] } = { isChangeAll: false, changeBlocks: [] };
    recordSyncRowBlocks: { rowBlocks: Block[], deletes: Block['refLinks'] } = { rowBlocks: [], deletes: [] };
    /**
     * 监听 block块的变化
     * 块的主要操作就是创建、删除、移动、内容变化
     * 主要是处理双链的引用数据更新
     * @param this 
     * @param block 
     * @returns 
     * 
     */
    async monitorBlockOperator(this: Page, block: Block, op: 'create' | 'turn' | 'delete' | 'from' | 'to' | 'content', currentBlock?: Block) {
        // console.log('mfff', arguments);
        /**
         * 争对行内块引用关系的同步记录
         */
        try {
            var rs: Block[] = [];
            var dels: Block['refLinks'] = [];
            switch (op) {
                case 'create':
                    if (block.isLine) {
                        var row = block.closest(x => x.isOnlyBlock);
                        if (row) {
                            if (row.isOnlyBlock) rs = [row];
                            rs.push(...row.findAll(x => x.isOnlyBlock && x.exists(g => Array.isArray(g.refLinks) && g.refLinks.length > 0)));
                        }
                    }
                    else {
                        if (block.isOnlyBlock) rs = [block];
                        rs.push(...block.findAll(x => x.isOnlyBlock && x.exists(g => Array.isArray(g.refLinks) && g.refLinks.length > 0)));
                    }
                    break;
                case 'delete':
                    if (block.isLine) {
                        if (Array.isArray(block.refLinks) && block.refLinks.length > 0) {
                            dels.push(...block.refLinks);
                        }
                    }
                    else {
                        var lbs = block.findAll(g => Array.isArray(g.refLinks) && g.refLinks.length > 0)
                        lbs.forEach(c => {
                            dels.push(...c.refLinks)
                        })
                    }
                    break;
                case 'from':
                    if (currentBlock.isOnlyBlock) break;
                    if (currentBlock.isLine) {
                        if (block.isOnlyBlock && block.exists(g => Array.isArray(g.refLinks) && g.refLinks.length > 0)) {
                            rs = [block];
                        }
                    }
                    break;
                case 'to':
                    if (currentBlock.isOnlyBlock) break;
                    if (currentBlock.isLine) {
                        if (block.isOnlyBlock && block.exists(g => Array.isArray(g.refLinks) && g.refLinks.length > 0)) {
                            rs = [block];
                        }
                    }
                    break;
                case 'content':
                    if (block.isLine) {
                        var row = block.closest(x => x.isOnlyBlock);
                        if (row.exists(g => Array.isArray(g.refLinks) && g.refLinks.length > 0)) {
                            rs = [row];
                        }
                    }
                    break;
                case 'turn':
                    break;
            }
            rs.forEach(c => {
                if (!this.recordSyncRowBlocks.rowBlocks.exists(c)) this.recordSyncRowBlocks.rowBlocks.push(c);
            })
            dels.forEach(c => {
                if (!this.recordSyncRowBlocks.deletes.exists(c)) this.recordSyncRowBlocks.deletes.push(c);
            })
        }
        catch (ex) {
            console.error(ex);
            this.onError(ex);
        }


        //console.log(this.recordSyncRowBlocks)

        /**
         * 页面的大纲目录处理
         */
        var outLineBlock = this.find(g => g.url == BlockUrlConstant.Outline);

        if (outLineBlock) {
            var outLineChangeBlocks: Block[] = [];
            var isChangeAll = false;
            switch (op) {
                case 'create':
                    if (block.isLine) {
                        var row = block.closest(x => x.isOnlyBlock);
                        if (row?.url == BlockUrlConstant.Head) {
                            outLineChangeBlocks.push(row);
                        }
                    }
                    else if (block.url == BlockUrlConstant.Head) {
                        isChangeAll = true;
                    }
                    break;
                case 'delete':
                    if (block.isLine) {
                        var row = block.closest(x => x.isOnlyBlock);
                        if (row?.url == BlockUrlConstant.Head) {
                            outLineChangeBlocks.push(row);
                        }
                    }
                    else {
                        if (block.exists(g => g.url == BlockUrlConstant.Head)) {
                            isChangeAll = true;
                        }
                    }
                    break;
                case 'from':
                case 'to':
                    //console.log(currentBlock, 'cb');
                    if (currentBlock.isLine) {
                        var row = currentBlock.closest(x => x.isOnlyBlock);
                        if (row.url == BlockUrlConstant.Head) {
                            outLineChangeBlocks.push(row);
                        }
                    }
                    else if (currentBlock.url == BlockUrlConstant.Head) {
                        isChangeAll = true;
                    }
                    break;
                case 'content':
                    if (block.isLine) {
                        var row = block.closest(x => x.isOnlyBlock);
                        if (row?.url == BlockUrlConstant.Head) {
                            outLineChangeBlocks.push(row);
                        }
                    }
                    else if (block.url == BlockUrlConstant.Head) {
                        outLineChangeBlocks.push(block);
                    }
                    break;
                case 'turn':
                    if (block?.url == BlockUrlConstant.Head) {
                        isChangeAll = true;
                    }
                    if (currentBlock?.url == BlockUrlConstant.Head) {
                        isChangeAll = true;
                    }
                    break;
            }
            if (isChangeAll) this.recordOutlineChanges.isChangeAll = true;
            if (outLineChangeBlocks.length > 0) {
                outLineChangeBlocks.forEach(c => {
                    if (this.recordOutlineChanges.changeBlocks.exists(c) == false)
                        this.recordOutlineChanges.changeBlocks.push(c);
                })
            }
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
        options?: { disabledStore?: boolean,immediate?:boolean }
    ) {
        if (typeof this.onActionQueue == 'undefined') this.onActionQueue = new QueueHandle();
        await this.onActionQueue.create(
            async () => {
                await this.snapshoot.sync(directive, async (cb) => {
                    this.willUpdateBlocks = [];
                    this.willLayoutBlocks = [];
                    this.willChangeBlocks = [];
                    this.willUpdateAll = false;
                    this.updatedFns = [];
                    this.recordSyncRowBlocks = { rowBlocks: [], deletes: [] };
                    this.recordOutlineChanges = { isChangeAll: false, changeBlocks: [] }
                    try {
                        if (typeof fn == 'function') await fn();
                    } catch (ex) {
                        this.onError(ex);
                    }
                    finally {
                        if (this.willChangeBlocks.length > 0) {
                            cb(this.willChangeBlocks);
                        }
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
    onHighlightBlock(this: Page, blocks: Block | (Block[]) | string | (string[]), scrollTo?: boolean) {
        if (lodash.isNull(blocks) || lodash.isUndefined(blocks)) return;
        var bs: Block[] = [];
        if (Array.isArray(blocks)) {
            if (blocks[0] instanceof Block) {
                bs = blocks as any;
            }
            else {
                bs = this.findAll(c => blocks.includes(c.id))
            }
        }
        else {
            if (typeof blocks == 'string') {
                var g = this.find(c => c.id == blocks);
                if (g) bs.push(g);
            }
            else if (blocks instanceof Block) bs.push(g)
        }
        bs = this.getAtomBlocks(bs);
        if (bs.length == 0) return;
        var first = bs.first();
        if (scrollTo)
            this.onPageScroll(first);
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
                if (b.isLine && b.parent?.isLayout) {
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
        if (this.pageLayout.type == PageLayoutType.textChannel) {
            if (!this.exists(g => g.url == BlockUrlConstant.TextChannel)) {
                this.views = [];
                var dc = await BlockFactory.createBlock(BlockUrlConstant.View, this,
                    {
                        url: BlockUrlConstant.View,
                        blocks: { childs: [{ url: BlockUrlConstant.TextChannel }] }
                    }, null);
                this.views.push(dc as View);
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
    async onUpdateProps(this: Page, props: Record<string, any>, isUpdate?: boolean, callback?: () => void) {
        await this.onAction(ActionDirective.onPageUpdateProps, async () => {
            await this.updateProps(props);
            if (typeof callback == 'function') callback();
            if (isUpdate) this.addPageUpdate();
        });
    }
    formRowData: Record<string, any>;
    formUserEmojis: Record<string, string[]> = {};
    formPreRow: Record<string, any>;
    formNextRow: Record<string, any>;
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
                if (typeof this.schemaInitRecordData != 'undefined') Object.assign(this.formRowData, this.schemaInitRecordData)
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
    async onToggleFieldView(this: Page, field: Field, checked: boolean) {
        await this.onAction('onToggleFieldView', async () => {
            if (checked) {
                var b = GetFieldFormBlockInfo(field);
                if (b) {
                    var view = this.views[0];
                    (b as any).fieldType = this.formType;
                    var newBlock = await this.createBlock(b.url, b, view, view.childs.length);
                    if (this.formRowData)
                        await newBlock.updateProps({ value: field.getValue(this.formRowData) })
                }
            }
            else {
                var f = this.find(c => (c instanceof OriginFormField) && c.field.id == field.id);
                if (f) await f.delete()
            }
        });
    }
}

