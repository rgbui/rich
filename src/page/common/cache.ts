import lodash from "lodash";
import { channel } from "../../../net/channel";
import { Block } from "../../block";
import { BlockUrlConstant } from "../../block/constant";
import { BlockRenderRange } from "../../block/enum";
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
    static async get(key: string) {
        var d = await channel.query('/cache/get', { key: this.getCacheKey(key) });
        return d;
    }
    static async getJSON(...keys: string[]) {
        var json: Record<string, any> = {};
        await keys.eachAsync(async k => {
            var d = await channel.query('/cache/get', { key: this.getCacheKey(k) });
            if (typeof d != 'undefined')
                json[k] = d;
        })
        return json;
    }
}

export async function setBoardBlockCache(block: Block) {
    async function setFontStyle() {
        var ps = await BlockCache.getJSON('fontSize', 'fontWeight', 'fontFamily', 'textDecoration');
        block.pattern.setFontStyle(ps);
        var fs = await BlockCache.get('fontStyle');
        if (!lodash.isUndefined(fs)) {
            block.pattern.setFontStyle({ fontStyle: fs ? 'italic' : 'normal' });
        }
        var fc = await BlockCache.get('fontColor');
        if (!lodash.isUndefined(fc)) {
            block.pattern.setFontStyle({ color: fc });
        }
    }
    switch (block.url) {
        case BlockUrlConstant.Line:
            var bg = await BlockCache.get('backgroundColor');
            if (!lodash.isUndefined(bg)) {
                block.pattern.setSvgStyle({ stroke: bg })
            }
            var ps = await BlockCache.getJSON('lineStart', 'lineEnd', 'lineType');
            await block.updateProps(ps, BlockRenderRange.self);
            var svg = await BlockCache.getJSON('strokeWidth', 'strokeDasharray');
            block.pattern.setSvgStyle(svg);
            break;
        case BlockUrlConstant.Shape:
            var svg = await BlockCache.getJSON('stroke', 'strokeDasharray', 'strokeOpacity', 'strokeWidth', 'fillOpacity');
            block.pattern.setSvgStyle(svg);
            var g = await BlockCache.get('fillColor');
            if (!lodash.isUndefined(g)) {
                block.pattern.setSvgStyle({ fill: g })
            }
            await setFontStyle();
            break;
        case BlockUrlConstant.Pen:
            var g = await BlockCache.get('tickness');
            if (typeof g != 'undefined') {
                block.pattern.setSvgStyle({ strokeWidth: g })
            }
            var bg = await BlockCache.get('backgroundColor');
            if (!lodash.isUndefined(bg)) {
                block.pattern.setSvgStyle({ stroke: bg })
            }
            break;
        case BlockUrlConstant.Note:
            var g = await BlockCache.get('backgroundNoTransparentColor');
            if (!lodash.isUndefined(g)) {
                await block.updateProps({ color: g })
            }
            var c = await BlockCache.get('stickerSize');
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
            var bg = await BlockCache.get('backgroundColor');
            if (!lodash.isUndefined(bg)) {
                block.pattern.setFillStyle({ color: bg, mode: 'color' });
            }
            break;
        case BlockUrlConstant.TextSpan:
            var bg = await BlockCache.get('backgroundColor');
            if (!lodash.isUndefined(bg)) {
                block.pattern.setFillStyle({ color: bg, mode: 'color' });
            }
            var ps = await BlockCache.getJSON('fontWeight', 'fontFamily', 'textDecoration');
            block.pattern.setFontStyle(ps);
            var fs = await BlockCache.get('fontStyle');
            if (!lodash.isUndefined(fs)) {
                block.pattern.setFontStyle({ fontStyle: fs ? 'italic' : 'normal' });
            }
            var fc = await BlockCache.get('fontColor');
            if (!lodash.isUndefined(fc)) {
                block.pattern.setFontStyle({ color: fc });
            }
            var fss = await BlockCache.get('fontSize');
            if (typeof fss != 'undefined') {
                await block.updateProps({ fontScale: fss / 14 })
            }
            break;

    }
}