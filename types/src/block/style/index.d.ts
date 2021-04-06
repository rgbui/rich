import { Block } from "../base";
import { BlockState } from "../base/enum";
import { BorderStyle, FillStyle, FilterStyle, FontStyle, RadiusStyle, ShadowStyle, TransformStyle } from "./type";
export declare class BlockStyle {
    block: Block;
    id: string;
    date: number;
    /**
     * 表标当前的样式依赖于其它block，
     * 比如鼠标移到一个block，
     * 某个元素会发生变化
     */
    dependBlockId: string;
    dependStyleId: string;
    /***
     * 当前样式的状态
     */
    state: BlockState;
    styles: Record<string, Style>;
    constructor(block: Block);
    load(options: Record<string, any>): Promise<void>;
    get(): Promise<Record<string, any>>;
}
export declare class Style {
    font: FontStyle;
    border: BorderStyle;
    shadows: ShadowStyle;
    radius: RadiusStyle;
    filters: FilterStyle;
    fills: FillStyle;
    transform: TransformStyle;
    constructor(options: any);
    get(): Record<string, any>;
}
