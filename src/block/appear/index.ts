import { Block } from "..";
import { Point, Rect } from "../../common/vector/point";
import { TextEle } from "../../common/text.ele";
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
    visibleRight(): AppearAnchor {
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
    visibleLeft(): AppearAnchor {
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
            var pb = pbs.findLast((g, i) => i < at && g.isLine && g.appearAnchors.some(s => s.isText));
            if (pb) {
                return pb.appearAnchors.findLast(g => g.isText);
            }
        }
        /**
         * 下面是通过视觉去查找，先从右到左，然后上一行从右到左
         */
        return AppearVisibleSeek(this, { arrow: 'left' });
    }
    visibleDown(left?: number): AppearAnchor {
        /**
      * 在块内查找
      */
        var vp = this.block.appearAnchors.find((g, i) => i > this.at && g.isText);
        if (vp) return vp;
        return AppearVisibleSeek(this, { arrow: 'down', left });
    }
    visibleUp(left?: number): AppearAnchor {
        /**
        * 在块内查找
        */
        var vp = this.block.appearAnchors.find((g, i) => i < this.at && g.isText);
        if (vp) return vp;
        return AppearVisibleSeek(this, { arrow: 'up', left });
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
                if (offset == text.length) return true;
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
    isBeforeNear(anchor: AppearAnchor) {
        var rect = TextEle.getBounds(this.el).last();
        var afterRect = TextEle.getBounds(anchor.el).first();
        if (rect.rightMiddle.nearBy(afterRect.leftMiddle, 5)) {
            return true;
        }
        else return false;
    }
    isAfterNear(anchor: AppearAnchor) {
        var rect = TextEle.getBounds(this.el).first();
        var afterRect = TextEle.getBounds(anchor.el).last();
        if (rect.rightMiddle.nearBy(afterRect.leftMiddle, 5)) {
            return true;
        }
        else return false;
    }
    focus() {
        var rs = this.block.page.root.querySelectorAll('.shy-text-focus');
        for (let i = 0; i < rs.length; i++) {
            if (rs[i] !== this.el)
                rs[i].classList.remove('shy-text-focus');
        }
        this.el.classList.add('shy-text-focus');
    }
    blur() {
        this.el.classList.remove('shy-text-focus')
    }
    collapseByPoint(point: Point, options?: { startNode: Node, startOffset: number }) {
        point = point.clone();
        var isCollapsed: boolean = false;
        var bs = TextEle.getBounds(this.el);
        var sel = window.getSelection();
        var startNode = sel.anchorNode;
        var startOffset = sel.anchorOffset;
        var oldNode = sel.focusNode;
        var oldOffset = sel.focusOffset;
        var endOffset: number;
        if (point.y < bs.first().top) point.y = bs.first().middle;
        if (point.y > bs.last().bottom) point.y = bs.last().middle;
        if (point.x < bs.min(g => g.left)) point.x = bs.min(g => g.left);
        if (point.x > bs.max(g => g.right)) point.y = bs.max(g => g.right);

        var r = TextEle.getCursorRangeByPoint(point);
        if (r && this.el.contains(r.node) && typeof r.offset == 'number') {
            endOffset = r.offset;
        }
        if (typeof endOffset == 'undefined') {
            isCollapsed = true;
            var s = 0;
            var e = this.textContent.length;
            var couter = 0;
            var t = this.textContent.length;
            while (true) {
                if (couter > t) break;
                var at = Math.round((s + e) / 2);
                if (Math.abs(s - e) < 2) {
                    sel.collapse(this.textNode, s);
                    var sb = Rect.fromEle(sel.getRangeAt(0));
                    sel.collapse(this.textNode, e);
                    var eb = Rect.fromEle(sel.getRangeAt(0));
                    if (Math.abs(sb.left - point.x) < Math.abs(eb.left - point.x))
                        endOffset = s;
                    else endOffset == e;
                    break;
                }
                else {
                    sel.collapse(this.textNode, at);
                    var b = Rect.fromEle(sel.getRangeAt(0));
                    if (point.y <= b.top || point.x <= b.left && point.y >= b.top && point.y <= b.bottom) {
                        e = at;
                    }
                    else {
                        s = at;
                    }
                }
                couter += 1;
            }
        }
        if (typeof endOffset == 'number') {
            /**
             * 说明找到光标的位置了
             */
            if (options?.startNode) {
                sel.setBaseAndExtent(options.startNode, options.startOffset, this.textNode, endOffset);
            }
            else {
                sel.collapse(this.textNode, endOffset);
            }
        }
        else {
            if (isCollapsed) {
                /**
                * 这里恢复至原样
                */
                if (startNode && oldNode) {
                    sel.setBaseAndExtent(startNode, startOffset, oldNode, oldOffset);
                }
                else {
                    sel.removeAllRanges();
                }
            }
        }
    }
}