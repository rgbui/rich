import lodash from "lodash";
import { channel } from "../../../net/channel";

const BLOCK_CACHE_KEY = 'block_prop_';

export class BlockCache {
    private static getCacheKey(key: string) {
        return BLOCK_CACHE_KEY + key;
    }
    static async set(key: string | object, value?: any) {
        if (typeof key == 'string') await channel.act('/cache/set', { key: this.getCacheKey(key), value })
        else if (lodash.isObject(key))
            for (let n in (key as object))
                await channel.act('/cache/set', { key: this.getCacheKey(n), value: key[n] })
    }
    static async get(key:string){
        var d = await channel.query('/cache/get', { key: this.getCacheKey(key) });
        return d;
    }
    static async getJSON(...keys: string[]) {
        var json: Record<string, any> = {};
        await keys.eachAsync(async k => {
            var d = await channel.query('/cache/get', { key: this.getCacheKey(k) });
            json[k] = d;
        })
        return json;
    }
}