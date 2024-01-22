import lodash from "lodash";
import { Block } from "../../block";
import { Point, Rect } from "../../common/vector/point";
import { GridMap } from "../../page/grid";
import { BlockUrlConstant } from "../../block/constant";

export function CacAlignLines(block: Block, gm: GridMap, from: Point, to: Point, rect: Rect) {
    rect = rect.clone();
    rect.move(to.x - from.x, to.y - from.y);
    var re = block.realPx(10);
    var d = rect.extend(re);
    var wr = block.page.bound;
    var xrect = new Rect(new Point(wr.left, d.top), new Point(wr.right, d.bottom));
    var yrect = new Rect(new Point(d.left, wr.top), new Point(d.right, wr.bottom));
    var xbs = gm.findBlocksByRect(xrect);
    var ybs = gm.findBlocksByRect(yrect);
    var bs = block.page.getAtomBlocks(xbs.concat(ybs));
    lodash.remove(bs, g => g === block || g.url == BlockUrlConstant.Line);

    var vs: { nx: number, dx: number, dy: number, ny: number, lines: { arrow: 'x' | 'y', start: Point, end: Point }[] }[] = [];
    bs.forEach(b => {
        var otherRect = b.getVisibleContentBound();
        // 检查左侧和右侧对齐
        var ls: { nx: number, dx: number, dy: number, ny: number, lines: { arrow: 'x' | 'y', start: Point, end: Point }[] } = {
            lines: [],
            nx: undefined,
            ny: undefined,
            dx: undefined,
            dy: undefined
        };
        if (Math.abs(rect.left - otherRect.left) < re) {
            if (otherRect.top < rect.top)
                ls.lines.push({
                    arrow: 'y',
                    start: otherRect.leftTop,
                    end: new Point(otherRect.left, rect.bottom)
                })
            else ls.lines.push({
                arrow: 'y',
                start: new Point(otherRect.left, rect.top),
                end: otherRect.leftBottom
            })
            ls.dx = otherRect.leftMiddle.dis(rect.leftMiddle)
            ls.nx = otherRect.left - rect.left;
            if (Math.abs(rect.center - otherRect.center) < re) {
                if (otherRect.top < rect.top)
                    ls.lines.push({
                        arrow: 'y',
                        start: otherRect.topCenter,
                        end: new Point(otherRect.center, rect.bottom)
                    })
                else ls.lines.push({
                    arrow: 'y',
                    start: new Point(otherRect.center, rect.top),
                    end: otherRect.bottomCenter
                })
            }
            if (Math.abs(rect.right - otherRect.right) < re) {
                if (otherRect.top < rect.top)
                    ls.lines.push({
                        arrow: 'y',
                        start: otherRect.rightTop,
                        end: new Point(otherRect.right, rect.bottom)
                    })
                else ls.lines.push({
                    arrow: 'y',
                    start: new Point(otherRect.right, rect.top),
                    end: otherRect.rightBottom
                })
            }
        }
        else if (Math.abs(rect.center - otherRect.center) < re) {
            if (otherRect.top < rect.top)
                ls.lines.push({
                    arrow: 'y',
                    start: otherRect.topCenter,
                    end: new Point(otherRect.center, rect.bottom)
                })
            else ls.lines.push({
                arrow: 'y',
                start: new Point(otherRect.center, rect.top),
                end: otherRect.bottomCenter
            })
            ls.dx = otherRect.leftMiddle.dis(rect.leftMiddle)
            ls.nx = otherRect.center - rect.center;
        }
        else if (Math.abs(rect.right - otherRect.right) < re) {
            if (otherRect.top < rect.top)
                ls.lines.push({
                    arrow: 'y',
                    start: otherRect.rightTop,
                    end: new Point(otherRect.right, rect.bottom)
                })
            else ls.lines.push({
                arrow: 'y',
                start: new Point(otherRect.right, rect.top),
                end: otherRect.rightBottom
            })
            ls.dx = otherRect.leftMiddle.dis(rect.leftMiddle)
            ls.nx = otherRect.right - rect.right;
        }

        // 检查顶部和底部对齐
        if (Math.abs(rect.top - otherRect.top) < re) {
            if (otherRect.left < rect.left)
                ls.lines.push({
                    arrow: 'x',
                    start: otherRect.leftTop,
                    end: new Point(rect.right, otherRect.top)
                })
            else ls.lines.push({
                arrow: 'x',
                start: new Point(rect.left, otherRect.top),
                end: otherRect.rightTop
            })
            ls.dy = otherRect.topCenter.dis(rect.topCenter);
            ls.ny = otherRect.top - rect.top;
            if (Math.abs(rect.middle - otherRect.middle) < re) {
                if (otherRect.left < rect.left)
                    ls.lines.push({
                        arrow: 'x',
                        start: otherRect.leftMiddle,
                        end: new Point(rect.right, otherRect.middle)
                    })
                else ls.lines.push({
                    arrow: 'x',
                    start: new Point(rect.left, otherRect.middle),
                    end: otherRect.rightMiddle
                })
            }
            if (Math.abs(rect.bottom - otherRect.bottom) < re) {
                if (otherRect.left < rect.left)
                    ls.lines.push({
                        arrow: 'x',
                        start: otherRect.leftBottom,
                        end: new Point(rect.right, otherRect.bottom)
                    })
                else ls.lines.push({
                    arrow: 'x',
                    start: new Point(rect.left, otherRect.bottom),
                    end: otherRect.rightBottom
                })
            }
        }
        else if (Math.abs(rect.middle - otherRect.middle) < re) {
            if (otherRect.left < rect.left)
                ls.lines.push({
                    arrow: 'x',
                    start: otherRect.leftMiddle,
                    end: new Point(rect.right, otherRect.middle)
                })
            else ls.lines.push({
                arrow: 'x',
                start: new Point(rect.left, otherRect.middle),
                end: otherRect.rightMiddle
            })
            ls.dy = otherRect.topCenter.dis(rect.topCenter);
            ls.ny = otherRect.middle - rect.middle;
        }
        else if (Math.abs(rect.bottom - otherRect.bottom) < re) {
            if (otherRect.left < rect.left)
                ls.lines.push({
                    arrow: 'x',
                    start: otherRect.leftBottom,
                    end: new Point(rect.right, otherRect.bottom)
                })
            else ls.lines.push({
                arrow: 'x',
                start: new Point(rect.left, otherRect.bottom),
                end: otherRect.rightBottom
            })
            ls.dy = otherRect.topCenter.dis(rect.topCenter);
            ls.ny = otherRect.bottom - rect.bottom;
        }

        if (typeof ls.dy == 'number' || typeof ls.dx == 'number') vs.push(ls);
    });
    var mx = vs.filter(g => typeof g.dx == 'number' && typeof g.nx == 'number').findMin(g => g.dx)?.nx;
    var my = vs.filter(g => typeof g.dy == 'number' && typeof g.ny == 'number').findMin(g => g.dy)?.ny;
    lodash.remove(vs, g => {
        if (typeof mx == 'number') {
            if (typeof g.nx == 'number' && g.nx != mx) return true;
        }
        if (typeof my == 'number') {
            if (typeof g.ny == 'number' && g.ny !== my) return true;
        }
        return false;
    });
    return {
        ox: mx,
        oy: my,
        lines: vs.map(g => g.lines).flat(2)
    }
}