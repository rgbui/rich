import { Block } from "..";
import { Point } from "../../common/point";
import { TextEle } from "../../common/text.ele";
import { Anchor } from "../../kit/selection/anchor";
import { BlockAppear, ElementAppear } from "../appear";
import { BlockUrlConstant } from "../constant";

export class Block$Anchor {
    visibleDownAnchor(this: Block, anchor: Anchor) {
        var x: number;
        if (anchor.isText) {
            var line = TextEle.getLineByAt(anchor.el, anchor.at);
            if (line) {
                x = line.point.x;
            }
        }
        else if (anchor.isSolid) x = anchor.el.getBoundingClientRect().left;
        var nextRow = this.nextRow;
        if (nextRow) {
            var bound = nextRow.getBounds().first();
            return nextRow.visibleAnchor(new Point(x, bound.top + 1))
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
        else if (anchor.isSolid) x = anchor.el.getBoundingClientRect().left;
        var prevRow = this.prevRow;
        if (prevRow) {
            var bound = prevRow.getBounds().first();
            return prevRow.visibleAnchor(new Point(x, bound.top + bound.height - 1));
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
     * 通过坐标计算视野是处于block那个part中，或者block本身
     * 注意，当前的block有可能是layout block，那么需要通过坐标找到子视野的block，如果没有子block，这实际是个不可能出现的错误
     * 如果是一个isPanel的block，那么需要确认当前的坐标是否处于子的block中，另外注意，如果坐标是点在当前的空白block中，可能归宿到视野子内容
     * @param point 坐标（当前坐标明确是处于当前的block中）
     */
    visibleAnchor(this: Block, point: Point): Anchor {
        var block = this.visiblePoint(point);
        var fa = this.firstElementAppear;
        if (fa)
            return this.page.kit.explorer.createAnchor(block, fa.appear == BlockAppear.text ? TextEle.getAt(fa.el, point) : undefined);
    }
    visiblePoint(this: Block, point: Point) {
        var as = this.allVisibleBlocks;
        var ps = as.map(e => {
            var bounds = e.getBounds();
            var newPoint = TextEle.cacDistance(point, bounds);
            return {
                dis: newPoint,
                part: e
            }
        });
        if (ps.exists(g => g.dis.x == 0 && g.dis.y == 0))
            return ps.find(g => g.dis.x == 0 && g.dis.y == 0).part;
        if (ps.exists(g => g.dis.y == 0))
            return ps.findAll(g => g.dis.y == 0).findMin(g => g.dis.x).part
        return ps.findMin(g => g.dis.y).part
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

        // if (this.isText && this.isEmpty) {
        //     this.textEl.classList.add('empty');
        // }
    }
    blurAnchor(this: Block, anchor: Anchor) {
        // if (this.isText) {
        //     this.textEl.classList.remove('empty');
        // }
    }
    elementAppear(this: Block, elementAppear: Partial<ElementAppear>) {
        if (typeof elementAppear.el) throw new Error('el is not null');
        var el = elementAppear.el;
        if (!el.classList.contains('sy-appear-text') && !el.classList.contains('sy-appear-solid')) {
            var childEl = el.querySelector('.sy-appear-text');
            if (childEl) el = childEl as HTMLElement;
            else {
                var c = el.querySelector('.sy-appear-solid');
                if (c) el = c as HTMLElement;
            }
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
        this.__appearElements.push(new ElementAppear(this, elementAppear.el, elementAppear.appear, elementAppear.prop))
    }
}