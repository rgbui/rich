
import { Page } from "../../page";
import { Block } from "..";
import { BlockView } from "../view";
export class BlockFactory {
    private static blockMap: Map<string, { model: typeof Block, view: typeof BlockView }> = new Map();
    public static registerComponent(url: string, blockClass: typeof Block) {
        var b = this.blockMap.get(url);
        if (b) {
            b.model = blockClass;
        }
        else this.blockMap.set(url, { model: blockClass, view: null });
    }
    public static registerComponentView(url: string, blockView: typeof BlockView) {
        var b = this.blockMap.get(url);
        if (b) {
            b.view = blockView;
        }
        else this.blockMap.set(url, { view: blockView, model: null });
    }
    public static async createBlock(url: string, page: Page, data: Record<string, any>, parent?: Block) {
        var pb = this.parseBlockUrl(url);
        var bc = this.blockMap.get(pb.url);
        if (bc) {
            var newBlock: Block = new (bc.model as any)(page);
            newBlock.viewComponent = bc.view;
            if (parent) newBlock.parent = parent;
            if (typeof newBlock.initialLoad == 'function') await newBlock.initialLoad();
            if (data) {
                if (data.url) data.url = pb.url;
                else data.url = pb.url;
                await newBlock.load(Object.assign(pb.data, data));
            }
            if (typeof newBlock.initialedLoad == 'function') await newBlock.initialedLoad();
            return newBlock;
        }
        else {
            var error = new Error('not found block class:' + url);
            console.log('error', error);
            throw error;
        }
    }
    public static parseBlockUrl(url: string) {
        if (url.indexOf('?') > -1) {
            var us = url.split('?');
            var parms = us[1];
            var data: Record<string, any> = {};
            if (typeof parms == 'string' && parms.startsWith('{')) {
                try {
                    data = window.eval('(' + parms + ')');
                }
                catch (ex) {
                    console.error(ex);
                }
            }
            return {
                url: us[0],
                data
            }
        }
        else return {
            url,
            data: {}
        }
    }
    public static stringBlockUrl(url: string, data?: Record<string, any>) {
        if (data) {
            var parms = JSON.stringify(data);
            return url + '?' + parms;
        }
        else return url;
    }
}