import { Pattern } from ".";
import { BlockCss } from "./css";
import { CssSelectorType } from "./type";
export declare class BlockStyleCss {
    pattern: Pattern;
    constructor(options: Record<string, any>, pattern: Pattern);
    /**
     * 是否为某个部位的样式
     */
    part?: string;
    selector: CssSelectorType;
    id: string;
    date: number;
    /**
     * 如果selector是class，那么name里存的就是当前的样式类
     * 如果selector是伪类，那么name就是伪类的名称
     */
    name: string;
    cssList: BlockCss[];
    depend: {
        blockId: string;
        styleId: string;
    };
    load(options: any): void;
    get(): Record<string, any>;
    cloneData(): Record<string, any>;
    merge(css: BlockCss): void;
    get style(): Record<string, any>;
}
