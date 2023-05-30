import { Block } from "..";
import { Point, Rect } from "../../common/vector/point";
import { TextEle } from "../../common/text.ele";
import { AppearVisibleSeek } from "./visible.seek";
import { BlockChildKey, BlockUrlConstant } from "../constant";
import lodash from "lodash";
import { TextContent } from "../element/text";

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
    constructor(public block: Block,
        public el: HTMLElement,
        public appear: BlockAppear,
        public prop: string,
        public plain: boolean,
        public defaultValue: string,
        public hasGap: boolean
    ) {
    }
    get isText() {
        return this.appear == BlockAppear.text;
    }
    get isSolid() {
        return this.appear == BlockAppear.solid;
    }
    get textContent() {
        if (this.isText) {
            return TextEle.getTextContent(this.el);
        }
    }
    get solidContentEl() {
        return this.el.querySelector('.shy-appear-solid-content') as HTMLElement
    }
    setContent(value: string) {
        this.el.innerHTML = value;
    }
    appendContent(value: string) {
        this.el.innerText = (this.textContent + '') + value;
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
        var vp = this.block.appearAnchors.find((g, i) => i > this.at);
        if (vp) return vp;
        /**
        * 如果当前块是行内块，那么在行内查找
        */
        if (this.block.isLine) {
            var pbs = this.block.parentBlocks;
            var at = pbs.findIndex(g => g === this.block);
            var pb = pbs.find((g, i) => i > at && g.isLine && g.appearAnchors.length > 0);
            if (pb) {
                return pb.appearAnchors.find(g => true);
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
        var vp = this.block.appearAnchors.find((g, i) => i < this.at);
        if (vp) return vp;
        /**
         * 如果当前块是行内块，那么在行内查找
         */
        if (this.block.isLine) {
            var pbs = this.block.parentBlocks;
            var at = pbs.findIndex(g => g === this.block);
            var pb = pbs.findLast((g, i) => i < at && g.isLine && g.appearAnchors.length > 0);
            if (pb) {
                return pb.appearAnchors.findLast(g => true);
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
        var vp = this.block.appearAnchors.find((g, i) => i > this.at);
        if (vp) return vp;
        return AppearVisibleSeek(this, { arrow: 'down', left });
    }
    visibleUp(left?: number): AppearAnchor {
        /**
        * 在块内查找
        */
        var vp = this.block.appearAnchors.find((g, i) => i < this.at);
        if (vp) return vp;
        return AppearVisibleSeek(this, { arrow: 'up', left });
    }
    isStart(node: Node, offset: number) {
        if (this.isSolid) return true;
        if (offset != 0) return false;
        if (node instanceof Text) {
            if (node == this.el.childNodes[0]) return true;
        }
        return false;
    }
    isEnd(node: Node, offset: number) {
        if (this.isSolid) return true;
        if (node instanceof Text) {
            if (node == this.el.childNodes[this.el.childNodes.length - 1]) {
                var text = node.textContent;
                if (offset == text.length) return true;
            }
        }
        return false;
    }
    /**
     * 
     * @param node 
     * @param offset 
     * 0表示solid前面
     * 1表示solid后面
     * 其它不在offset
     */
    isSolidPos(node: Node, offset: number) {
        var cs = Array.from(this.el.childNodes)
        if (offset == 0 && (cs[0] === node || cs[0].contains(node))) return true
        else if (offset == 1 && (cs[2] === node || cs[2].contains(node))) return true;
        return false;
    }
    get firstTextNode() {
        if (this.el.childNodes.length > 0) return this.el.childNodes[0]
        else return this.el;
    }
    get lastTextNode() {
        if (this.el.childNodes.length > 0) return this.el.childNodes[this.el.childNodes.length - 1]
        else return this.el;
    }
    /**
     * 通过offset来计算光标应该处于appear中那个textContent上及偏移位置
     * @param offset  这个是appear中的文本偏移位置
     */
    cacCollapseFocusPos(offset: number, isFirst = true) {
        if (this.isSolid) {
            var cs = Array.from(this.el.childNodes);
            if (isFirst || offset == 0) {
                return {
                    node: cs.first(),
                    pos: 0
                }
            }
            else {
                return {
                    node: cs.last(),
                    pos: 0
                }
            }
        }
        var count = 0;
        var pos: number;
        var node: Text;
        TextEle.eachTextNode(this.el, (t) => {
            var len = t.textContent.length;
            if (offset >= count && offset <= count + len) {
                pos = offset - count;
                node = t;
                return false;
            } else count += len;
        });
        if (typeof pos == 'number')
            return {
                pos,
                node
            }
        else {
            if (isFirst)
                return {
                    pos: 0,
                    node: this.firstTextNode
                }
            else return {
                pos: this.lastTextNode.textContent.length,
                node: this.lastTextNode
            }
        }
    }
    collapse(offset: number, sel?: Selection) {
        if (typeof sel == 'undefined') sel = window.getSelection();
        if (this.isSolid) {
            var c = this.el;
            if (offset == 1) {
                var cs = c.childNodes;
                if (cs.length > 0) sel.collapse(cs[cs.length - 1], 0)
                else sel.collapse(c, 0);
            }
            else {
                if (c.childNodes.length > 0) sel.collapse(c.childNodes[0], 0)
                else sel.collapse(c, 0);
            }
        }
        else {
            var cr = this.cacCollapseFocusPos(offset);
            if (cr.node) {
                sel.collapse(cr.node, cr.pos);
            }
        }
    }
    endCollapse() {
        var lt = this.lastTextNode;
        var sel = window.getSelection();
        if (lt instanceof Text) sel.collapse(lt, lt.textContent.length);
        else sel.collapse(lt, lt.childNodes.length);
    }
    getCursorOffset(focusNode?: Node, offset?: number) {
        if (this.isSolid) {
            return 0;
        }
        if (typeof focusNode == 'undefined') {
            var sel = window.getSelection();
            focusNode = sel.focusNode;
            offset = sel.focusOffset;
        }
        var pos: number = 0;
        TextEle.eachTextNode(this.el, t => {
            if (t === focusNode) {
                pos += offset;
                return false;
            }
            else pos += t.textContent.length;
        });
        return pos;
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
        var tc = this.block as TextContent;
        var props = { code: tc.code, link: lodash.cloneDeep(tc.link), comment: tc.comment };
        if (this.block.isLine) {
            var at = this.block.at;
            await this.block.updateProps({ content: ts[0] });
            bs.push(this.block);
            if (ts.length > 1) {
                var rs = await this.block.parent.appendArrayBlockData(
                    ts.findAll((g, i) => i > 0).map(t => ({
                        url: BlockUrlConstant.Text,
                        pattern,
                        content: t,
                        ...props
                    })),
                    at + 1,
                    BlockChildKey.childs
                );
                bs.addRange(rs);
            };
            return bs;
        }
        else {
            await this.block.updateProps({ content: '' });
            return await this.block.appendArrayBlockData(
                ts.map(t => ({
                    url: BlockUrlConstant.Text,
                    pattern,
                    content: t,
                    ...props
                })),
                undefined,
                BlockChildKey.childs
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
        this.block.focusAnchor(this);
    }
    blur() {
        this.el.classList.remove('shy-text-focus')
        this.block.blurAnchor(this);
    }
    collapseByPoint(point: Point, options?: { startNode: Node, startOffset: number }) {
        if (this.isSolid) {
            var bound = Rect.fromEle(this.el);
            if (point.y < bound.top || point.x < bound.center) {
                this.collapse(0);
            }
            else {
                this.collapse(-1);
            }
            return true;
        }
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
        if (point.x > bs.max(g => g.right)) point.x = bs.max(g => g.right);
        var r = TextEle.getCursorRangeByPoint(point);
        if (r && this.el.contains(r.node) && typeof r.offset == 'number') {
            endOffset = this.getCursorOffset(r.node, r.offset);
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
                    this.collapse(s, sel);
                    var sb = Rect.fromEle(sel.getRangeAt(0));
                    this.collapse(e, sel);
                    var eb = Rect.fromEle(sel.getRangeAt(0));
                    if (Math.abs(sb.left - point.x) < Math.abs(eb.left - point.x)) endOffset = s;
                    else endOffset == e;
                    break;
                }
                else {
                    this.collapse(at, sel);
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
        if (typeof endOffset == 'undefined') {
            if (Math.abs(point.y - bs.last().bottom) > Math.abs(point.y - bs.first().top)) endOffset = this.textContent.length;
            else endOffset = 0;
        }
        if (typeof endOffset == 'number') {
            /**
             * 说明找到光标的位置了
             */
            if (options?.startNode) {
                var cr = this.cacCollapseFocusPos(endOffset);
                sel.setBaseAndExtent(options.startNode, options.startOffset, cr.node, cr.pos);
            }
            else {
                this.collapse(endOffset);
            }
            return true;
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
            return false;
        }
    }
    get propValue() {
        return lodash.get(this.block, this.prop);
    }
    updateViewValue() {
        if (this.isText && this.el) {
            this.el.innerText = this.propValue;
        }
    }
    get() {
        return {
            blockId: this.block.id,
            appear: this.appear,
            prop: this.prop
        }
    }
    isEqual(anchor: AppearAnchor) {
        var r = this.get();
        var a = anchor.get();
        if (r.blockId == a.blockId && a.appear == r.appear && a.prop == r.prop) return true;
        else return false
    }
}