import { Block } from "..";
import { TextEle } from "../../common/text.ele";

export enum BlockAppear {
    /**
     * 呈现的是文字的模式
     */
    text,
    /**
     * 一个整体的,不可分割
     */
    solid,
    none
}

export class AppearAnchor {
    get isText() {
        return this.appear == BlockAppear.text;
    }
    get isSolid() {
        return this.appear == BlockAppear.solid;
    }
    constructor(public block: Block, public el: HTMLElement, public appear: BlockAppear, public prop: string) {

    }
    get textContent() {
        if (this.isText) {
            return TextEle.getTextContent(this.el);
        }
    }
    get isEmpty() {
        if (this.isText) {
            var c = this.textContent;
            return c.length > 0 ? false : true;
        }
    }
}