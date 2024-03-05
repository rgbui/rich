import lodash from "lodash";
import { channel } from "../../../net/channel";
import { Block } from "../../block";
import { BlockUrlConstant } from "../../block/constant";
import { BlockRenderRange } from "../../block/enum";
const BLOCK_CACHE_KEY = 'b_c_';

export class BlockCache {
    private static getCacheKey(url: string, key: string) {
        return BLOCK_CACHE_KEY + url + key;
    }
    static async set(url: string, key: string | object, value?: any) {
        if (typeof key == 'string') await channel.act('/cache/set', { key: this.getCacheKey(url, key), value })
        else if (lodash.isObject(key))
            for (let n in (key as object))
                await channel.act('/cache/set', { key: this.getCacheKey(url, n), value: key[n] })
    }
    static async get(url: string, key: string) {
        var d = await channel.query('/cache/get', { key: this.getCacheKey(url, key) });
        return d;
    }
    static async getJSON(url: string, ...keys: string[]) {
        var json: Record<string, any> = {};
        await keys.eachAsync(async k => {
            var d = await channel.query('/cache/get', { key: this.getCacheKey(url, k) });
            if (typeof d != 'undefined')
                json[k] = d;
        })
        return json;
    }
}

export async function setBoardBlockCache(block: Block, defaultData?: Record<string, any>) {
    var url = block.url;
    async function setFontStyle() {
        var ps = await BlockCache.getJSON(url, 'fontSize', 'fontWeight', 'fontFamily', 'textDecoration');
        await block.pattern.setFontStyle(ps);
        var fs = await BlockCache.get(url, 'fontStyle');
        if (!lodash.isUndefined(fs)) {
            await block.pattern.setFontStyle({ fontStyle: fs ? 'italic' : 'normal' });
        }
        var fc = await BlockCache.get(url, 'fontColor');
        if (!lodash.isUndefined(fc)) {
            await block.pattern.setFontStyle({ color: fc });
        }
    }
    function removeDefault(d) {
        if (defaultData) {
            for (let n in d) {
                if (typeof defaultData[n] != 'undefined') delete d[n];
            }
        }
    }
    switch (block.url) {
        case BlockUrlConstant.Line:
            var bg = await BlockCache.get(url, 'backgroundColor');
            if (!lodash.isUndefined(bg)) {
                await block.pattern.setSvgStyle({ stroke: bg })
            }
            var ps = await BlockCache.getJSON(url, 'lineStart', 'lineEnd', 'lineType');
            removeDefault(ps);
            await block.updateProps(ps, BlockRenderRange.self);
            var svg = await BlockCache.getJSON(url, 'strokeWidth', 'strokeDasharray');
            removeDefault(svg);
            await block.pattern.setSvgStyle(svg);
            break;
        case BlockUrlConstant.Shape:
            var svg = await BlockCache.getJSON(url, 'stroke', 'strokeDasharray', 'strokeOpacity', 'strokeWidth', 'fillOpacity');
            removeDefault(svg);
            await  block.pattern.setSvgStyle(svg);
            var g = await BlockCache.get(url, 'fillColor');
            if (!lodash.isUndefined(g)) {
                await block.pattern.setSvgStyle({ fill: g })
            }
            await setFontStyle();
            break;
        case BlockUrlConstant.Pen:
            var g = await BlockCache.get(url, 'tickness');
            if (typeof g != 'undefined') {
                await block.pattern.setSvgStyle({ strokeWidth: g })
            }
            var bg = await BlockCache.get(url, 'backgroundColor');
            if (!lodash.isUndefined(bg)) {
                await block.pattern.setSvgStyle({ stroke: bg })
            }
            break;
        case BlockUrlConstant.Note:
            var g = await BlockCache.get(url, 'backgroundNoTransparentColor');
            if (!lodash.isUndefined(g)) {
                await block.updateProps({ color: g })
            }
            var c = await BlockCache.get(url, 'stickerSize');
            if (!lodash.isUndefined(c)) {
                if (c == 'big') { await block.updateProps({ fixedWidth: 400, fixedHeight: 400 }), BlockRenderRange.self }
                else if (c == 'medium') { await block.updateProps({ fixedWidth: 200, fixedHeight: 200 }), BlockRenderRange.self }
                else if (c == 'small') { await block.updateProps({ fixedWidth: 100, fixedHeight: 100 }), BlockRenderRange.self }
            }
            await setFontStyle();
            break;
        case BlockUrlConstant.Mind:

            break;
        case BlockUrlConstant.Frame:
            var bg = await BlockCache.get(url, 'backgroundColor');
            if (!lodash.isUndefined(bg)) {
                await block.pattern.setFillStyle({ color: bg, mode: 'color' });
            }
            break;
        case BlockUrlConstant.TextSpan:
            var bg = await BlockCache.get(url, 'backgroundColor');
            if (!lodash.isUndefined(bg)) {
                await  block.pattern.setFillStyle({ color: bg, mode: 'color' });
            }
            var ps = await BlockCache.getJSON(url, 'fontWeight', 'fontFamily', 'textDecoration');
            removeDefault(ps);
            await block.pattern.setFontStyle(ps);
            var fs = await BlockCache.get(url, 'fontStyle');
            if (!lodash.isUndefined(fs)) {
                await block.pattern.setFontStyle({ fontStyle: fs ? 'italic' : 'normal' });
            }
            var fc = await BlockCache.get(url, 'fontColor');
            if (!lodash.isUndefined(fc)) {
                await block.pattern.setFontStyle({ color: fc });
            }
            var fss = await BlockCache.get(url, 'fontSize');
            if (typeof fss != 'undefined') {
                await block.updateProps({ fontScale: fss / 14 })
            }
            break;

    }
}