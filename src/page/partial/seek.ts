
import { Page } from "..";
import { Block } from "../../block";
import { BlockCssName } from "../../block/pattern/css";
import { dom } from "../../common/dom";
import { Point, Rect } from "../../common/vector/point";
import { TextToolStyle } from "../../../extensions/text.tool";
import lodash from "lodash";
const GAP = 10;
export class Page$Seek {
    /**
     * 这里需要在当前的PageLout内进行查找
     * 获取鼠标所在的block（鼠标不一定在block上面，在block左边的空白处）
     * 先从当前点击的元素来查找block，
     * 如果没有找到block，则在水平方向上延伸一定的宽度去查找邻近的block
     * @param event 
     */
    getBlockByMouseOrPoint(this: Page, event: MouseEvent | Point) {
        if (event instanceof Point) {
            var block = this.getBlockFromPoint(event);
            if (block) return block;
        }
        else {
            var target = event.target as HTMLElement;
            var block = this.getEleBlock(target);
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
    findXBlock(this: Page,
        event: MouseEvent,
        predict: (block: Block) => boolean,
        direction: 'left' | 'right',
        bound?: Rect
    ) {
        var x = event.clientX;
        var y = event.clientY;
        if (typeof bound == 'undefined')
            bound = Rect.fromEle(this.root);
        
        if (direction == 'left') {
            for (var i = x - GAP; i >= bound.x; i = i - GAP) {
                var block = this.getBlockByMouseOrPoint(new Point(i, y));
                if (block) {
                    if (predict(block)) return block;
                }
            }
        }
        else if (direction == 'right') {
            for (var i = x + GAP; i <= bound.right; i = i + GAP) {
                var block = this.getBlockByMouseOrPoint(new Point(i, y));
                if (block) {
                    if (predict(block)) return block;
                }
            }
        }
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
                if (font.fontWeight != 700 && font.fontWeight != 'bold') textStyle.bold = false;
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
            var fill = bl.pattern.css(BlockCssName.fill);
            if (fill?.mode == 'color') {
                if (typeof textStyle.fill == 'undefined')
                    textStyle.fill = { mode: 'color', color: fill.color };
                else if (textStyle.fill) {
                    if (!lodash.isEqual(textStyle.fill, { mode: 'color', color: fill.color }))
                        textStyle.fill = null;
                }
            } else textStyle.fill = null;
        });
        if (lodash.isNull(textStyle.fill)) delete textStyle.fill;
        textStyle.equation = blocks.every(b => b.url == '/katex/line');
        return textStyle;
    }
    find(this: Page, predict: (block: Block) => boolean) {
        for (let i = 0; i < this.views.length; i++) {
            var view = this.views[i];
            var r = view.find(predict, true);
            if (r) return r;
        }
    }
    exists(this: Page, predict: (block: Block) => boolean) {
        return this.find(predict) ? true : false
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
    each(this: Page, predict: (block: Block) => false | void | -1) {
        this.views.each(v => {
            v.each(predict, true);
        })
    }
    /**
     * 页面最底部的块,
     * 也是视图栏最下面的一个块
     * @param this 
     * @param block  指视图块，每个视图块的的底部
     */
    getViewLastBlock(this: Page, block?: Block) {
        if (!block) block = this.views[0];
        if (block) return block.childs.last()
    }
    /**
     * 过滤掉被包含的块
     * @param this 
     * @param blocks 
     */
    getAtomBlocks(this: Page, blocks: Block[]) {
        var cs = blocks.map(b => b);
        if (cs.length <= 1) return cs;
        var bs: Block[] = [];
        while (true) {
            if (cs.length == 0) return bs;
            else {
                var c1 = cs[0];
                var isOk: boolean = true;
                for (var i = cs.length - 1; i > 0; i--) {
                    var current = cs[i];
                    if (c1 === current || c1.exists(g => g === current)) {
                        cs.splice(i, 1);
                    }
                    else if (current.exists(g => g === c1)) {
                        cs.splice(0, 1);
                        isOk = false;
                        break;
                    }
                }
                if (isOk) {
                    cs.splice(0, 1);
                    bs.push(c1);
                }
            }
        }
        return bs;
    }

    /**
     * 
     * @param selectionBlocks  一般指选区的blocks,blocks是相邻连续的
     * @param arrow 
     */
    visibleSearchBlocks(selectionBlocks: Block[], arrow: 'prev' | 'next' | 'first' | 'last') {
        if (arrow == 'prev' || arrow == 'first') {
            var min = selectionBlocks[0];
            for (let i = 1; i < selectionBlocks.length; i++) {
                if (min.isBefore(selectionBlocks[i])) continue
                else min = selectionBlocks[i]
            }
            if (arrow == 'first') return min;
            else return min.prev
        }
        else if (arrow == 'last' || arrow == 'next') {
            var min = selectionBlocks[0];
            for (let i = 1; i < selectionBlocks.length; i++) {
                if (min.isAfter(selectionBlocks[i])) continue
                else min = selectionBlocks[i]
            }
            if (arrow == 'last') return min;
            else return min.prev
        }
    }
}