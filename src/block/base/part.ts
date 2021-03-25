import { Block } from ".";
import { TextEle } from "../../common/text.ele";
import { BlockAppear, BlockDisplay } from "./enum";

export class BlockPart {
    block: Block;
    name: string;
    el: HTMLElement;
    appear: BlockAppear;
    place: PartPlace;
    display: BlockDisplay;
    /**
     * 当前part所对应的block属性值
     */
    propkey?: string;
    /**
     * 当前part在block中所有的排序，如果没有index，默认放最后面
     */
    index?: number;
    getBounds() {
        return TextEle.getBounds(this.el);
    }
    get isText() {
        return this.appear == BlockAppear.text;
    }
    get isSolid() {
        return this.appear == BlockAppear.solid;
    }
    get textEl() {
        var el = this.el;
        if (!el.classList.contains('sy-appear-text')) {
            var c: HTMLElement = el.querySelector('.sy-appear-text');
            if (!c) throw new Error('not found appear text')
            else el = c;
        }
        return el;
    }
    get soldEl() {
        var el = this.el;
        if (!el.classList.contains('sy-appear-solid')) {
            var c: HTMLElement = el.querySelector('.sy-appear-solid');
            if (!c) throw new Error('not found appear solid')
            else el = c;
        }
        return el;
    }
}

export enum PartPlace {
    /**
     * 是自身
     */
    self,
    /**
     * block的某个局部位置
     */
    part,
    /**
     * 子元素容器
     */
    childs
}