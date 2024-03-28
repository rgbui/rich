
import { Page } from "../../page";
import { Block } from "..";
import { BlockView } from "../view";
import { ParseBlockUrl } from "../constant";
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
        var pb = ParseBlockUrl(url);
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
}