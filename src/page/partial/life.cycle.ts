import { Page } from "..";
import { Block } from "../../block";
import { View } from "../../block/element/view";
import { BlockFactory } from "../../block/factory/block.factory";
import { UserAction, ViewOperate } from "../../history/action";
import { ActionDirective } from "../../history/declare";
import { PageDirective, PageLocation } from "../directive";
import { PageHistory } from "../interaction/history";
import { PageKeys } from "../interaction/keys";
import { BlockChildKey, BlockUrlConstant } from "../../block/constant";
import { PageLayoutType } from "../declare";
import { GridMap } from "../grid";
import { Matrix } from "../../common/matrix";
import lodash from "lodash";
import JSZip from 'jszip';
import { util } from "../../../util/util";
import { PageOutLine } from "../../../blocks/navigation/outline";
import { channel } from "../../../net/channel";
import { ElementType, getElementUrl } from "../../../net/element.type";
import { QueueHandle } from "../../../component/lib/queue";
import { Image } from "../../../blocks/media/image";
import { ls } from "../../../i18n/store";
import { BuildTemplate } from "../template/build";
import { List, ListType } from "../../../blocks/present/list/list";
import { BlockRefPageLink, RefPageLink } from "../../../extensions/link/declare";
import { SyncPage } from "../interaction/bind";
import { SyncMessageUrl } from "../../../net/sync.message";


export class Page$Cycle {
    async init(this: Page) {
        this.gridMap = new GridMap(this);
        PageHistory(this, this.snapshoot);
        SyncPage(this);
        PageKeys(this, this.keyboardPlate);
        this.emit(PageDirective.init);
        await ls.import()
    }

    /**
     * 标记当前页面是否加载的是默认的数据
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
            if (this.pe)
                await this.loadPageParents();
            await this.loadPageRepair();
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
        await this.loadPageRepair();
    }
    async onSyncUserActions(this: Page, actions: UserAction[], source: 'load' | 'loadSyncBlock' | 'notify') {
        if (source == 'notify') {
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
        }, {
            disabledStore: true
        })
        await this.loadPageRepair();
        if (this.isCanEdit && isOk && actions.length > 0) {
            var seq = actions.max(g => g.seq);
            var op = actions.find(g => g.seq == seq);
            this.emit(PageDirective.syncPage, {
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


    private willUpdateAll: boolean = false;
    private willUpdateBlocks: Block[];
    private willLayoutBlocks: Block[];
    private willSyncBlocks: Block[] = [];
    private actionCompletedEvents: (() => Promise<void>)[] = [];
    private actionAfterEvents: (() => Promise<void>)[] = [];
    /**
     * 主动通知当前Action更新，需要同步的syncBlockId或page
     * 如果更新是处于syncBlock中时，数据的更新应存在syncBlock中
     * @param block 
     */
    notifyActionBlockSync(block: Block) {
        this.willSyncBlocks.push(block);
    }
    /**
     * 主动通知页面更新
     */
    notifyActionPageUpdate() {
        this.willUpdateAll = true;
    }
    /**
     * 主动通知block重新渲染
     * @param block 
     */
    notifyActionBlockUpdate(...block: Block[]) {
        if (!block) return;
        block.forEach(b => {
            if (b) b.needUpdate = true
        })
        if (!Array.isArray(this.willUpdateBlocks)) this.willUpdateBlocks = [];
        block.forEach(b => {
            if (b) {
                lodash.remove(this.willUpdateBlocks, g => g == b);
                this.willUpdateBlocks.push(b);
            }
        })
    }
    /**
     * 主动通知block重新布局
     * @param block 
     */
    notifyActionBlockResetLayout(block: Block) {
        if (this.willLayoutBlocks && !this.willLayoutBlocks.exists(block))
            this.willLayoutBlocks.push(block);
    }
    /**
     * 添加一件事件，当执行onAction完后，触发的事件
     * 注意事件仍然执行在onAction内部,只是处于尾部
     * @param fn 
     */
    addActionCompletedEvent(fn: () => Promise<void>) {
        this.actionCompletedEvents.push(fn);
    }
    /**
     * 添加一件事件，当执行onAction完后，触发的事件
     * 注意事件执行在onAction外部
     * @param fn 
     */
    addActionAfterEvent(fn: () => Promise<void>) {
        this.actionAfterEvents.push(fn);
    }

