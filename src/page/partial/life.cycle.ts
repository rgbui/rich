import { Page } from "..";
import { Block } from "../../block";
import { View } from "../../block/element/view";
import { BlockFactory } from "../../block/factory/block.factory";
import { UserAction, ViewOperate } from "../../history/action";
import { ActionDirective } from "../../history/declare";
import { PageDirective } from "../directive";
import { PageHistory } from "../interaction/history";
import { PageKeys } from "../interaction/keys";
import {  BlockUrlConstant } from "../../block/constant";
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
        ups = lodash.uniq(ups);
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
                    try {
                        if (up) await up.forceUpdate();
                    }
                    catch (ex) {
                        console.error(ex);
                    }
                })
            }
            catch (ex) {
                console.error(ex);
                self.onError(ex);
            }
            await fns.eachAsync(async g => {
                try {
                    await g()
                }
                catch (ex) {
                    console.error(ex);
                }
            });
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
                        if (row && row.exists(g => Array.isArray(g.refLinks) && g.refLinks.length > 0)) {
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
        options?: { disabledStore?: boolean, immediate?: boolean }
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
  
 
      /**
     * 这里表示刚创建的block,是新的
     * 不是通过load创建
     * @param block 
     */
      async onNotifyCreateBlock(this: Page, block: Block) {
        block.creater = this.user?.id;
        block.createDate = Date.now();
        block.editor = this.user?.id;
        block.editDate = Date.now();
    }
    async onNotifyEditBlock(this: Page, block: Block) {
        if (this.user) {
            await block.updateProps({
                editor: this.user.id,
                editDate: Date.now()
            })
        }
    }
}

