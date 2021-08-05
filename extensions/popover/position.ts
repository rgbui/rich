import { Point, Rect } from "../../src/common/point";

export type PopoverPosition = {
    roundArea: Rect;
    elementArea?: Rect,
    dist?: number,
    offset?: number,
    align?: 'start' | 'center' | 'end',
    direction?: 'top' | 'left' | 'bottom' | 'right',
    relativePoint?: Point,
    mask?: boolean
}