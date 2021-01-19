import { Page } from "../page";
import { BaseBlock } from "./base";
import { BlockClass } from "./declare";

export class BlockFactory {
    private static blockMap: Map<BlockClass, typeof BaseBlock> = new Map();
    public static register(name: BlockClass, blockClass: typeof BaseBlock) {
        this.blockMap.set(name, blockClass);
    }
    public static createBlock(name: BlockClass,page:Page) {
        var bc = this.blockMap.get(name);
        if (bc) {
            return new bc(page);
        }
        else throw new Error('not found block class:' + name)
    }
}