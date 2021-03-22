import { Component } from "react";
import { Page } from "../../page";
import { BaseBlock } from "../base";
import { BaseComponent } from "../base/component";

export class BlockFactory {
    private static blockMap: Map<string, { model: typeof BaseBlock, view: typeof BaseComponent }> = new Map();
    public static registerComponent(url: string, blockClass: typeof BaseBlock) {
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
    public static createBlock(url: string, page: Page) {
        var bc = this.blockMap.get(url);
        if (bc) {
            var newBlock = new bc.model(page);
            newBlock.viewComponent = bc.view;
            return newBlock;
        }
        else throw new Error('not found block class:' + url)
    }
}