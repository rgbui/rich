

import { Block } from "../../block/base";
import { BlockAppear } from "../../block/base/enum";
import { BlockPart } from "../../block/base/part";
import { Point } from "../../common/point";
import { TextEle } from "../../common/text.ele";

/***
 * 鼠标点击后产生的锚点
 * 该锚点只是表示点在什么地方
 * 可以是点在图像
 * 也可以是点文本的某个位置上面
 */
export class Anchor {
    /***
     * 光标位置,一般是指鼠标点击的位置，
     * 如果是文本，
     * 这会有一的定计算偏移，
     * 使其光标处于文字中间
     */
    point: Point;
    /**
     * 点击在某个block上面
     */
    block: Block;
    /**
     * 就是block上面的某个部位名称
     * 可能争对某个部位有一些操作吧
     */
    part?: BlockPart;
    get el() {
        if (this.part) return this.part.el;
        else {
            return this.block.el;
        }
    }
    at?: number;
    /***
     * 光标是否为于文字开始位置
     */
    get isStart() {
        return this.at == 0 ? true : false;
    }
    /**
     * 光标是否为文字末尾
     */
    get isEnd() {
        return this.at === this.el.textContent.length;
    }
    get isText() {
        if (this.part) {
            return this.part.appear == BlockAppear.text;
        }
        else return this.block.isText;
    }
    /**
     * 计算光标的实际位置
     */
    // location(point: Point) {
    //     this.createTextArea();
    //     var location = this.textArea.location(point);
    //     if (!location) {
    //         console.log(this.textArea, location);
    //     }
    //     this.at = location.at;
    //     this.point = Point.from(location.x, location.y);
    // }
    // private createTextArea() {
    //     if (typeof this.textArea == 'undefined') {
    //         var pe = this.block.getTextAreaEles(this.part ? this.part.name : undefined);
    //         this.textArea = new TextArea(this.el, pe.panel || undefined)
    //     }
    // }
    // locationByAt(at: number, textIsChange?: boolean) {
    //     this.createTextArea();
    //     var location = this.textArea.locationByAt(at, textIsChange);
    //     if (location) {
    //         this.at = location.at;
    //         this.point = Point.from(location.x, location.y);
    //     }
    //     else {
    //         console.log('location is not found', at, this.textArea, this);
    //     }
    // }
    // textArea: TextArea;
    copy(anchor: Anchor) {
        ['point', 'textArea', 'block', 'part', 'at'].each(key => {
            if (key == 'point') this[key] = anchor.point.clone();
            else this[key] = anchor[key];
        })
    }
    get() {
        return {
            at: this.at,
            block: this.block,
            el: this.el,
            point: this.point.get()
        }
    }
    get textContent() {
        return TextEle.getContent(this.el);
    }
}

// export function createAnchorByPoint(point: Point, target?: HTMLElement) {
//     if (typeof target == 'undefined') {
//         target = document.elementFromPoint(point.x, point.y) as HTMLElement;
//     }
//     if (target) {
//         var anchor = new Anchor();
//         anchor.point = point.clone();
//         var blockEle = target.closest('[data-block]');
//         if (!blockEle) {
//             console.log(target, point);
//         }
//         var block = (blockEle as any).block as BaseBlock;
//         if (block.isLayout) {
//             var contentBlock = block.findContentAfter();
//             if (contentBlock) block = contentBlock;
//         }
//         anchor.block = block;
//         if (anchor.block.isPart) {
//             var part = anchor.block.findPart((g, e) => {
//                 if (e && e.el && typeof (e.el as HTMLElement).contains == 'function' && (e.el as HTMLElement).contains(target)) {
//                     return true;
//                 }
//             });
//             if (part)
//                 anchor.part = part;
//         }
//         if (anchor.isText) {
//             if (!anchor.part) {
//                 var part = anchor.block.findPart((g, e) => e && e.type == BlockType.text);
//                 if (part) anchor.part = part;
//             }
//             anchor.location(anchor.point);
//         }
//         return anchor;
//     }
//     else throw new Error('not found target ele in point');
// }


// /***
//  * @param block 
//  * @param at 文本的block才有意义，指定创建anchor中，block的位置，如果是小于0,则从当前文本结尾开始计算
//  */
// export function CreateAnchorByBlock(block: BaseBlock, at: number, part?: { name: string, el: HTMLElement, type: BlockType }) {
//     var anchor = new Anchor();
//     anchor.block = block;
//     if (part)
//         anchor.part = part;
//     if (block.isText) {
//         if (typeof at == undefined) at = 0;
//         if (at < 0) at = anchor.textContent.length + at + 1;
//         anchor.locationByAt(at);
//     }
//     else {
//         var bound = block.el.getBoundingClientRect();
//         anchor.point = Point.from({ x: bound.left, y: bound.top });
//     }
//     return anchor;
// }