import { Point, Rect } from "../../src/common/vector/point";

export type PopoverPosition = {
    /**
     * 是否为中心点的位置
     */
    center?: boolean;
    /**
     * 是否靠右
     */
    dockRight?: boolean;
    /**
     * 当center为true时，自定义top高度，
     * 
     */
    centerTop?: number;

    /**
     * 围绕一个点来计算弹窗
     */
    roundPoint?: Point;
    /**
     * 按固定的点来打开，弹窗不做自适应位置计算
     */
    fixPoint?: Point;
    /**
     * 围绕一个元素
     */
    roundArea?: Rect;
    /**
     * 围绕多个元素
     */
    roundAreas?: Rect[];
    /**
     * 元素本身的大小
     */
    elementArea?: Rect,
    dist?: number,
    offset?: number,
    align?: 'start' | 'center' | 'end',
    direction?: 'top' | 'left' | 'bottom' | 'right',
    relativePoint?: Point,
    /**
     * 相对某个元素，滚动条自由滚动，
     * 例如文本编辑器，滚动时，自适应，
     * 这里还需要考虑平移的情况（暂时不考虑）
     */
    relativeEleAutoScroll?: HTMLElement,
}