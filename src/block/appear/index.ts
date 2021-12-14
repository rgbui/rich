import { Block } from "..";
import { Point, Rect } from "../../common/point";
import { TextEle } from "../../common/text.ele";
import { Anchor } from "../../kit/selection/anchor";
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
    get at() {
        return this.block.appearAnchors.findIndex(g => g == this);
    }
    get next() {
        return this.block.appearAnchors[this.at + 1];
    }
    get prev() {
        return this.block.appearAnchors[this.at - 1];
    }
    createAnchorByPoint(point: Point) {
        if (this.isText) {
            var at = TextEle.getAt(this.el, point);
            return this.createHeadAnchor(at);
        }
        else return this.createHeadAnchor();
    }
    createAnchorByX(x: number, isTail?: boolean) {
        if (this.isText) {
            var bound = Rect.fromEle(this.el);
            var top = bound.top + 10;
            if (isTail == true) {
                top = bound.top + bound.height - 10;
            }
            var point = new Point(x, top);
            return this.createAnchorByPoint(point);
        }
        else return this.createHeadAnchor();
    }
    createHeadAnchor(at?: number) {
        var anchor = new Anchor(this.block.page.kit.explorer, this);
        if (typeof at == 'number' && anchor.isText) {
            if (at == -1) anchor.at = anchor.elementAppear.textContent.length;
            else anchor.at = at;
        }
        else if (anchor.isText && typeof at == 'undefined') {
            anchor.at = 0;
        }
        return anchor;
    }
    createBackAnchor(at?: number) {
        var anchor = new Anchor(this.block.page.kit.explorer, this);
        if (typeof at == 'undefined') at = -1;
        if (typeof at == 'number' && anchor.isText) {
            if (at == -1) anchor.at = anchor.elementAppear.textContent.length;
            else anchor.at = at;
        }
        return anchor;
    }
    updateElementHtml() {
        var content = this.block[this.prop];
        this.el.innerHTML = content;
    }
}