    recordOutlineChanges: { isChangeAll: boolean, changeBlocks: string[] } = { isChangeAll: false, changeBlocks: [] };
    recordSyncRowBlocks: { rowBlocks: string[], deletes: RefPageLink[] } = { rowBlocks: [], deletes: [] };

    /**
     * 监听block的变更，
     * 同步页面的引用关系
     * 同步页面的大纲目录
     * @param this 
     * @param op 
     * @param options 
     */
    observeChange(this: Page,
        op: 'create' | 'willDelete' | 'update' | 'manualUpdate' | 'from' | 'to' | 'turnBefore' | 'turnAfter',
        options: {
            block: Block,
            update?: { old: Record<string, any>, new: Record<string, any> },
            turn?: { oldUrl: string, newUrl: string }
        }) {
        if (window.shyConfig?.isDev) {
            console.log('observeChange', op, options);
        }
        /***
         * 页面引用关系同步
         */
        try {
            var rs: Block[] = [];
            var dels: RefPageLink[] = [];
            switch (op) {
                case 'create':
                    if (options.block?.isLine) {
                        //创建了行内块，那么同步行内块所属于的块
                        var r = options.block.closest(x => x.isContentBlock);
                        if (Array.isArray(options.block.refLinks) && options.block.refLinks.length > 0) {
                            rs.push(r);
                        }
                    }
                    else {
                        //创建了块，那么同步当前块及所有子块
                        var r = options.block.closest(x => x.isContentBlock);
                        if (r) {
                            var subs = r.findAll(c => c.isContentBlock && c.exists(g => Array.isArray(g.refLinks) && g.refLinks.length > 0));
                            rs.push(...subs);
                        }
                    }
                    break;
                case 'update':
                case 'manualUpdate':
                    var ns = options.update.new;
                    var od = options.update.old;
                    if (Object.keys(ns).includes('content')) {
                        //说明内容变更了，那么当前行内的信息需要同步
                        var r = options.block.closest(x => x.isContentBlock);
                        if (r && r.childs.some(s => Array.isArray(s.refLinks) && s.refLinks.length > 0)) {
                            rs.push(r);
                        }
                    }
                    if (Object.keys(ns).includes('refLinks')) {
                        //说明当前块在编辑refLinks时
                        //那么有两种情况
                        // 1. 删除了refLinks
                        // 2. 添加或编辑了refLinks
                        var oldRefLinks = od.refLinks;
                        var newRefLinks = ns.refLinks;
                        if (Array.isArray(oldRefLinks) && oldRefLinks.length > 0) {
                            var os = oldRefLinks.filter(g => Array.isArray(newRefLinks) && newRefLinks.some(c => c.id == g.id) ? false : true);
                            if (os.length > 0) {
                                dels.push(...os.map(o => o));
                            }
                        }
                        var r = options.block.closest(x => x.isContentBlock);
                        if (r && r.childs.some(s => Array.isArray(s.refLinks) && s.refLinks.length > 0)) {
                            rs.push(r);
                        }
                    }
                    break;
                case 'from':
                case 'to':
                    if (options.block.isLine) {
                        //行内块，拖放，所以只需要同步当前行
                        var r = options.block.closest(x => x.isContentBlock);
                        if (r && r.childs.some(s => Array.isArray(s.refLinks) && s.refLinks.length > 0)) {
                            rs.push(r);
                        }
                    }
                    break;
                case 'willDelete':
                    if (options.block?.isLine) {
                        //删除行内块
                        if (Array.isArray(options.block.refLinks) && options.block.refLinks.length > 0) {
                            dels.push(...options.block.refLinks);
                        }
                    }
                    else {
                        //删除整个块，该块可能包含子块
                        var r = options.block.closest(x => x.isContentBlock);
                        if (r) {
                            var subs = r.findAll(c => Array.isArray(c.refLinks) && c.refLinks.length > 0);
                            subs.forEach(s => {
                                dels.push(...s.refLinks);
                            })
                        }
                    }
                    break;
                case 'turnBefore':
                    if (!options.block.isLine && options.block.childs.some(s => Array.isArray(s.refLinks) && s.refLinks.length > 0)) {
                        if (options.turn?.newUrl == BlockUrlConstant.Code || options.turn?.newUrl == BlockUrlConstant.Link) {
                            var rs = options.block.childs.filter(c => Array.isArray(c.refLinks) && c.refLinks.length > 0);
                            rs.forEach(r => {
                                dels.push(...r.refLinks.map(o => o));
                            })
                        }
                    }
                    break;
                case 'turnAfter':
                    break;

            }
            rs.forEach(c => {
                if (!this.recordSyncRowBlocks.rowBlocks.includes(c.id)) this.recordSyncRowBlocks.rowBlocks.push(c.id);
            })
            dels.forEach(c => {
                if (!this.recordSyncRowBlocks.deletes.includes(c)) this.recordSyncRowBlocks.deletes.push(c);
            })
        }
        catch (ex) {
            console.error(ex);
            this.onError(ex);
        }


        /**
         * 同步页面的所有大纲目录
         * 这里判断当前的操作是否会影响到大纲目录
         */
        var outLineBlocks = this.find(g => g.url == BlockUrlConstant.Outline);
        if (outLineBlocks) {
            var outLineChangeBlocks: Block[] = [];
            var isChangeAll = false;
            try {

                switch (op) {
                    case 'create':
                        if (options.block.isLine) {
                            var row = options.block.closest(x => x.isContentBlock);
                            if (row?.url == BlockUrlConstant.Head) {
                                outLineChangeBlocks.push(row);
                            }
                        }
                        else if (options.block.url == BlockUrlConstant.Head) {
                            isChangeAll = true;
                        }
                        break;
                    case 'update':
                    case 'manualUpdate':
                        var ns = options.update.new;
                        var od = options.update.old;
                        if (Object.keys(ns).includes('content')) {
                            var r = options.block.closest(x => x.isContentBlock);
                            if (r.url == BlockUrlConstant.Head) {
                                outLineChangeBlocks.push(r);
                            }
                        }
                        else if (options.block.url == BlockUrlConstant.Head) {
                            isChangeAll = true;
                        }
                        break;
                    case 'willDelete':
                        if (options.block.isLine) {
                            var row = options.block.closest(x => x.isContentBlock);
                            if (row?.url == BlockUrlConstant.Head) {
                                outLineChangeBlocks.push(row);
                            }
                        }
                        else if (options.block.url == BlockUrlConstant.Head) {
                            isChangeAll = true;
                        }
                        break;
                    case 'from':
                    case 'to':
                        if (options.block.isLine) {
                            var row = options.block.closest(x => x.isContentBlock);
                            if (row?.url == BlockUrlConstant.Head) {
                                outLineChangeBlocks.push(row);
                            }
                        }
                        else if (options.block.url == BlockUrlConstant.Head) {
                            isChangeAll = true;
                        }
                        break;
                    case 'turnBefore':
                        if (options.block.isContentBlock) {
                            if (options.block.url == BlockUrlConstant.Head) {
                                isChangeAll = true;
                            }
                        }
                        break;
                    case 'turnAfter':
                        if (options.block.isContentBlock) {
                            if (options.block.url == BlockUrlConstant.Head) {
                                isChangeAll = true;
                            }
                        }
                }
                if (isChangeAll) this.recordOutlineChanges.isChangeAll = true;
                if (outLineChangeBlocks.length > 0) {
                    outLineChangeBlocks.forEach(c => {
                        if (!this.recordOutlineChanges.changeBlocks.includes(c.id))
                            this.recordOutlineChanges.changeBlocks.push(c.id);
                    })
                }
                if (window.shyConfig?.isDev) {
                    console.log(isChangeAll, outLineChangeBlocks)
                }
            }
            catch (ex) {

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
        options?: {

            /**
             * 禁止同步syncBlock，正常操作有所属的block，
             * 但如dataGrid中，切换不同的视图时，该操作与原来的视图无关，所以不需要同步
             */
            disabledSyncBlock?: boolean,
            /**
             * 该操作会直接保存一个快照，存至服务器中
             */
            immediate?: boolean,
            /**
             * 禁止保存操作，当操作没有发生（即不同步至服务器，也不保存至历史队列中)
             */
            disabledStore?: boolean,
            /**
             * 将当前的操作合并至上一个操作中
             */
            merge?: boolean,
            /**
             * 禁止加入到当前的操作历史队列中
             */
            disabledJoinHistory?: boolean,
            /**
             * 禁止将操作同步至服务器
             */
            disableSyncServer?: boolean
        }
    ) {
        var isTs: boolean = false;
        var willAction = async () => {
            if (!window.shyConfig?.isPro)
                console.log('onAction', typeof directive == 'number' ? ActionDirective[directive] : directive);
            this.actionAfterEvents = [];
            var ts = window.performance.now();
            await this.snapshoot.sync(directive, async (cb) => {
                this.willUpdateBlocks = [];
                this.willLayoutBlocks = [];
                this.willSyncBlocks = [];
                this.willUpdateAll = false;
                this.actionCompletedEvents = [];
                this.recordSyncRowBlocks = { rowBlocks: [], deletes: [] };
                this.recordOutlineChanges = { isChangeAll: false, changeBlocks: [] }
                try {

                    if (typeof fn == 'function') await fn();
                    if (isTs)
                        console.log('ts fn', window.performance.now() - ts);
                    if (this.willSyncBlocks.length > 0) {
                        cb(this.willSyncBlocks);
                    }
                    if (isTs)
                        console.log('ts willSyncBlocks fn', window.performance.now() - ts);
                    try {
                        if (Array.isArray(this.willLayoutBlocks) && this.willLayoutBlocks.length > 0) {
                            var bs = this.willLayoutBlocks;
                            this.willLayoutBlocks = [];
                            await bs.eachAsync(async (block) => {
                                await block.layoutCollapse();
                            });
                        }
                    }
                    catch (ex) {
                        console.error('will layout', ex)
                        this.onError(ex);
                    }
                    if (isTs)
                        console.log('ts will layout fn', window.performance.now() - ts);
                    if (!window.shyConfig?.isPro && (this.willUpdateAll || this.willUpdateBlocks.length > 0))
                        console.log('will updates...', this.willUpdateAll, this.willUpdateBlocks)
                    try {
                        if (this.willUpdateAll) {
                            this.willUpdateAll = false;
                            await this.forceUpdate();
                        }
                        var ubs = this.willUpdateBlocks;
                        this.willUpdateBlocks = [];
                        await ubs.eachAsync(async (up) => {
                            try {
                                if (up) await up.forceManualUpdate();
                            }
                            catch (ex) {
                                console.error('update block view', ex)
                                this.onError(ex);
                            }
                        })
                        this.adjustListNumStr(ubs)
                    }
                    catch (ex) {
                        console.error('will update view', ex);
                        this.onError(ex);
                    }
                    if (isTs)
                        console.log('update blocks ', window.performance.now() - ts);

                    try {
                        var es = this.actionCompletedEvents;
                        this.actionCompletedEvents = [];
                        es.forEach(fn => {
                            try {
                                fn()
                            }
                            catch (ex) {
                                console.error('action error', ex)
                                this.onError(ex);
                            }
                        })
                    }
                    catch (ex) {
                        console.error(ex);
                        this.onError(ex);
                    }

                    try {
                        var cos = Object.assign({}, this.recordSyncRowBlocks);
                        var cgs = Object.assign({}, this.recordOutlineChanges);
                        this.recordSyncRowBlocks = { rowBlocks: [], deletes: [] };
                        this.recordOutlineChanges = { isChangeAll: false, changeBlocks: [] }
                        this.onActionCompletedObserveProcess(cos, cgs)
                    }
                    catch (ex) {
                        console.error('action completed notify', ex)
                    }

                }
                catch (ex) {
                    this.onError(ex);
                }
                finally {
                    this.willUpdateBlocks = [];
                    this.willLayoutBlocks = [];
                    this.willSyncBlocks = [];
                    this.willUpdateAll = false;
                    this.actionCompletedEvents = [];
                    this.recordSyncRowBlocks = { rowBlocks: [], deletes: [] };
                    this.recordOutlineChanges = { isChangeAll: false, changeBlocks: [] }
                }
            }, options);
            try {
                if (isTs)
                    console.log('ts action after', window.performance.now() - ts);
                var events = this.actionAfterEvents;
                this.actionAfterEvents = [];
                this.onActionAfter(events)
            }
            catch (ex) {
                console.error('action after', ex)
                this.onError(ex);
            }
        }
        if (typeof this.onActionQueue == 'undefined') this.onActionQueue = new QueueHandle();
        await this.onActionQueue.create(
            willAction
        )
        // await willAction();
    }
    private async onActionCompletedObserveProcess(this: Page, recordSyncRowBlocks: Page['recordSyncRowBlocks'], recordOutlineChanges: Page['recordOutlineChanges']) {
        if (!this.pageInfo?.id) return;
        try {
            if (!window.shyConfig?.isPro && (recordSyncRowBlocks.deletes.length > 0 || recordSyncRowBlocks.rowBlocks.length > 0 || recordOutlineChanges.isChangeAll == true || recordOutlineChanges.changeBlocks.length > 0))
                console.log('recordSyncRowBlocks', recordSyncRowBlocks, recordOutlineChanges)
            if (recordSyncRowBlocks.deletes.length > 0 || recordSyncRowBlocks.rowBlocks.length > 0) {
                var ds = recordSyncRowBlocks.deletes;
                var rs = recordSyncRowBlocks.rowBlocks;
                var ops: BlockRefPageLink[] = []
                for (let i = 0; i < rs.length; i++) {
                    var rid = rs[i];
                    var row = this.find(g => g.id == rid);
                    if (row) {
                        var rfs = row.childs.filter(g => Array.isArray(g.refLinks) && g.refLinks.length > 0);
                        if (rfs.length > 0) {
                            await rfs.eachAsync(async rf => {
                                await rf.refLinks.eachAsync(async f => {
                                    var date;
                                    if (f.type == 'mention') {
                                        var da = row.childs.find(c => c.url == '/mention/date');
                                        if (da) {
                                            date = (da as any).date;
                                        }
                                    }
                                    ops.push({
                                        id: f.id,
                                        type: f.type,
                                        op: 'sync',
                                        ref: lodash.cloneDeep(f),
                                        elementUrl: getElementUrl(ElementType.Block, this.pageInfo.id, row.id),
                                        html: (await row.childs.asyncMap(async c => await c.getHtml())).join(""),
                                        blockId: row.id,
                                        date
                                    })
                                })
                            })
                        }
                    }
                }
                ds.forEach(c => {
                    ops.push({
                        id: c.id,
                        type: c.type,
                        op: 'delete',
                        ref: lodash.cloneDeep(c),
                    })
                })
                if (ops.length > 0) {
                    channel.fire(SyncMessageUrl.blcokSyncRefs, {
                        pageId: this.pageInfo.id,
                        operators: ops,
                    }, { locationId: PageLocation.pageSyncRefs })
                    if (!window.shyConfig?.isPro)
                        console.log('row block sync refs', ops);
                    await channel.post('/row/block/sync/refs', {
                        pageId: this.pageInfo.id,
                        operators: ops,
                        ws: this.ws
                    })
                }
            }
        }
        catch (ex) {
            this.onError(ex);
            console.error(ex);
        }
        try {
            /**
             * 这里暂时加载延迟，有部分同步操作需要等待block的内容渲染完成
             * 否则会出现大纲目录的更新不及时
             */

            if (recordOutlineChanges.isChangeAll == true || recordOutlineChanges.changeBlocks.length > 0) {
                var outLineBlock = this.find(g => g.url == BlockUrlConstant.Outline) as PageOutLine;
                if (outLineBlock) {
                    if (recordOutlineChanges.isChangeAll) outLineBlock.updateOutLine();
                    else {
                        var rcs = recordOutlineChanges.changeBlocks.map(c => this.find(g => g.id == c));
                        if (rcs.every(s => s?.id ? true : false)) {
                            rcs.forEach(rc => {
                                outLineBlock.updateHeadBlock(rc, rc == rcs[rcs.length - 1])
                            })
                        }
                        else if (rcs.length > 0) outLineBlock.updateOutLine();
                    }
                }
            }
        }
        catch (ex) {
            this.onError(ex);
            console.error(ex);
        }
    }
    private async onActionAfter(this: Page,
        fns: (() => Promise<void>)[]) {
        fns.each((f) => {
            f().then(() => {

            }).catch(e => {
                this.onError(e)
            })
        })
    }
    adjustListNumStr(blocks: Block[]) {
        if (blocks.length == 0) return;
        var bs: List[] = [];
        var rs: (Block[])[] = [];
        blocks.forEach(c => {
            if (!rs.includes(c.parentBlocks)) rs.push(c.parentBlocks)
        })
        lodash.remove(rs, g => g ? true : false);
        rs.forEach(c => {
            var ls = c.filter(g => g.url == BlockUrlConstant.List && (g as List).listType == ListType.number && !blocks.includes(g)) as List[];
            if (ls.length > 0) {
                bs.push(...ls);
            }
        })
        for (let b of bs) {
            b.forceManualUpdate()
        }
    }
    /**
     * 
     * 在onload加载后
     * 修复一些不正常的block
     */
    async loadPageRepair(this: Page) {
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
        if ([PageLayoutType.doc, PageLayoutType.db, PageLayoutType.board, PageLayoutType.ppt].includes(this.pageLayout.type)) {
            var ts = this.findAll(g => g.url == BlockUrlConstant.Title);
            if (ts.length > 1) {
                ts = ts.slice(1);
                await ts.eachAsync(async g => {
                    g.parentBlocks.remove(g);
                })
            }
        }
    }
    /**
     * 页面加载后，需要的自动处理
     * 如当前文档有子文档，那么该空白页面自动转成文档
     * 如当前文档下面新增了一些子文档，那么在页面的尾部需要新增子文档
     * 同时清理掉已经删除的子文档
     * @param this 
     */
    async AutomaticHandle(this: Page) {
        await this.onAction(ActionDirective.AutomaticHandle, async () => {
            var isForceUpdate: boolean = false;
            var isSyncSnap = false;
            if (this.pageLayout?.type == PageLayoutType.doc && this.requireSelectLayout == false && this.pageInfo) {
                var oldSubPages = this.addedSubPages.map(c => c)
                var subs = await this.pageInfo.getSubItems();
                var willClearItems = oldSubPages.filter(c => !subs.exists(s => s.id == c));
                if (this.autoRefSubPages == true) {
                    var items = subs.map(s => s);
                    lodash.remove(items, c => oldSubPages.includes(c.id));
                    var view = this.views[0];
                    items.removeAll(r => view.exists(c => c.url == BlockUrlConstant.Link && (c as any).getLink()?.pageId == r.id))
                    await items.eachAsync(async item => {
                        await this.createBlock(BlockUrlConstant.Link, { link: { name: 'page', pageId: item.id } }, view, view.blocks.childs.length, BlockChildKey.childs);
                        isForceUpdate = true;
                    });
                    if (items.length > 0) {
                        isForceUpdate = true;
                        await this.updateProps({
                            addedSubPages: subs.map(c => c.id)
                        })
                    }
                }
                var vs = this.views[0].findAll(c => c.url == BlockUrlConstant.Link && (c as any).getLink()?.pageId && willClearItems.includes((c as any).getLink().pageId));
                await vs.eachAsync(async v => {
                    await v.delete()
                })
            }
            if (this.requireSelectLayout == true) {
                var items = await this.pageInfo.getSubItems();
                if (items.length > 0) {
                    await this.updateProps({
                        requireSelectLayout: false,
                        pageLayout: {
                            type: PageLayoutType.doc
                        },
                        addedSubPages: items.map(c => c.id)
                    })
                    await channel.air('/page/update/info', { id: this.pageInfo?.id, pageInfo: { pageType: this.pageLayout.type } });
                    var view = this.views[0];
                    items.removeAll(r => view.exists(c => c.url == BlockUrlConstant.Link && (c as any).getLink()?.pageId == r.id))
                    await items.eachAsync(async item => {
                        await this.createBlock(BlockUrlConstant.Link, { link: { name: 'page', pageId: item.id } }, view, view.blocks.childs.length, BlockChildKey.childs);
                    })
                    isForceUpdate = true;
                    isSyncSnap = true;
                }
            }
            if (isForceUpdate == true) {
                this.snapshoot._disableSyncServer = false;
                if (isSyncSnap)
                    this.snapshoot._immediate = true;
                this.forceUpdate()
            }
            else {
                this.snapshoot._disableSyncServer = true;
            }
        }, {
            disabledJoinHistory: true
        })
    }
}

