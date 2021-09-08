
import { Page } from "..";
import { Block } from "../../block";
import { BlockCssName } from "../../block/pattern/css";
import { dom } from "../../common/dom";
import { Point, Rect } from "../../common/point";
import { TextToolStyle } from "../../../extensions/text.tool/text.tool";
import { DropDirection } from "../../kit/handle/direction";
import { Anchor } from "../../kit/selection/anchor";

export class Page$Seek {
    /**
     * 这里需要在当前的PageLout内进行查找
     * 获取鼠标所在的block（鼠标不一定在block上面，在block左边的空白处）
     * 先从当前点击的元素来查找block，
     * 如果没有找到block，则在水平方向上延伸一定的宽度去查找邻近的block
     * @param event 
     */
    getBlockInMouseRegion(this: Page, event: MouseEvent) {
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
    /**
     * 获取当前鼠标所在的block
     * @param this 
     * @param event 
     * @returns 
     */
    getMouseTargetBlock(this: Page, event: MouseEvent): Block {
        var block = this.getEleBlock(event.target as HTMLElement);
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
     * 通过起始光标，结束光标来查找之间的block
     * @param this 
     * @param from 
     * @param to 
     * @param filter  rowOrCol 表示查找时过滤isRow,isCol的块
     * @param filter  lineBlock 表示查找的时候过滤isLine的块
     * @returns 
     */
    searchBlocksBetweenAnchor(this: Page, from: Anchor, to: Anchor, filter?: {
        rowOrCol?: boolean,
        lineBlock?: boolean
    }) {
        var bs: Block[] = [];
        var start: Anchor, end: Anchor;
        var pos = from.el.compareDocumentPosition(to.el);
        if (pos == 4 || pos == 20) {
            start = from;
            end = to;
        }
        else {
            start = to;
            end = from;
        }
        var predict = (g) => true;
        if (filter && filter.rowOrCol == true && !filter.lineBlock) predict = (g: Block) => !g.isRow && !g.isCol;
        else if (filter && filter.lineBlock == true && filter.rowOrCol == true) predict = (g: Block) => !g.isLine && !g.isRow && !g.isCol;
        var rs = start.block.nextFindAll(predict, true, c => c == end.block);
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
        return direction;
    }
    /**
     * 通过鼠标勾选的区域来查找在这个范围内的block,
     * 先通过from，to来锁定block，然后基于当前的两个block之间来实际的计算处于这个区域的block有多少
     * from,to没有前后区分，只代表鼠标开始点击的位置到结束的位置
     * @param this 
     * @param from 
     * @param to 
     * @param filter  lineBlock=ture 表示过滤掉isLine的block
     * @returns 
     */
    searchBlocksBetweenMouseRect(this: Page, from: MouseEvent, to: MouseEvent, filter?: {
        lineBlock?: boolean
    }) {
        var bs: Block[] = [];
        var fromBlock = this.getBlockInMouseRegion(from);
        var toBlock = this.getBlockInMouseRegion(to);
        var rect = new Rect(Point.from(from), Point.from(to));
        var topFromRow = fromBlock.closest(g => g.isRow && !g.closest(x => x.isRow, true));
        var topToRow = toBlock.closest(g => g.isRow && !g.closest(x => x.isRow, true));
        var fromRowAt = topFromRow.at;
        var toRowAt = topFromRow.at;
        if (fromRowAt > toRowAt) {
            [fromRowAt, toRowAt] = [toRowAt, fromRowAt];
            [fromBlock, toBlock] = [toBlock, fromBlock];
            [topFromRow, topToRow] = [topToRow, topFromRow];
        }
        while (topFromRow.getVisibleBound().isCross(rect)) {
            if (topFromRow.prev) topFromRow = topFromRow.prev;
            else break;
        }
        while (topToRow.getVisibleBound().isCross(rect)) {
            if (topToRow.next) topToRow = topToRow.next;
            else break;
        }
        while (true) {
            topFromRow.each(b => {
                if (!b.isRow && !b.isCol && (filter && filter.lineBlock == true && !b.isLine || !filter)) {
                    if (b.getVisibleBound().isCross(rect)) {
                        bs.push(b);
                        return -1;
                    }
                }
            });
            if (topFromRow.next) topFromRow = topFromRow.next;
            else break;
            if (topFromRow == topToRow) break;
        }
        return bs;
    }
    /**
     * 这里判断两个anchor是否相邻,是否紧挨着
     * @param from 
     * @param to 
     */
    textAnchorIsAdjoin(from: Anchor, to: Anchor) {
        if (from.isText && to.isText) {
            var fb = from.el;
            var tb = to.el;
            var ob = fb.getBoundingClientRect();
            var nb = tb.getBoundingClientRect();
            if (Math.abs(ob.left + ob.width - nb.left) < 10) {
                var y = ob.top + ob.height - 10;
                if (y >= nb.top && y <= nb.top + 20) { return true; }
            }
        }
        return false;
    }
    /**
     * 文本依据选区裂变返回三块内容块
     * 返回三块内容块
     * @param from 
     * @param to 
     * @param styles 
     * @returns {
          before: string;
          current: string;
          after: string;
        }
    */
    fissionBlockBySelection(block: Block, from: Anchor, to: Anchor) {
        if (!from.isBefore(to)) [to, from] = [from, to];
        var selectionBeforeContent = '', selectionAfterContent = '', selectionContent = '';
        var content = from.textContent;
        if (block == from.block && block == to.block) {
            //说明block包含选区
            selectionBeforeContent = content.substring(0, from.at);
            selectionContent = content.substring(from.at, to.at);
            selectionAfterContent = content.substring(to.at);
        }
        else if (block == from.block) {
            //block后半部分是选区
            selectionBeforeContent = content.substring(0, from.at);
            selectionContent = content.substring(from.at);
        }
        else if (block == to.block) {
            //block前半部分是选区
            selectionAfterContent = content.substring(to.at);
            selectionContent = content.substring(0, to.at);
        }
        return {
            before: selectionBeforeContent,
            current: selectionContent,
            after: selectionAfterContent
        }
    }
    pickBlocksTextStyle(blocks: Block[]) {
        var textStyle: TextToolStyle = {} as any;
        textStyle.italic = true;
        textStyle.bold = true;
        textStyle.underline = true;
        textStyle.deleteLine = true;
        textStyle.code = true;
        textStyle.equation = true;
        var rowBlock = blocks.first().closest(x => !x.isLine);
        textStyle.blockUrl = rowBlock.url;
        blocks.each(bl => {
            let font = bl.pattern.css(BlockCssName.font);
            if (font) {
                if (font.fontStyle != 'italic') textStyle.italic = false;
                if (font.fontWeight != 500 && font.fontWeight != 'bold') textStyle.bold = false;
                if (font.textDecoration != 'underline') textStyle.underline = false;
                if (font.textDecoration != 'line-through') textStyle.deleteLine = false;
                if (!textStyle.color && font.color) textStyle.color = font.color;
                if (bl.url != '/code') textStyle.code = false;
                if (bl.url != '/equation') textStyle.equation = false;
            }
            else {
                textStyle.italic = false;
                textStyle.bold = false;
                textStyle.underline = false;
                textStyle.deleteLine = false;
                textStyle.code = false;
                textStyle.equation = false;
            }
        });
        return textStyle;
    }
    /**
     * 判断两个block，是否在同一行中，
     * 能够形成一个选区
     * @param from 
     * @param to 
     * @returns 
     */
    isInlineAnchor(from: Anchor, to: Anchor) {
        if (from.isText && from.block.isLine && to.block.isLine && to.isText) {
            if (from.block == to.block) return true;
            if (from.block.parent === to.block.parent) return true;
        }
        return false;
    }
    find(this: Page, predict: (block: Block) => boolean) {
        for (let i = 0; i < this.views.length; i++) {
            var view = this.views[i];
            var r = view.find(predict, true);
            if (r) return r;
        }
    }
}