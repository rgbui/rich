import { BaseBlock } from "../block/base/base";

/***
 * 鼠标点击后产生的锚点
 * 该锚点只是表示点在什么地方
 * 可以是点在图像
 * 也可以是点文本的某个位置上面
 * 
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
     * 如果block是文字，则表示点在当前block文字中的某个位置上
     * 位置从0开始，以文字的长度结束
     */
    at?: number;
    /**
     * 当前编辑文字所处于的ele中
     */
    ele?: HTMLDivElement;
}

/**
 * 通过鼠标点事件来创建锚点
 * @param event 
 */
export function CreateAnchorByMouseEvent(event: MouseEvent) {
    var anchor = new Anchor();
    anchor.originMouseEvent = event;
    var targetEle = anchor.originMouseEvent.target as HTMLElement;
    if (targetEle) {
        var blockEle = targetEle.closest('[data-block]');
        anchor.block = (blockEle as any).block as BaseBlock;
        var partEle = targetEle.closest('[data-part]');
        if (partEle) {
            anchor.part = partEle.getAttribute('data-part');
        }
    }
    return anchor;
}