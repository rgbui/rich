import lodash from "lodash";
import { Block } from "..";
import { channel } from "../../../net/channel";
import { dom } from "../../common/dom";
import { Matrix } from "../../common/matrix";
import { DropDirection } from "../../kit/handle/direction";
import { BlockFactory } from "../factory/block.factory";
import { Pattern } from "../pattern";

export class Block$LifeCycle {
    mounted(this: Block, fn: () => void) {
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
        this.registerPropMeta('matrix', Matrix, false, (v) => new Matrix(v), (v) => v.getValues())
    }
    /**
     * 不能被继承
     * @param this 
     */
    async onMounted(this: Block) {
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
    async cloneData(this: Block) {
        var json: Record<string, any> = { url: this.url };
        json.pattern = await this.pattern.cloneData();
        json.blocks = {};
        for (let b in this.blocks) {
            json.blocks[b] = await this.blocks[b].asyncMap(async x => await x.cloneData());
        }
        if (Array.isArray(this.__props)) {
            this.__props.each(pro => {
                json[pro] = this.clonePropData(pro, this[pro]);
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
    cloneProp(prop: string, value?: any) {
        if (!this.propMetas.some(s => s.key == prop)) {
            return typeof value != 'undefined' ? lodash.cloneDeep(value) : lodash.cloneDeep(lodash.get(this, prop))
        }
        else {
            var pm = this.propMetas.find(g => g.key == prop);
            var value = typeof value != 'undefined' ? value : lodash.get(this, prop);
            if (pm.isArray && Array.isArray(value)) {
                value = value.map(v => {
                    if (typeof pm.get == 'function') return pm.get(v);
                    else if (typeof v.get == 'function') return v.get();
                    else return lodash.cloneDeep(v);
                });
            }
            else if (value) {
                if (typeof pm.get == 'function') return pm.get(value);
                else if (typeof value.get == 'function') value = value.get();
                else value = lodash.cloneDeep(value);
            }
            if (pm.isArray) {
                if (Array.isArray(value)) return value.map(v => {
                    if (pm.create) {
                        var g = pm.create(v);
                        return g;
                    }
                    return new (pm.meta as any)(v);
                })
                return []
            }
            else {
                if (pm.create) return pm.create(value);
                return new (pm.meta as any)(value);
            }
        }
    }
    pm(prop: string) {
        return this.propMetas.find(g => g.key == prop);
    }
    clonePropData(prop: string, value?: any) {
        if (!this.propMetas.some(s => s.key == prop)) {
            return typeof value != 'undefined' ? lodash.cloneDeep(value) : lodash.cloneDeep(lodash.get(this, prop))
        }
        else {
            var pm = this.propMetas.find(g => g.key == prop);
            var value = typeof value != 'undefined' ? value : lodash.get(this, prop);
            if (pm.isArray && Array.isArray(value)) {
                value = value.map(v => {
                    if (typeof pm.get == 'function') return pm.get(v);
                    else if (typeof v.get == 'function') return v.get();
                    else return lodash.cloneDeep(v);
                });
            }
            else if (value) {
                if (typeof pm.get == 'function') value = pm.get(value);
                else if (typeof value.get == 'function') value = value.get();
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
    setPropData(prop: string, value: any) {
        var pm = this.propMetas.find(g => g.key == prop);
        if (pm) {
            if (pm.isArray) {
                this[prop] = [];
                if (Array.isArray(value)) {
                    value.forEach(d => {
                        if (typeof pm.create == 'function') this[prop].push(pm.create(d))
                        else this[prop].push(new (pm.meta as any)(d));
                    })
                }
            }
            else {
                if (typeof pm.create == 'function') lodash.set(this, prop, pm.create(value))
                else lodash.set(this, prop, new (pm.meta as any)(value))
            }
        }
        else lodash.set(this, prop, lodash.cloneDeep(value));
    }
    createPropObject(prop: string, value: any) {
        var pm = this.propMetas.find(g => g.key == prop);
        if (pm) {
            if (pm.isArray && Array.isArray(value)) {
                var vs = [];
                if (Array.isArray(value)) {
                    value.forEach(d => {
                        if (typeof pm.create == 'function') vs.push(pm.create(d))
                        else vs.push(new (pm.meta as any)(d));
                    })
                }
                return vs;
            }
            else {
                if (typeof pm.create == 'function') return pm.create(value)
                else return new (pm.meta as any)(value)
            }
        }
        else return lodash.cloneDeep(value)
    }
    registerPropMeta(key: string, meta: Function, isArray: boolean = false, create?: (v: any) => any, get?: (vobj: any) => any) {
        this.propMetas.push({ key, meta, isArray, create, get });
    }
    isLoad = false;
    async load(this: Block, data) {
        try {
            if (!this.pattern) this.pattern = new Pattern(this);
            for (var n in data) {
                if (n == 'blocks') continue;
                else if (n == 'pattern') await this.pattern.load(data[n]);
                else this.setPropData(n, data[n]);
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
            var r = await channel.get('/view/snap/query', { elementUrl: this.elementUrl });
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
                        else this.setPropData(n, data[n]);
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
                    this.page.onSyncUserActions(r.data.operates, 'loadSyncBlock');
            }
        }
        else {
            for (let n in this.blocks) {
                await this.blocks[n].eachAsync(async b => await b.loadSyncBlock());
            }
        }
    }
    async get(this: Block, args?: { syncBlock: boolean }, options?: { emptyChilds?: boolean }) {
        var json: Record<string, any> = {
            id: this._id,
            url: this.url,
            syncBlockId: this.syncBlockId,
            matrix: this.matrix ? this.matrix.getValues() : undefined
        };
        if (typeof this.pattern.get == 'function')
            json.pattern = await this.pattern.get();
        else {
            console.log(this, this.pattern);
        }
        json.blocks = {};
        if (!options?.emptyChilds == true) {
            for (let b in this.blocks) {
                if (this.allBlockKeys.some(s => s == b))
                    json.blocks[b] = await this.blocks[b].asyncMap(async x => await x.get(args));
            }
        }
        if (Array.isArray(this.__props)) {
            this.__props.each(pro => {
                json[pro] = this.clonePropData(pro, this[pro]);
            })
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
        var text = '';
        return text + await this.getChildsPlain();
    }
    async getChildsPlain(this: Block) {
        var text = '';
        for (let b in this.blocks) {
            if (this.allBlockKeys.some(s => s == b))
                text += (await this.blocks[b].asyncMap(async x => await x.getPlain())).join(" ");
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
    dropEnter(this: Block, direction: DropDirection) {
        var dire = DropDirection[direction];
        var className = 'shy-block-drag-over-' + dire;
        if (!this.el.classList.contains(className)) {
            dom(this.el).removeClass(g => g.startsWith('shy-block-drag-over'));
            this.el.classList.add(className);
        }
    }
    dropLeave(this: Block) {
        dom(this.el).removeClass(g => g.startsWith('shy-block-drag-over'));
    }
}