import { getEleFontStyle, MeaureWord } from "../../../util/measure";
import { BaseBlock } from "../../block/base/base";

/***
 * 鼠标点击后产生的锚点
 * 该锚点只是表示点在什么地方
 * 可以是点在图像
 * 也可以是点文本的某个位置上面
 */
export class Anchor {
    /***
     * 点击的原始鼠标位置
     */
    originMouseEvent: MouseEvent;
    /**
     * 点击在某个block上面
     */
    block: BaseBlock;
    /**
     * 就是block上面的某个部位名称
     * 可能争对某个部位有一些操作吧
     */
    part?: string;
    /**
     * 当前编辑文字所处于的ele中
     */
    ele?: HTMLDivElement;
    /**
     * 判断当前的anchor是否为文本锚点
     */
    get isTextAnchor() {
        return this.block.mousedownIsInTextArea(this.originMouseEvent);
    }
    getCursorPosition() {
        var bound = this.ele.getBoundingClientRect();
        var fontStyle = getEleFontStyle(this.ele);
        var meaureWord = new MeaureWord(fontStyle, bound.width);
    }
}

/**
 * 通过鼠标点事件来创建锚点
 * @param event 
 */
export function CreateAnchorByMouseEvent(event: MouseEvent) {
    var anchor = new Anchor();
    anchor.originMouseEvent = event;
    var targetEle = anchor.originMouseEvent.target as HTMLDivElement;
    if (targetEle) {
        var blockEle = targetEle.closest('[data-block]');
        anchor.block = (blockEle as any).block as BaseBlock;
        var partEle = targetEle.closest('[data-part]');
        if (partEle) {
            anchor.part = partEle.getAttribute('data-part');
        }
        if (anchor.block.mousedownIsInTextArea(event)) {
            anchor.ele = targetEle as HTMLDivElement;
        }
    }
    return anchor;
}