import { Block } from "..";
import { util } from "../../../util/util";
import { ActionDirective } from "../../history/declare";
import { BlockFactory } from "../factory/block.factory";
import { Pattern } from "../pattern";

export class Block$LifeCycle {
    async onAction(this: Block, directive: ActionDirective, action: () => Promise<void>) {
        await this.page.onAction(directive, action);
    }
    mounted(this: Block, fn: () => void) {
        this.once('mounted', fn);
    }
    init(this: Block) {

    }
    onMounted(this: Block,) {
        this.emit('mounted');
    }
    async onCreated(this: Block) {
        var keys = this.blockKeys;
        for (let key of keys) {
            await this.blocks[key].eachAsync(async (block) => {
                await block.onCreated();
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
        return await BlockFactory.createBlock(this.url, this.page, json, null);
    }
    async clone(this: Block) {
        var data = await this.cloneData();
        return await BlockFactory.createBlock(data.url, this.page, data, null);
    }
    /**
   * 实始加载，就是初始block时触发
   * 主要是加载初始的数据和模板
   */
    async initialLoad(this: Block) {

    }
    isLoad = false;
    async load(this: Block, data) {
        try {
            if (!this.pattern)
                this.pattern = new Pattern(this);
            for (var n in data) {
                if (n == 'blocks') continue;
                else if (n == 'pattern') {
                    await this.pattern.load(data[n]);
                    continue;
                }
                this[n] = data[n];
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
            this.isLoad = true;
        }
        catch (err) {
            this.page.onError(err);
        }
    }
    async get(this: Block) {
        var json: Record<string, any> = { id: this.id, url: this.url };
        if (typeof this.pattern.get == 'function')
            json.pattern = await this.pattern.get();
        else {
            console.log(this, this.pattern);
        }
        json.blocks = {};
        for (let b in this.blocks) {
            json.blocks[b] = await this.blocks[b].asyncMap(async x => await x.get());
        }
        if (Array.isArray(this.__props)) {
            this.__props.each(pro => {
                if (Array.isArray(this[pro])) {
                    json[pro] = this[pro].map(pr => {
                        if (typeof pr?.get == 'function') return pr.get();
                        else return util.clone(pr);
                    })
                }
                else if (typeof this[pro] != 'undefined') {
                    if (typeof this[pro]?.get == 'function')
                        json[pro] = this[pro].get();
                    else json[pro] = util.clone(this[pro]);
                }
            })
        }
        return json;
    }
}