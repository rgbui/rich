import { Block } from "..";
import { BlockStyleCss } from "./style";
import { CssSelectorType } from "./type";
import { BlockCss, BlockCssName } from "./css";
export declare class Pattern {
    block: Block;
    id: string;
    date: number;
    styles: BlockStyleCss[];
    constructor(block: Block);
    load(options: Record<string, any>): Promise<void>;
    get(): Promise<{
        id?: undefined;
        date?: undefined;
        styles?: undefined;
    } | {
        id: string;
        date: number;
        styles: Record<string, any>[];
    }>;
    cloneData(): Promise<{
        styles: Record<string, any>[];
    }>;
    declare<T extends BlockCss>(name: string, selector: CssSelectorType, css: Partial<T>): void;
    get style(): Record<string, any>;
    setStyle(cssName: BlockCssName, style: Record<string, any>): void;
}
