import lodash from "lodash";
import { Block } from "..";
import { channel } from "../../../net/channel";
import { dom } from "../../common/dom";
import { Matrix } from "../../common/matrix";
import { DropDirection } from "../../kit/handle/direction";
import { BlockFactory } from "../factory/block.factory";
import { Pattern } from "../pattern";
import { GetFontStores, loadFontFamily } from "../../../extensions/board.edit.tool/fontfamily/store";

export class Block$LifeCycle {
    mounted(this: Block,
        fn: () => void
    ) {
        this.once('mounted', fn);
    }
    /**
     * 继承使用的
     * 
     * @param this 
     */
    init(this: Block) {

    }
    /**
     * 不能继承使用
     * @param this 
     */
    protected _init(this: Block) {
        this.registerPropMeta('matrix', Matrix, false, (v) => {
            try {
                return new Matrix(v)
            }
            catch (ex) {
                console.trace(v);
                this.page.onError(ex);
                return new Matrix(v);
            }
        }, (v) => v.getValues())
    }
    /**
     * 不能被继承
     * @param this 
     */
    async onMounted(this: Block) {
        var fontFamily = this?.pattern?.getFontStyle()?.fontFamily;
        if (fontFamily) {
            var ls = GetFontStores().find(c => c.name == fontFamily);
            if (ls) {
                loadFontFamily(ls.name)
            }
        }
        if (this.createSource) {
            await this.createdDidMounted()
        }
        var refBlock = this.refBlock;
        if (refBlock) {
            refBlock.registerReferenceBlocker(this);
        }
        if (typeof this.didMounted == 'function') await this.didMounted();
        this.emit('mounted');
    }
    async onUnmount(this: Block) {
        var refBlock = this.refBlock;
        if (refBlock) {
            refBlock.cancelReferenceBlocker(this);
        }
        if (typeof this.didUnmounted == 'function') await this.didUnmounted();
        this.emit('umMounted');
    }
    async didMounted(this: Block) {

    }
    async didUnmounted(this: Block) {

    }
    async createdDidMounted() {

    }
    async created(this: Block) {
        var keys = this.allBlockKeys;
        for (let key of keys) {
            await this.blocks[key].eachAsync(async (block) => {
                await block.created();
            })
        }
    }
    async cloneData(this: Block, options?: { isButtonTemplate?: boolean }) {
        var json: Record<string, any> = { url: this.url };
        json.pattern = await this.pattern.cloneData();
        json.blocks = {};
        for (let b in this.blocks) {
            json.blocks[b] = await this.blocks[b].asyncMap(async x => await x.cloneData(options));
        }
        if (Array.isArray(this.__props)) {
            await this.__props.eachAsync(async pro => {
                json[pro] = await this.clonePropData(pro, this[pro]);
            })
        }
        return json;
    }
    /**
   * 实始加载，就是初始block时触发
   * 主要是加载初始的数据和模板
   */
    async initialLoad(this: Block) {

    }
    async initialedLoad(this: Block) {

    }
    private propMetas: { key: string, meta?: Function, create?: (v: any) => any, get?: (v: any) => any, isArray: boolean }[] = [];
    async cloneProp(prop: string, value?: any) {
        if (!this.propMetas.some(s => s.key == prop)) {
            return typeof value != 'undefined' ? lodash.cloneDeep(value) : lodash.cloneDeep(lodash.get(this, prop))
        }
        else {
            var pm = this.propMetas.find(g => g.key == prop);
            var value = typeof value != 'undefined' ? value : lodash.get(this, prop);
            if (pm.isArray && Array.isArray(value)) {
                value = await value.asyncMap(async v => {
                    if (typeof pm.get == 'function') return await pm.get(v);
                    else if (typeof v.get == 'function') return await v.get();
                    else return lodash.cloneDeep(v);
                });
            }
            else if (value) {
                if (typeof pm.get == 'function') return await pm.get(value);
                else if (typeof value.get == 'function') value = await value.get();
                else value = lodash.cloneDeep(value);
            }
            if (pm.isArray) {
                if (Array.isArray(value)) return await value.asyncMap(async v => {
                    if (pm.create) {
                        var g = await pm.create(v);
                        return g;
                    }
                    return new (pm.meta as any)(v);
                })
                return []
            }
            else {
                if (pm.create) return await pm.create(value);
                return new (pm.meta as any)(value);
            }
        }
    }
    pm(prop: string) {
        return this.propMetas.find(g => g.key == prop);
    }
    async clonePropData(prop: string, value?: any) {
        if (!this.propMetas.some(s => s.key == prop)) {
            return typeof value != 'undefined' ? lodash.cloneDeep(value) : lodash.cloneDeep(lodash.get(this, prop))
        }
        else {
            var pm = this.propMetas.find(g => g.key == prop);
            var value = typeof value != 'undefined' ? value : lodash.get(this, prop);
            if (pm.isArray && Array.isArray(value)) {
                value = await value.asyncMap(async v => {
                    if (typeof pm.get == 'function') return await pm.get(v);
                    else if (typeof v.get == 'function') return await v.get();
                    else return lodash.cloneDeep(v);
                });
            }
            else if (value) {
                if (typeof pm.get == 'function') value = await pm.get(value);
                else if (typeof value.get == 'function') value = await value.get();
                else value = lodash.cloneDeep(value);
            }
            if (pm.isArray) {
                if (Array.isArray(value)) return value;
                return []
            }
            else {
                return value;
            }
        }
    }
    async setPropData(prop: string, value: any) {
        var pm = this.propMetas.find(g => g.key == prop);
        if (pm) {
            if (pm.isArray) {
                this[prop] = [];
                if (Array.isArray(value)) {
                    await value.eachAsync(async d => {
                        if (typeof pm.create == 'function') this[prop].push(await pm.create(d))
                        else this[prop].push(new (pm.meta as any)(d));
                    })
                }
            }
            else {
                if (typeof pm.create == 'function') lodash.set(this, prop, await pm.create(value))
                else lodash.set(this, prop, new (pm.meta as any)(value))
            }
        }
        else lodash.set(this, prop, lodash.cloneDeep(value));
    }
    async createDataPropObject(data: Record<string, any>) {
        var json = {};
        for (var n in data) {
            if (typeof data[n] == 'undefined') continue;
            if (n == 'blocks') continue;
            else if (n == 'pattern') json[n] = await this.createPropObject(n, data[n]);
            else json[n] = await this.createPropObject(n, data[n]);
        }
        return json;
    }
    async createPropObject(prop: string, value: any) {
        var pm = this.propMetas.find(g => g.key == prop);
        if (pm) {
            if (pm.isArray && Array.isArray(value)) {
                var vs = [];
                if (Array.isArray(value)) {
                    await value.eachAsync(async d => {
                        if (typeof pm.create == 'function') vs.push(await pm.create(d))
                        else vs.push(new (pm.meta as any)(d));
                    })
                }
                return vs;
            }
            else {
                if (typeof pm.create == 'function') return await pm.create(value)
                else return new (pm.meta as any)(value)
            }
        }
        else return lodash.cloneDeep(value)
    }
    registerPropMeta(key: string, meta: Function, isArray: boolean = false, create?: (v: any) => any, get?: (vobj: any) => any) {
        this.propMetas.push({ key, meta, isArray, create, get });
    }
    /**
     * 标记block的load是否完成
     */
    isLoad = false;
    async load(this: Block, data) {
        try {
            if (!this.pattern) this.pattern = new Pattern(this);
            for (var n in data) {
                if (typeof data[n] == 'undefined') continue;
                if (n == 'blocks') continue;
                else if (n == 'pattern') await this.pattern.load(data[n]);
                else await this.setPropData(n, data[n]);
            }
            if (this.syncBlockId) {
                //await this.loadSyncBlock();
            }
            else {
                if (typeof data.blocks == 'object') {
                    for (var n in data.blocks) {
                        var childs = data.blocks[n];
                        this.blocks[n] = [];
                        await childs.eachAsync(async (dc) => {
                            try {
                                var block = await BlockFactory.createBlock(dc.url, this.page, dc, this);
                                this.blocks[n].push(block);
                            }
                            catch (ex) {
                                console.error(ex);
                            }
                        })
                    }
                }
            }
            this.isLoad = true;
        }
        catch (err) {
            this.page.onError(err);
        }
    }
    async loadSyncBlock(this: Block) {
        if (this.syncBlockId) {
            lodash.remove(this.page.snapLoadLocker, s => s.date + 1000 * 30 < Date.now());
            var rc = this.page.snapLoadLocker.find(s => s.url == this.elementUrl);
            if (rc) {
                if (rc.date + 1000 * 5 > Date.now()) {
                    if (rc.count > 10) {
                        this.page.onError(new Error('数据加载失败，请稍后再试'));
                        return;
                    }
                    else { rc.count += 1; rc.date = Date.now(); }
                }
                else { rc.date = Date.now(); rc.count = 0; }
            }
            else this.page.snapLoadLocker.push({ url: this.elementUrl, count: 0, date: Date.now() })

            var r = await channel.get('/view/snap/query', { ws: this.page.ws, elementUrl: this.elementUrl });
            if (r.ok) {
                var data;
                try {
                    data = r.data.content as any;
                    if (typeof data == 'string') data = JSON.parse(data);
                    delete data.id;
                }
                catch (ex) {
                    console.error(ex);
                    this.page.onError(ex);
                }
                if (typeof data == 'object') {
                    for (var n in data) {
                        if (n == 'blocks') continue;
                        else if (n == 'pattern') await this.pattern.load(data[n]);
                        else if (n == 'url') continue;
                        else await this.setPropData(n, data[n]);
                    }
                    if (typeof data.blocks == 'object') {
                        for (var n in data.blocks) {
                            var childs = data.blocks[n];
                            this.blocks[n] = [];
                            await childs.eachAsync(async (dc) => {
                                var block = await BlockFactory.createBlock(dc.url, this.page, dc, this);
                                this.blocks[n].push(block);
                            })
                        }
                    }
                }
                if (Array.isArray(r.data.operates) && r.data.operates.length > 0)
                    await this.page.onSyncUserActions(r.data.operates, 'loadSyncBlock');
            }
        }
        for (let n in this.blocks) {
            await this.blocks[n].eachAsync(async b => await b.loadSyncBlock());
        }
    }
    async get(this: Block, args?: { syncBlock: boolean }, options?: { emptyChilds?: boolean }) {
        var isFb = this.isFreeBlock;
        var json: Record<string, any> = {
            id: this._id,
            url: this.url,
            syncBlockId: this.syncBlockId,
            // matrix: isFb && this.matrix ? this.matrix.getValues() : undefined
        };
        if (typeof this.pattern.get == 'function') {
            json.pattern = await this.pattern.get();
            if (Object.keys(json.pattern).length == 0) delete json.pattern;
        }
        else {
            console.log(this, this.pattern);
        }
        json.blocks = {};
        if (!options?.emptyChilds == true) {
            for (let b in this.blocks) {
                if (this.allBlockKeys.some(s => s == b)) {
                    try {
                        json.blocks[b] = await this.blocks[b].asyncMap(async x => await x.get(args));
                    }
                    catch (ex) {
                        console.error(ex);
                    }
                    lodash.remove(json.blocks[b], g => typeof g == 'undefined' || lodash.isNull(g));
                }
            }
        }
        if (Array.isArray(this.__props)) {
            await this.__props.eachAsync(async pro => {
                if (!isFb && ['isScale', 'matrix', 'fixedHeight', 'refLines', 'zindex', 'fixedWidth'].includes(pro)) return;
                try {
                    json[pro] = await this.clonePropData(pro, this[pro]);
                }
                catch (ex) {
                    console.error(ex);
                }
            })
        }
        if (json?.locker && json?.locker?.lock == false) {
            delete json.locker;
        }
        return json;
    }
    async getString(this: Block) {
        return JSON.stringify(await this.get());
    }
    /**
     * 获取同步块保存的信息
     * @param this 
     * @returns 
     */
    async getSyncString(this: Block) {
        return JSON.stringify(await this.get());
    }
    async getPlain(this: Block) {
        var text = this.content || '';
        return text + await this.getChildsPlain();
    }
    async getBlockPlain(this: Block) {
        var text = this.content || '';
        return text + ((await this.childs.asyncMap(async c => await c.getPlain())).join(''))
    }
    async getChildsPlain(this: Block) {
        var text = '';
        for (let b in this.blocks) {
            if (this.allBlockKeys.some(s => s == b))
                text += (await this.blocks[b].asyncMap(async x => await x.getPlain())).join("");
        };
        return text;
    }
    async getHtml(this: Block) {
        var text = '';
        return text + await this.getChildsHtml();
    }
    async getChildsHtml(this: Block) {
        var text = '';
        for (let b in this.blocks) {
            if (this.allBlockKeys.some(s => s == b))
                text += await this.blocks[b].asyncMap(async x => await x.getHtml());
        };
        return text;
    }
    async getMd(this: Block) {
        var text = this.content || '';
        return text + await this.getChildsMd();
    }
    async getChildsMd(this: Block, isLine?: boolean) {
        var ps: string[] = [];
        for (let b in this.blocks) {
            if (this.allBlockKeys.some(s => s == b)) {
                ps.push(...await this.blocks[b].asyncMap(async x => await x.getMd()));
            }
        };
        return isLine ? ps.join('') : ps.join('  \n');
    }
    dropEnter(this: Block, direction: DropDirection, dropEl?: HTMLElement) {
        var dire = DropDirection[direction];
        var className = 'shy-block-drag-over-' + dire;
        if (dropEl) {
            dom(this.el).removeClass(g => g.startsWith('shy-block-drag-over'));
            var ds = Array.from(this.el.querySelectorAll('[data-block-drop-panel]'));
            ds.forEach(d => {
                dom(d).removeClass(g => g.startsWith('shy-block-drag-over'));
            });
            if (!dropEl.classList.contains(className))
                dropEl.classList.add(className);
        }
        else {
            if (!this.el.classList.contains(className)) {
                dom(this.el).removeClass(g => g.startsWith('shy-block-drag-over'));
                this.el.classList.add(className);
            }
            var ds = Array.from(this.el.querySelectorAll('[data-block-drop-panel]'));
            ds.forEach(d => {
                dom(d).removeClass(g => g.startsWith('shy-block-drag-over'));
            });
        }
    }
    dropLeave(this: Block) {
        dom(this.el).removeClass(g => g.startsWith('shy-block-drag-over'));
        if (this.page.viewEl) {
            var ds = Array.from(this.page.viewEl.querySelectorAll('[data-block-drop-panel]'));
            ds.forEach(d => {
                dom(d).removeClass(g => g.startsWith('shy-block-drag-over'));
            });
        }
    }
    /**
     * 这里用来标记录block的数据是否加载过
     * 不能因为view每次的didMounted，就重新加载数据
     * 需要确保fn里面的执行的加载跟block是相关的，而不是跟view相关的，
     * 否则会导致view上面的数据出现不存在的情况
     * @param this 
     * @param fn 
     * @returns 
     */
    async onBlockLoadData(this: Block, fn: () => Promise<void>) {
        if (this.blockLoadStatus?.isSuccessfully == true) return;
        try {
            if (!this.blockLoadStatus) this.blockLoadStatus = {
                loading: false,
                isSuccessfully: false,
                isError: false,
                errorData: null
            }
            this.blockLoadStatus.loading = true;
            await fn()
            this.blockLoadStatus.isSuccessfully = true;
        }
        catch (ex) {
            this.blockLoadStatus.errorData = ex;
            this.blockLoadStatus.isError = true;
        }
        finally {
            this.blockLoadStatus.loading = false;
        }
    }
    async onBlockReloadData(this: Block, fn: () => Promise<void>) {
        try {
            if (!this.blockLoadStatus) this.blockLoadStatus = {
                loading: false,
                isSuccessfully: false,
                isError: false,
                errorData: null
            }
            this.blockLoadStatus.loading = true;
            await fn()
            this.blockLoadStatus.isSuccessfully = true;
        }
        catch (ex) {
            this.blockLoadStatus.errorData = ex;
            this.blockLoadStatus.isError = true;
        }
        finally {
            this.blockLoadStatus.loading = false;
        }
    }
}