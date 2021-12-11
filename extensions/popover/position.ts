import { Point, Rect } from "../../src/common/point";

export type PopoverPosition = {
    center?: boolean;
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
     * 元素本身的大小
     */
    elementArea?: Rect,
    dist?: number,
    offset?: number,
    align?: 'start' | 'center' | 'end',
    direction?: 'top' | 'left' | 'bottom' | 'right',
    relativePoint?: Point
}