import { Component } from "react";
import { Page } from "../../page";
import { Block } from "..";
import { BaseComponent } from "../base/component";
import { parseBlockUrl } from "../../common/util";

export class BlockFactory {
    private static blockMap: Map<string, { model: typeof Block, view: typeof BaseComponent }> = new Map();
    public static registerComponent(url: string, blockClass: typeof Block) {
        var b = this.blockMap.get(url);
        if (b) {
            b.model = blockClass;
        }
        else this.blockMap.set(url, { model: blockClass, view: null });
    }
    public static registerComponentView(url: string, blockView: typeof BaseComponent) {
        var b = this.blockMap.get(url);
        if (b) {
            b.view = blockView;
        }
        else this.blockMap.set(url, { view: blockView, model: null });
    }
    public static async createBlock(url: string, page: Page, data: Record<string, any>, parent?: Block) {
        var pb = parseBlockUrl(url);
        var bc = this.blockMap.get(pb.url);
        if (bc) {
            var newBlock: Block = new (bc.model as any)(page);
            newBlock.viewComponent = bc.view;
            if (parent) newBlock.parent = parent;
            if (data) await newBlock.load(Object.assign(pb.data, data));
            return newBlock;
        }
        else throw new Error('not found block class:' + url)
    }
}