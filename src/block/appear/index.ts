import { Block } from "..";
import { Point, Rect } from "../../common/vector/point";
import { TextEle } from "../../common/text.ele";
import { Anchor } from "../../kit/selection/anchor";
import { AppearVisibleSeek } from "./visible.seek";
import { BlockUrlConstant } from "../constant";
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
    constructor(public block: Block,
        public el: HTMLElement,
        public appear: BlockAppear,
        public prop: string,
        public plain: boolean
    ) {

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



    visibleTextNext(): AppearAnchor {
        /**
        * 在块内查找
        */
        var vp = this.block.appearAnchors.find((g, i) => i > this.at && g.isText);
        if (vp) return vp;
        /**
        * 如果当前块是行内块，那么在行内查找
        */
        if (this.block.isLine) {
            var pbs = this.block.parentBlocks;
            var at = pbs.findIndex(g => g === this.block);
            var pb = pbs.find((g, i) => i > at && g.isLine && g.appearAnchors.some(s => s.isText));
            if (pb) {
                return pb.appearAnchors.find(g => g.isText);
            }
        }
        /**
         * 下面是通过视觉去查找，先水平从左到右，然后在下一行从左到右
         */
        return AppearVisibleSeek(this, { arrow: 'right' });
    }
    visibleTextPrev(): AppearAnchor {
        /**
         * 在块内查找
         */
        var vp = this.block.appearAnchors.find((g, i) => i < this.at && g.isText);
        if (vp) return vp;
        /**
         * 如果当前块是行内块，那么在行内查找
         */
        if (this.block.isLine) {
            var pbs = this.block.parentBlocks;
            var at = pbs.findIndex(g => g === this.block);
            var pb = pbs.find((g, i) => i < at && g.isLine && g.appearAnchors.some(s => s.isText));
            if (pb) {
                return pb.appearAnchors.findLast(g => g.isText);
            }
        }
        var row = this.block.closest(x => !x.isLine);
        /**
         * 下面是通过视觉去查找，先从右到左，然后上一行从右到左
         */
        return AppearVisibleSeek(this, { arrow: 'left' });
    }
    visibleDown(): AppearAnchor {
        /**
      * 在块内查找
      */
        var vp = this.block.appearAnchors.find((g, i) => i > this.at && g.isText);
        if (vp) return vp;
        return AppearVisibleSeek(this, { arrow: 'down' });
    }
    visibleUp(): AppearAnchor {
        /**
        * 在块内查找
        */
        var vp = this.block.appearAnchors.find((g, i) => i < this.at && g.isText);
        if (vp) return vp;
        return AppearVisibleSeek(this, { arrow: 'up' });
    }
    isStart(node: Node, offset: number) {
        if (offset != 0) return false;
        if (node instanceof Text) {
            if (node == this.el.childNodes[0]) return true;
        }
        return false;
    }
    isEnd(node: Node, offset: number) {
        if (node instanceof Text) {
            if (node = this.el.childNodes[this.el.childNodes.length - 1]) {
                var text = node.textContent;
                if (offset = text.length) return true;
            }
        }
        return false;
    }
    get textNode() {
        if (this.el.childNodes.length > 0) return this.el.childNodes[0]
        else return this.el;
    }
    /**
     * 判断是否为当前行块的最开始处的appear
     */
    get isRowStart() {
        var row = this.block.closest(x => !x.isLine);
        if (row == this.block) {
            if (row.appearAnchors[0] === this) return true;
        }
        else {
            var r = row.find(g => g.appearAnchors.length > 0);
            if (r && r.appearAnchors[0] === this) return true;
        }
        return false;
    }
    isBefore(anchor: AppearAnchor) {
        var pos = this.el.compareDocumentPosition(anchor.el);
        if (pos == 4 || pos == 20) {
            return true
        }
        return false
    }
    async split(ats: number[]) {
        var text = this.textContent;
        var pre = 0;
        var ts: string[] = [];
        for (let i = 0; i < ats.length; i++) {
            var t = text.slice(pre, ats[i]);
            if (t) ts.push(t);
            pre = ats[i];
        }
        var lastT = text.slice(ats[ats.length - 1]);
        if (lastT) ts.push(lastT);
        var bs: Block[] = [];
        var pattern = await this.block.pattern.cloneData();
        if (this.block.isLine) {
            var at = this.block.at;
            await this.block.updateProps({ content: ts[0] });
            bs.push(this.block);
            if (ts.length > 1) {
                var rs = await this.block.parent.appendArrayBlockData(
                    ts.findAll((g, i) => i > 0).map(t => ({ url: BlockUrlConstant.Text, pattern, content: t })),
                    at + 1,
                    this.block.parent.childKey
                );
                bs.addRange(rs);
            };
            return bs;
        }
        else {
            await this.block.updateProps({ content: '' });
            return await this.block.appendArrayBlockData(
                ts.map(t => ({ url: BlockUrlConstant.Text, pattern, content: t }))
            )
        }
    }
}