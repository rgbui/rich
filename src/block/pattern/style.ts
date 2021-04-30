import { BlockCss } from "./css";
import { CssSelectorType } from "./type";

export class BlockStyleCss {
    /**
     * 是否为某个部位的样式
     */
    partName?: string;
    selector: CssSelectorType;
    id: string;
    date: number;
    /**
     * 如果selector是class，那么name里存的就是当前的样式类
     * 如果selector是伪类，那么name就是伪类的名称
     */
    name: string;
    cssList: BlockCss[] = [];
}