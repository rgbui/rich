
import { Page } from "..";
import { Block } from "../../block";
import { BlockCssName } from "../../block/pattern/css";
import { dom } from "../../common/dom";
import { Point, Rect } from "../../common/vector/point";
import { TextToolStyle } from "../../../extensions/text.tool";
import { DropDirection } from "../../kit/handle/direction";
import { BlockUrlConstant } from "../../block/constant";

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
        });
        return textStyle;
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
    each(this: Page, predict: (block: Block) => false | void | -1) {
        this.views.each(v => {
            v.each(predict, true);
        })
    }
}