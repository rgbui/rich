
import { Page } from "..";
import { Block } from "../../block";
import { BlockCssName } from "../../block/pattern/css";
import { dom } from "../../common/dom";
import { Point, Rect } from "../../common/point";
import { TextToolStyle } from "../../../extensions/text.tool";
import { DropDirection } from "../../kit/handle/direction";
import { Anchor } from "../../kit/selection/anchor";
import { BlockUrlConstant } from "../../block/constant";
import { TextEle } from "../../common/text.ele";

export class Page$Seek {
    /**
     * 这里需要在当前的PageLout内进行查找
     * 获取鼠标所在的block（鼠标不一定在block上面，在block左边的空白处）
     * 先从当前点击的元素来查找block，
     * 如果没有找到block，则在水平方向上延伸一定的宽度去查找邻近的block
     * @param event 
     */
    getBlockInMouseRegion(this: Page, event: MouseEvent | Point) {
        if (event instanceof Point) {
            var block = this.getBlockFromPoint(event);
            if (block) return block;
        }
        else {
            var target = event.target as HTMLElement;
            var block = this.getEleBlock(target);
            if (block) return block;
        }

        /**
         * 如果没有找到，说明在在pageLayout的空白处，
         * 那么先水平找找，如果水平找不到
         * 那么垂直找，
         * 这里需要计算内容域和pageLout中间的范围大小区域
         */
        // var contentBound = TextEle.getContentBound(this.contentEl);
        // var x = event.x;
        // var y = event.y;
        // var dis = 15;
        // var el = document.elementFromPoint(contentBound.left + dis, event.y);
        // if (el) {
        //     block = this.getEleBlock(el as HTMLElement);
        //     if (block) return block;
        // }
        // el = document.elementFromPoint(contentBound.left + contentBound.width - dis, event.y);
        // if (el) {
        //     block = this.getEleBlock(el as HTMLElement);
        //     if (block) return block;
        // }
        // /**
        //  * 将x 缩放到content范围内，这样便于查找
        //  */
        // x = Math.max(contentBound.left + dis, x);
        // x = Math.min(contentBound.left + contentBound.width - dis, x);
        // if (Math.abs(y - contentBound.y) > Math.abs(y - contentBound.y - contentBound.height)) {
        //     el = document.elementFromPoint(x, contentBound.top + contentBound.height - dis);
        //     if (el) {
        //         block = this.getEleBlock(el as HTMLElement);
        //         if (block) return block;
        //     }
        //     el = document.elementFromPoint(x, contentBound.top + dis);
        //     if (el) {
        //         block = this.getEleBlock(el as HTMLElement);
        //         if (block) return block;
        //     }
        // }
        // else {
        //     el = document.elementFromPoint(x, contentBound.top + dis);
        //     if (el) {
        //         block = this.getEleBlock(el as HTMLElement);
        //         if (block) return block;
        //     }
        //     el = document.elementFromPoint(x, contentBound.top + contentBound.height - dis);
        //     if (el) {
        //         block = this.getEleBlock(el as HTMLElement);
        //         if (block) return block;
        //     }
        // }
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
        lineBlock?: boolean,
        /**
         * 这里是否默认考虑边界，比如 from:anchor 是一个block的结尾处 ，
         * 那么此时通过from-to实际没有选中from所涉及到的block
         */
        consideBoundary?: boolean
    }) {
        var bs: Block[] = [];
        var start: Anchor, end: Anchor;
        if (from.isBefore(to)) {
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
        var rs = start.block.nextFindAll(predict, true, c => c === end.block, true);
        bs.addRange(rs);
        if (filter?.consideBoundary != true) {
            if (start.isEnd && !start.isSolid) {
                bs.remove(s => start.block === s);
            }
            if (end.isStart && !end.isSolid) {
                bs.remove(s => end.block === s)
            }
        }
        return bs;
    }
    cacBlockDirection(this: Page, block: Block, event: MouseEvent) {
        var direction = DropDirection.none;
        var point = Point.from(event);
        var bound = block.getVisibleContentBound();
        block = block.closest(x => x.isBlock);
        if (block) {
            if (block.isLayout) {
                if (block.isRow) {
                    if (point.y <= bound.top + bound.height / 2) {
                        direction = DropDirection.top;
                        return { direction: direction, block };
                    }
                    else if (point.y >= bound.top + bound.height / 2) {
                        direction = DropDirection.bottom;
                        return { direction: direction, block };
                    }
                }
                return { direction: direction, block };
            }
            else if (block.isCell) {
                if (block.isEmptyCell) {
                    return { direction: DropDirection.inner, block };
                }
                return { direction: direction, block };
            }
            else {
                if (point.x <= bound.left && point.y > bound.top && point.y < bound.top + bound.height) {
                    direction = DropDirection.left;
                    if (block.parent.isCol && !block.parent.isPart) {
                        block = block.parent;
                    }
                }
                else if (point.x >= bound.left + bound.width && point.y > bound.top && point.y < bound.top + bound.height) {
                    direction = DropDirection.right;
                    if (block.parent.isCol && !block.parent.isPart) {
                        block = block.parent;
                    }
                }
                else if (point.y <= bound.top + bound.height / 2) {
                    direction = DropDirection.top;
                }
                else if (point.y >= bound.top + bound.height / 2) {
                    if (block.url == BlockUrlConstant.List) {
                        direction = DropDirection.sub;
                        if (point.x - bound.left < 30) {
                            direction = DropDirection.bottom;
                        }
                    }
                    else direction = DropDirection.bottom;
                }
            }
        }
        return { direction: direction, block };
    }
    private filterRepeat(this: Page, blocks: Block[]) {

        var rs: Block[] = [];
        while (true) {
            if (blocks.length == 0) break;
            else {
                var bl = blocks[0];
                var isPush: boolean = true;
                for (let j = blocks.length - 1; j > 0; j--) {
                    var current = blocks[j];
                    if (bl.contains(current)) {
                        blocks.remove(current);
                    }
                    else if (current.contains(bl)) {
                        isPush = false;
                        blocks.remove(bl);
                        break;
                    }
                    else continue;
                }
                if (isPush) {
                    rs.push(bl);
                    blocks.remove(bl);
                }
            }
        }
        return rs;
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
    searchBlocksBetweenMouseRect(this: Page,
        from: MouseEvent | Point,
        to: MouseEvent | Point,
        filter?: {
            lineBlock?: boolean,
            fromBlock?: Block
        }) {
        var rect = new Rect(Point.from(from), Point.from(to));
        var bs = this.grid.findBlocksByRect(rect, b => {
            if (!b.isLayout && !b.isPart) {
                if (b.isCrossBlockArea(rect)) return true;
            }
            return false;
        });
        bs = bs.map(b => {
            if (b.isLine) {
                return b.closest(g => !g.isLine);
            }
            else return b;
        })
        return this.filterRepeat(bs);
        // var bs: Block[] = [];
        // var fromBlock = filter?.fromBlock ? filter.fromBlock : this.getBlockInMouseRegion(from);
        // if (fromBlock?.isLayout || fromBlock?.isPart) {
        //     var fb = fromBlock.getVisibleContentBound();
        //     if (Math.abs(from.y - fb.y) > Math.abs(from.y - fb.y - fb.height))
        //         fromBlock = fromBlock.findReverse(g => g.isBlock && !g.isLayout && !g.isPart);
        //     else fromBlock = fromBlock.find(g => g.isBlock && !g.isLayout && !g.isPart);
        // }
        // var toBlock = this.getBlockInMouseRegion(to);
        // if (toBlock?.isLayout || toBlock?.isPart) {
        //     var fb = toBlock.getVisibleContentBound();
        //     if (Math.abs(to.y - fb.y) > Math.abs(to.y - fb.y - fb.height))
        //         toBlock = toBlock.findReverse(g => g.isBlock && !g.isLayout && !g.isPart);
        //     else toBlock = toBlock.find(g => g.isBlock && !g.isLayout && !g.isPart);
        // }
        // var topFromRow = fromBlock ? fromBlock.closest(g => g.isBlock && !g.isLayout && !g.isPart) : undefined;
        // var topToRow = toBlock ? toBlock.closest(g => g.isBlock && !g.isLayout && !g.isPart) : undefined;
        // var rect = new Rect(Point.from(from), Point.from(to));
        // if (!topFromRow && !topToRow) return bs;
        // if (topFromRow && !topToRow || !topFromRow && topToRow) {
        //     var block = topFromRow ? topFromRow : topToRow;
        //     block.each(b => {
        //         if (!b.isLayout && !b.isPart) {
        //             if (b.isCrossBlockArea(rect)) {
        //                 if (filter && filter.lineBlock == true && b.isLine) {
        //                     var pa = b.closest(x => !x.isLine);
        //                     if (!bs.exists(pa)) bs.push(pa);
        //                 }
        //                 else bs.push(b);
        //                 return -1;
        //             }
        //         }
        //     }, true);
        //     return this.filterRepeat(bs);
        // }
        // else {
        //     if (topToRow.isBefore(topFromRow)) {
        //         [topFromRow, topToRow] = [topToRow, topFromRow];
        //     }
        //     if (topFromRow == topToRow) {
        //         topFromRow.each(b => {
        //             if (!b.isLayout && !b.isPart) {
        //                 if (b.isCrossBlockContentArea(rect)) {
        //                     if (filter?.lineBlock == true) {
        //                         var pa = b.closest(x => !x.isLine);
        //                         if (!bs.exists(pa)) bs.push(pa);
        //                     }
        //                     else bs.push(b);
        //                     return -1;
        //                 }
        //             }
        //         }, true);
        //     }
        //     else
        //         topFromRow.nextFindAll(b => {
        //             if (!b.isLayout && !b.isPart) {
        //                 if (b.isCrossBlockContentArea(rect)) {
        //                     if (filter?.lineBlock == true) {
        //                         var pa = b.closest(x => !x.isLine);
        //                         if (!bs.exists(pa)) bs.push(pa);
        //                     }
        //                     else bs.push(b);
        //                 }
        //             }
        //             return false;
        //         }, true, g => g == topToRow, true);
        //     return this.filterRepeat(bs);
        // }
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
        var content = block.firstElementAppear.textContent;
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
        else {
            selectionContent = content;
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
        textStyle.equation = false;
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
            }
            else {
                textStyle.italic = false;
                textStyle.bold = false;
                textStyle.underline = false;
                textStyle.deleteLine = false;
            }
            if (!(bl.asTextContent && bl.asTextContent.code)) {
                textStyle.code = false;
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
        if (from.block == to.block) {
            return true
        }
        if (from.isText && from.block.isLine && to.block.isLine && to.isText) {
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
    findReverse(this: Page, predict: (block: Block) => boolean) {
        for (let i = this.views.length - 1; i >= 0; i--) {
            var view = this.views[i];
            var r = view.findReverse(predict, true);
            if (r) return r;
        }
    }
    findAll(this: Page, predict: (block: Block) => boolean) {
        var bs: Block[] = [];
        for (let i = 0; i < this.views.length; i++) {
            var view = this.views[i];
            var rs = view.findAll(predict, true);
            bs.push(...rs);
        }
        return bs;
    }
    findNearestBlockByPoint(this: Page, blocks: Block[], point: Point) {
        var ps = blocks.toArray(e => {
            var bounds = e.getBounds();
            if (bounds.length == 0) console.warn('the bounds is empty', e);
            var newPoint = TextEle.cacDistance(point, bounds);
            if (newPoint)
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
}