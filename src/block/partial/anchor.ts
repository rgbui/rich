import { Block } from "..";
import { dom } from "../../common/dom";
import { Point, Rect } from "../../common/point";
import { TextEle } from "../../common/text.ele";
import { Anchor } from "../../kit/selection/anchor";
import { BlockAppear, AppearAnchor } from "../appear";
import { BlockUrlConstant } from "../constant";

/**
 * 主要是用来确定光标的上下左右移动
 */
export class Block$Anchor {
    get visiblePre() {
        var current: Block = this as any;
        return current.prevFind(g => g.isSupportAnchor);
    }
    get visibleNext() {
        var self: Block = this as any;
        if (self.hasChilds) {
            var r = self.find(g => g.isSupportAnchor);
            if (r) return r;
        }
        return self.nextFind(g => g.isSupportAnchor);
    }
    get nextBlock() {
        var self: Block = this as any;
        /**
         * 如果元素本身有子元素，那么当前行则以当前元素的子row做为下一行
         */
        if (self.hasChilds && self.exists(x => x.isBlock)) {
            var r = self.find(g => g.isBlock, false, undefined, false);
            if (r) return r;
        }
        var row = self.closest(x => x.isBlock);
        if (row) {
            return row.nextFind(g => g.isBlock && !g.isPart && !g.isLayout && g !== row);
        }
    }
    get prevBlock() {
        var self: Block = this as any;
        var row = self.closest(x => x.isBlock);
        if (row) {
            return row.prevFind(g => g.isBlock && !g.isPart && !g.isLayout && g !== row);
        }
    }
    get visiblePrevAnchor() {
        var self: Block = this as any;
        var pre = self.visiblePre;
        if (pre) return pre.createBackAnchor(-1);
    }
    get visibleNextAnchor() {
        var self: Block = this as any;
        var next = self.visibleNext;
        if (next) return next.createAnchor();
    }
    createAnchor(this: Block, at?: number) {
        if (this.isSupportAnchor) {
            var anchor = new Anchor(this.page.kit.explorer, this.firstElementAppear);
            if (typeof at == 'number' && anchor.isText) {
                if (at == -1) anchor.at = anchor.elementAppear.textContent.length;
                else anchor.at = at;
            }
            else if (anchor.isText && typeof at == 'undefined') {
                anchor.at = 0;
            }
            return anchor;
        }
    }
    createBackAnchor(this: Block, at?: number) {
        if (this.isSupportAnchor) {
            var anchor = new Anchor(this.page.kit.explorer, this.appearAnchors.last());
            if (typeof at == 'number' && anchor.isText) {
                if (at == -1) anchor.at = anchor.elementAppear.textContent.length;
                else anchor.at = at;
            }
            return anchor;
        }
    }
    get visibleHeadAnchor() {
        var self: Block = this as any;
        if (self.isSupportAnchor) {
            return self.createAnchor();
        }
        else if (self.childs.length > 0) {
            var sub = self.find(g => g.isSupportAnchor);
            if (sub) return sub.visibleHeadAnchor;
        }
    }
    get visibleBackAnchor() {
        var self: Block = this as any;
        if (self.isSupportAnchor) {
            return self.createBackAnchor(-1);
        }
        else if (self.childs.length > 0) {
            var sub = self.findReverse(g => g.isSupportAnchor);
            if (sub) return sub.visibleBackAnchor;
        }
    }
    visibleDownAnchor(this: Block, anchor: Anchor) {
        var x: number = anchor.bound.right;
        if (anchor.elementAppear.next) {
            return anchor.elementAppear.next.createAnchorByX(x);
        }
        var row = this.nextBlock;
        /**
         * 如果下一行没找到，则继续找下一行，直到没有了为止
         */
        while (true) {
            if (row) {
                var bound = row.getVisibleBound();
                var anchor = row.visibleAnchor(new Point(x, bound.top + 10));
                if (anchor) return anchor;
                else {
                    var r = row.nextBlock;
                    if (r === row) break;
                    else row = r;
                }
            }
            else break;
        }
    }
    visibleUpAnchor(this: Block, anchor: Anchor): Anchor {
        var x: number = anchor.bound.right;
        if (anchor.elementAppear.prev) return anchor.elementAppear.prev.createAnchorByX(x, true);
        var row = this.prevBlock;
        while (true) {
            if (row) {
                var top;
                var appear = row.lastElementAppear;
                if (appear) {
                    var rect = Rect.fromEle(appear.el);
                    top = rect.top + rect.height - 10;
                }
                else {
                    var bound = row.getVisibleBound();
                    top = bound.top + bound.height - 10;
                    /**
                     * 这里说明是从子节点所在的row跃迁到父row，且父row还包含子row,
                     * 这发生在list从子节点光标移到list本身上。
                     */
                    if (row.exists(g => g == this)) {
                        var cb = this.getVisibleBound();
                        top = bound.top + (cb.top - bound.top - 10);
                    }
                }
                var anchor = row.visibleAnchor(new Point(x, top));
                if (anchor) return anchor;
                else {
                    row = row.prevBlock;
                }
            }
            else break;
        }
    }
    visibleInnerDownAnchor(this: Block, anchor: Anchor) {
        if (anchor.isText) {
            var point = anchor.bound.leftMiddle;
            var isDownAnchor = TextEle.isWillOverBlockEle(anchor.el, anchor.bound.leftMiddle, true);
            if (!isDownAnchor) {
                var newPoint = point.clone();
                newPoint.y += dom(anchor.el).fontStyle().lineHeight;
                var block = anchor.block;
                if (block.isLine) block = block.closest(x => x.isBlock);
                return block.visibleAnchor(newPoint);
            }
        }
        return anchor.block.visibleDownAnchor(anchor);
    }
    visibleInnerUpAnchor(this: Block, anchor: Anchor) {
        if (anchor.isText) {
            var point = anchor.bound.leftMiddle;
            var isDownAnchor = TextEle.isWillOverBlockEle(anchor.el, anchor.bound.leftMiddle);
            if (!isDownAnchor) {
                var newPoint = point.clone();
                newPoint.y -= dom(anchor.el).fontStyle().lineHeight;
                var block = anchor.block;
                if (block.isLine) block = block.closest(x => x.isBlock);
                return block.visibleAnchor(newPoint);
            }
        }
        return anchor.block.visibleUpAnchor(anchor);
    }
    /***
     * 
     * 
     * @param point 坐标（当前坐标明确是处于当前的block中）
     */
    visibleAnchor(this: Block, point: Point): Anchor {
        var block = this;
        if (this.isLayout || this.hasChilds) {
            var contentBlock = this.findAnchorBlockByPointFromBlockRange(point);
            if (contentBlock) {
                block = contentBlock;
            }
            else {
                /**
                 * 一般layout
                 */
                return null;
            }
        }
        var fa: AppearAnchor;
        if (block.appearAnchors.length > 1) {
            var ps = block.appearAnchors.map(ae => {
                var bound = Rect.fromEle(ae.el);
                return {
                    dis: TextEle.cacDistance(point, [bound]),
                    appear: ae
                }
            });
            if (ps.exists(g => g.dis.x == 0 && g.dis.y == 0))
                fa = ps.find(g => g.dis.x == 0 && g.dis.y == 0).appear;
            if (!fa && ps.exists(g => g.dis.y == 0))
                fa = ps.findAll(g => g.dis.y == 0).findMin(g => g.dis.x).appear
            if (!fa) {
                var min = ps.min(g => g.dis.y);
                var fas = ps.findAll(g => g.dis.y == min);
                if (fas.length > 0) {
                    fa = fas.findMin(g => g.dis.x).appear;
                }
            }
        }
        else fa = block.firstElementAppear;
        if (fa) return fa.createAnchorByPoint(point);
    }
    findAnchorBlockByPointFromBlockRange(this: Block, point: Point) {
        var as = this.findAll(x => x.isSupportAnchor, true);
        var ps = as.map(e => {
            var bounds = e.getBounds();
            var newPoint = TextEle.cacDistance(point, bounds);
            return {
                dis: newPoint,
                block: e
            }
        });
        if (ps.exists(g => g.dis.x == 0 && g.dis.y == 0))
            return ps.find(g => g.dis.x == 0 && g.dis.y == 0).block;
        if (ps.exists(g => g.dis.y == 0))
            return ps.findAll(g => g.dis.y == 0).findMin(g => g.dis.x).block
        if (ps.length > 0) {
            /**
             * 这里表示水平方向等距的block，
             * 那么在从最小的等距的block找水平方向最近的点
             */
            var minY = ps.min(g => g.dis.y);
            var ds = ps.findAll(g => g.dis.y == minY);
            if (ds.length == 1) return ds.first().block;
            else {
                return ds.findMin(g => g.dis.x).block;
            }
        }
    }
    /**
   * 创建block，有两种方式
   * 1. 是在当前的row下面添加新的row-block
   * 2. 如果当前的block有相邻的元素，那么可能是 row->[block,col{block...}]
   * @param url 
   * @param data 
   * @returns 
   */
    async visibleDownCreateBlock(this: Block, url: string, data: Record<string, any> = {}) {
        var row = this.closest(x => x.isBlock);
        return await this.page.createBlock(url, { ...data }, row.parent, row.at + 1);
    }
    /**
     * 在当前的block的右侧创建一个新的block
     * 通常创建的都是行内元素，如果是块元素，实际上在拖动布局中处理了
     * @param url 
     * @param data 
     */
    async visibleRightCreateBlock(this: Block, at: number, url: string, data: Record<string, any>) {
        if (this.isTextContent) {
            var frontConent = this.content.slice(0, at);
            var latterContent = this.content.slice(at);
            var index = this.at;
            var newBlock: Block;
            if (frontConent) {
                this.updateProps({ content: frontConent });
                newBlock = await this.page.createBlock(url, data, this.parent, index + 1);
                if (latterContent) {
                    var cd = await this.cloneData(); cd.content = latterContent;
                    await this.page.createBlock(this.url, cd, this.parent, index + 2);
                }
            }
            else if (latterContent) {
                newBlock = await this.page.createBlock(url, data, this.parent, index);
                this.updateProps({ content: latterContent });
            }
            else {
                newBlock = await this.page.createBlock(url, data, this.parent, index);
                await this.delete()
            }
            return newBlock;
        }
        else if (this.isLineSolid) {
            return await this.page.createBlock(url, data, this.parent, this.at + 1);
        }
        else {
            var frontConent = this.content.slice(0, at);
            var latterContent = this.content.slice(at);
            this.updateProps({ content: '' });
            var index = 0;
            if (frontConent) await this.page.createBlock(BlockUrlConstant.Text, { content: frontConent }, this, index++);
            var newBlock = await this.page.createBlock(url, data, this, index++);
            if (latterContent) await this.page.createBlock(BlockUrlConstant.Text, { content: latterContent }, this, index++);
            return newBlock;
        }
    }
    focusAnchor(this: Block, anchor: Anchor) {

    }
    blurAnchor(this: Block, anchor: Anchor) {

    }
    elementAppear(this: Block, elementAppear: Partial<AppearAnchor>) {
        if (!elementAppear.el) return;
        var el = elementAppear.el;
        if (!el.classList.contains('shy-appear-text') && !el.classList.contains('shy-appear-solid')) {
            var fe: HTMLElement;
            var childEl = el.querySelector('.shy-appear-text');
            if (childEl) fe = childEl as HTMLElement;
            else {
                var c = el.querySelector('.shy-appear-solid');
                if (c) fe = c as HTMLElement;
            }
            if (fe) el = fe;
            else throw 'not found element appear text or solid ';
        }
        elementAppear.el = el;
        if (typeof elementAppear.appear == 'undefined') {
            if (elementAppear.el.classList.contains('shy-appear-text')) elementAppear.appear = BlockAppear.text;
            else if (elementAppear.el.classList.contains('shy-appear-solid')) elementAppear.appear = BlockAppear.solid;
        }
        if (elementAppear.appear == BlockAppear.text
            &&
            typeof elementAppear.prop == 'undefined'
        ) elementAppear.prop = 'content';
        if (!this.__appearAnchors.exists(x => x.prop == elementAppear.prop))
            this.__appearAnchors.push(new AppearAnchor(this, elementAppear.el, elementAppear.appear, elementAppear.prop))
        else {
            var ep = this.__appearAnchors.find(g => g.prop == elementAppear.prop);
            if (ep) {
                ep.el = elementAppear.el;
            }
        }
    }
}