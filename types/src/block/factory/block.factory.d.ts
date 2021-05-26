import { Page } from "../../page";
import { Block } from "..";
import { BaseComponent } from "../base/component";
export declare class BlockFactory {
    private static blockMap;
    static registerComponent(url: string, blockClass: typeof Block): void;
    static registerComponentView(url: string, blockView: typeof BaseComponent): void;
    static createBlock(url: string, page: Page, data: Record<string, any>, parent?: Block): Promise<Block>;
}
