import { Component } from "react";
import { Page } from "../page";
import { BaseBlock } from "./base";
import { BlockClass } from "./common.enum";

export class BlockFactory {
    private static blockMap: Map<BlockClass, { model: typeof BaseBlock, view: typeof Component | ((props: any) => JSX.Element) }> = new Map();
    public static register(name: BlockClass, blockClass: typeof BaseBlock, blockView: typeof Component | ((props: any) => JSX.Element)) {
        this.blockMap.set(name, { model: blockClass, view: blockView });
    }
    public static createBlock(name: BlockClass, page: Page) {
        if (typeof name == 'string') name = BlockClass[name] as any;
        var bc = this.blockMap.get(name);
        if (bc) {
            var newBlock = new bc.model(page);
            newBlock.viewComponent = bc.view;
            return newBlock;
        }
        else throw new Error('not found block class:' + name)
    }
}