
import { Page } from ".";
import { Block } from "../block";
import { dom } from "../common/dom";
import { Point, Rect } from "../common/point";
import { DropDirection } from "../kit/handle/direction";
import { Anchor } from "../kit/selection/anchor";

export class Page$Seek {
    /**
     * 这里需要在当前的PageLout内进行查找
     * @param event 
     */
    searchBlockByMouse(this: Page, event: MouseEvent) {
        var target = event.target as HTMLElement;
        var block = this.getEleBlock(target);
        if (block) return block;
        /**
         * 如果没有找到，说明在在pageLayout的空白处，
         * 那么先水平找找，如果水平找不到
         * 那么垂直找，
         * 这里需要计算内容域和pageLout中间的范围大小区域
         */
        var contentBound = Rect.from(this.contentEl.getBoundingClientRect());
        var x = event.x;
        var y = event.y;
        var dis = 15;
        var el = document.elementFromPoint(contentBound.left + dis, event.y);
        if (el) {
            block = this.getEleBlock(el as HTMLElement);
            if (block) return block;
        }
        el = document.elementFromPoint(contentBound.left + contentBound.width - dis, event.y);
        if (el) {
            block = this.getEleBlock(el as HTMLElement);
            if (block) return block;
        }
        /**
         * 将x 缩放到content范围内，这样便于查找
         */
        x = Math.max(contentBound.left + dis, x);
        x = Math.min(contentBound.left + contentBound.width - dis, x);
        el = document.elementFromPoint(x, contentBound.top + dis);
        if (el) {
            block = this.getEleBlock(el as HTMLElement);
            if (block) return block;
        }
        el = document.elementFromPoint(x, contentBound.top + contentBound.height - dis);
        if (el) {
            block = this.getEleBlock(el as HTMLElement);
            if (block) return block;
        }
    }
    getEleBlock(this: Page, el: HTMLElement): Block {
        var blockEle = dom(el).closest(x => (x as any).block && (x as any).block.page === this ? true : false);
        if (blockEle) {
            return (blockEle as any).block;
        }
        return null;
    }
    getVisibleBlockByMouse(this: Page, event: MouseEvent): Block {
        var block = this.getEleBlock(event.target as HTMLElement);
        if (block && block.isLayout) {
            block = block.visiblePoint(Point.from(event))
        }
        return block;
    }
    getBlockFromPoint(this: Page, point: Point) {
        var els = document.elementsFromPoint(point.x, point.y);
        if (els && els.length > 0) {
            for (let i = 0; i < els.length; i++) {
                var b = this.getEleBlock(els[i] as HTMLElement);
                if (b) return b;
            }
        }
    }
    getBlocksFromPoint(this: Page, point: Point) {
        var bs: Block[] = [];
        var els = document.elementsFromPoint(point.x, point.y);
        if (els && els.length > 0) {
            for (let i = 0; i < els.length; i++) {
                var b = this.getEleBlock(els[i] as HTMLElement);
                if (b) {
                    bs.push(b);
                }
            }
        }
        return bs;
    }
    /**
     * 通过起始光标，结束光标
     * @param this 
     * @param from 
     * @param to 
     * @returns 
     */
    searchBlocksBetweenAnchor(this: Page, from: Anchor, to: Anchor) {
        var bs: Block[] = [];
        var start: Anchor, end: Anchor;
        var pos = from.el.compareDocumentPosition(to.el);
        if (pos == 4 || pos == 20) {
            start = from;
            end = to;
        }
        else {
            start = from;
            end = to;
        }
        var rs = start.block.nextFindAll(g => true, true, c => c == end.block);
        bs.addRange(rs);
        bs.push(end.block);
        return bs;
    }
    cacBlockDirectionByMouse(this: Page, block: Block, event: MouseEvent) {
        var direction = DropDirection.none;
        var point = Point.from(event);
        var bound = block.getVisibleBound();
        if (point.x <= bound.left) {
            direction = DropDirection.left;
        }
        else if (point.x >= bound.left + bound.width) {
            direction = DropDirection.right;
        }
        else if (point.y <= bound.top + bound.height / 2) {
            direction = DropDirection.top;
        }
        else if (point.y >= bound.top + bound.height / 2) {
            direction = DropDirection.bottom;
        }
        return DropDirection.bottom;
    }
    /**
     * 通过鼠标勾选的区域来查找在这个范围内的block,
     * 先通过from，to来锁定block，然后基于当前的两个block之间来实际的计算处于这个区域的block有多少
     * from,to没有前后区分，只代表鼠标开始点击的位置到结束的位置
     * @param this 
     * @param from 
     * @param to 
     */
    searchBlocksBetweenMouseRect(this: Page, from: MouseEvent, to: MouseEvent) {
        var fromBlock = this.searchBlockByMouse(from);
        var toBlock = this.searchBlockByMouse(to);
        var rect = new Rect();
        rect.top = from.y;
        rect.left = from.x;
        rect.width = to.x - from.x;
        rect.height = to.y - from.y;
    }
}