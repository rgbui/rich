import { Block } from "..";
import { Point, Rect } from "../../common/point";
import { TextEle } from "../../common/text.ele";
import { Anchor } from "../../kit/selection/anchor";
import { BlockAppear, ElementAppear } from "../appear";
import { BlockUrlConstant } from "../constant";

/**
 * 主要是用来确定光标的上下左右移动
 */
export class Block$Anchor {
    /***
 * 
 * row-col-block
 * row-block
 * row-block-childs(block是一个list有子节点)
 * row-block-row(row里面是一个table，而table包含row)
 * 
 */
    get visiblePre() {
        var current: Block = this as any;
        var prev = current.prev;
        while (true) {
            if (prev) {
                if (prev.isLayout) {
                    var r = prev.findReverse(g => g.isSupportAnchor);
                    if (r) return r;
                }
                else if (prev.isSupportAnchor) {
                    if (prev.hasChilds) {
                        var r = prev.findReverse(g => g.isSupportAnchor);
                        if (r) return r;
                    }
                    return prev;
                }
                else if (prev.hasChilds) {
                    var r = prev.findReverse(g => g.isSupportAnchor);
                    if (r) return r;
                }
                if (prev.prev) {
                    prev = prev.prev;
                }
                else if (prev.parent) {
                    current = prev;
                    prev = null;
                }
            }
            else {
                current = current.parent;
                if (current) {
                    if (current.prev) prev = current.prev;
                    else if (current.parent) continue;
                    else break;
                }
                else break;
            }
        }
    }
    get visibleNext() {
        var self: Block = this as any;
        if (self.hasChilds) {
            var r = self.find(g => g.isSupportAnchor);
            if (r) return r;
        }
        var current: Block = self;
        var next = self.next;
        while (true) {
            if (next) {
                if (next.isLayout) {
                    var r = next.find(g => g.isSupportAnchor);
                    if (r) return r;
                }
                else if (next.isSupportAnchor) {
                    if (next.hasChilds) {
                        var r = next.find(g => g.isSupportAnchor);
                        if (r) return r;
                    }
                    return next;
                }
                else if (next.hasChilds) {
                    var r = next.find(g => g.isSupportAnchor);
                    if (r) return r;
                }
                if (next.next) {
                    next = next.next;
                }
                else if (next.parent) {
                    current = next;
                    next = null;
                }
            } else {
                current = current.parent;
                if (current) {
                    if (current.next) next = current.next;
                    else if (current.parent) continue;
                    else break;
                }
                else break;
            }
        }
    }
    get visiblePrevAnchor() {
        var self: Block = this as any;
        var pre = self.visiblePre;
        if (pre) return self.page.kit.explorer.createBackAnchor(pre, -1);
    }
    get visibleNextAnchor() {
        var self: Block = this as any;
        var next = self.visibleNext;
        if (next) return self.page.kit.explorer.createAnchor(next);
    }
    get row() {
        var self: Block = this as any;
        return self.closest(x => x.isRow);
    }
    get nextRow() {
        var self: Block = this as any;
        /**
         * 如果元素本身有子元素，那么当前行则以当前元素的子row做为下一行
         */
        if (self.hasChilds && self.exists(x => x.isRow)) {
            var r = self.nextFind(g => g.isRow, true);
            if (r) return r;
        }
        var row = self.row;
        if (row) {
            while (true) {
                if (row.parent && row.at == row.parentBlocks.length - 1) {
                    var newRow = row.closest(x => x.isRow, true);
                    if (newRow) row = newRow;
                    else break;
                }
                else break;
            }
            return row.nextFind(g => g.isRow);
        }
    }
    get prevRow() {
        var self: Block = this as any;
        var row = self.row;
        if (row) {
            while (true) {
                if (row.at == 0) {
                    var newRow = row.closest(x => x.isRow, true);
                    if (newRow) row = newRow;
                    else break;
                } else break;
            }
            return row.prevFind(g => g.isRow);
        }
    }
    visibleDownAnchor(this: Block, anchor: Anchor) {
        var x: number;
        if (anchor.isText) {
            var line = TextEle.getLineByAt(anchor.el, anchor.at);
            if (line) {
                x = line.point.x;
            }
        }
        else if (anchor.isSolid) x = anchor.bound.right;
        var row = this.nextRow;
        /**
         * 如果下一行没找到，则继续找下一行，直到没有了为止
         */
        while (true) {
            if (row) {
                var bound = row.getVisibleBound();
                var anchor = row.visibleAnchor(new Point(x, bound.top + 1));
                if (anchor) return anchor;
                else {
                    row = row.nextRow;
                }
            }
            else break;
        }
    }
    visibleUpAnchor(this: Block, anchor: Anchor): Anchor {
        var x: number;
        if (anchor.isText) {
            var line = TextEle.getLineByAt(anchor.el, anchor.at);
            if (line) {
                x = line.point.x;
            }
        }
        else if (anchor.isSolid) x = anchor.bound.left;
        var row = this.prevRow;
        while (true) {
            if (row) {
                var bound = row.getVisibleBound();
                var anchor = row.visibleAnchor(new Point(x, bound.top + bound.height - 1));
                if (anchor) return anchor;
                else {
                    row = row.prevRow;
                }
            }
            else break;
        }
    }
    visibleInnerDownAnchor(this: Block, anchor: Anchor) {
        if (anchor.isText) {
            var line = TextEle.getLineByAt(anchor.el, anchor.at);
            if (line.line == line.total) {
                return anchor.block.visibleDownAnchor(anchor);
            }
            else {
                var newPoint = line.point.clone();
                newPoint.y += line.lineheight * 1.5;
                return anchor.block.visibleAnchor(newPoint);
            }
        }
        else return anchor.block.visibleDownAnchor(anchor);
    }
    visibleInnerUpAnchor(this: Block, anchor: Anchor) {
        if (anchor.isText) {
            var line = TextEle.getLineByAt(anchor.el, anchor.at);
            if (line.line == 1) {
                return anchor.block.visibleUpAnchor(anchor);
            }
            else {
                var newPoint = line.point.clone();
                newPoint.y -= line.lineheight * 0.5;
                return anchor.block.visibleAnchor(newPoint);
            }
        }
        else return anchor.block.visibleUpAnchor(anchor);
    }
    /***
     * 
     * 
     * @param point 坐标（当前坐标明确是处于当前的block中）
     */
    visibleAnchor(this: Block, point: Point): Anchor {
        var block = this;
        if (this.isLayout) {
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
        var fa: ElementAppear;
        if (block.appearElements.length > 1) {
            var ps = block.appearElements.map(ae => {
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
            if (!fa) fa = ps.findMin(g => g.dis.y).appear
        }
        else fa = block.firstElementAppear;
        if (fa)
            return this.page.kit.explorer.createAnchor(block, fa.appear == BlockAppear.text ? TextEle.getAt(fa.el, point) : undefined);
    }
    findAnchorBlockByPointFromBlockRange(this: Block, point: Point) {
        var as = this.findAll(x => x.isSupportAnchor);
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
        if (ps.length > 0)
            return ps.findMin(g => g.dis.y).block
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
        var row = this.closest(x => x.isRow);
        if (row.childs.length > 1 && this.parent === row) {
            var col = await this.page.createBlock(BlockUrlConstant.Col, {
                blocks: {
                    childs: [{ url: BlockUrlConstant.Row }, { url: BlockUrlConstant.Row }]
                }
            }, this.parent, this.at + 1);
            col.childs.first().append(this);
            return await this.page.createBlock(url, data, col.childs.last());
        }
        else {
            var newRow = await this.page.createBlock(BlockUrlConstant.Row, {
                blocks: {
                    childs: [
                        { url, ...data }
                    ]
                }
            }, row.parent, row.at + 1);
            return newRow.childs.first();
        }
    }
    /**
     * 在当前的block的右侧创建一个新的block
     * 通常创建的都是行内元素，如果是块元素，实际上在拖动布局中处理了
     * @param url 
     * @param data 
     */
    async visibleRightCreateBlock(this: Block, url: string, data: Record<string, any>) {
        if (this.isTextContent) {
            return await this.page.createBlock(url, data, this.parent, this.at + 1);
        }
        else {
            var content = this.content;
            this.updateProps({ content: '' });
            var at = 0;
            if (content) await this.page.createBlock(BlockUrlConstant.Text, { content }, this, at++);
            return await this.page.createBlock(url, data, this, at);
        }
    }
    focusAnchor(this: Block, anchor: Anchor) {

    }
    blurAnchor(this: Block, anchor: Anchor) {

    }
    elementAppear(this: Block, elementAppear: Partial<ElementAppear>) {
        if (!elementAppear.el) return;
        var el = elementAppear.el;
        if (!el.classList.contains('sy-appear-text') && !el.classList.contains('sy-appear-solid')) {
            var fe: HTMLElement;
            var childEl = el.querySelector('.sy-appear-text');
            if (childEl) fe = childEl as HTMLElement;
            else {
                var c = el.querySelector('.sy-appear-solid');
                if (c) fe = c as HTMLElement;
            }
            if (fe) el = fe;
            else throw 'not found element appear text or solid ';
        }
        elementAppear.el = el;
        if (typeof elementAppear.appear == 'undefined') {
            if (elementAppear.el.classList.contains('sy-appear-text')) elementAppear.appear = BlockAppear.text;
            else if (elementAppear.el.classList.contains('sy-appear-solid')) elementAppear.appear = BlockAppear.solid;
        }
        if (elementAppear.appear == BlockAppear.text
            &&
            typeof elementAppear.prop == 'undefined'
        ) elementAppear.prop = 'content';
        if (!this.__appearElements.exists(x => x.prop == elementAppear.prop))
            this.__appearElements.push(new ElementAppear(this, elementAppear.el, elementAppear.appear, elementAppear.prop))
    }
}