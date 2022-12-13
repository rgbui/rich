import { Page } from "..";
import { Block } from "../../block";
import { Point, Rect } from "../../common/vector/point";

export class GridMap {
    public cellSize = 200;
    constructor(public panel: Page | Block) { }
    private gridMap: Map<string, Block[]> = new Map();
    private getKey(x: number, y: number) { return x + "," + y }
    relativePanelPoint: Point;
    private getRelativeRect(rect: Rect) {
        if (this.relativePanelPoint) return rect.relative(this.relativePanelPoint);
        if (this.panel instanceof Page) {
            return this.panel.getRelativeRect(rect);
        }
        else if (this.panel instanceof Block) {
            return this.panel.getRelativeRect(rect);
        }
    }
    private getRelativePoint(point: Point) {
        if (this.relativePanelPoint) return point.relative(this.relativePanelPoint);
        if (this.panel instanceof Page) {
            return this.panel.getRelativePoint(point);
        }
        else if (this.panel instanceof Block) {
            return this.panel.getRelativePoint(point);
        }
    }
    public sync(block: Block) {
        if (block.el) {
            var rect = block.getVisibleContentBound();
            var newRect = this.getRelativeRect(rect);
            var gxMin = Math.floor(newRect.left / this.cellSize);
            var gxMax = Math.ceil((newRect.left + newRect.width) / this.cellSize);
            var gyMin = Math.floor(newRect.top / this.cellSize);
            var gyMax = Math.ceil((newRect.top + newRect.height) / this.cellSize);
            for (let i = gxMin; i <= gxMax; i++) {
                for (let j = gyMin; j <= gyMax; j++) {
                    var key = this.getKey(i, j);
                    var gm = this.gridMap.get(key);
                    if (gm && Array.isArray(gm) && !gm.some(x => x == block)) gm.push(block);
                    else if (!gm) this.gridMap.set(key, [block]);
                }
            }
            if (block.grid) {
                for (let m = block.grid.min[0]; m <= block.grid.max[0]; m++) {
                    for (let n = block.grid.min[1]; n <= block.grid.max[1]; n++) {
                        if (m >= gxMin && m <= gxMax && n >= gyMin && n <= gyMax) continue;
                        else {
                            var key = this.getKey(m, n);
                            var r = this.gridMap.get(key);
                            if (Array.isArray(r)) r.remove(g => g == block);
                        }
                    }
                }
            }
            block.grid = { min: [gxMin, gyMin], max: [gxMax, gyMax], rect };
        }
    }
    public start() {
        this.relativePanelPoint = this.getRelativeRect(new Rect(0, 0, 0, 0)).leftTop;
        if (this.panel instanceof Page) {
            this.panel.each((b) => {
                if (b.panelGridMap === this) {
                    if (!b.isLine && !b.isLayout && !b.isPart)
                        this.sync(b);
                }
            })
        }
        else if (this.panel instanceof Block) {
            this.panel.each(b => {
                if (b.panelGridMap === this) {
                    if (!b.isLine && !b.isLayout && !b.isPart)
                        this.sync(b);
                }
            });
        }
    }
    public over() {
        delete this.relativePanelPoint;
        this.gridMap = new Map();
    }
    public remove(block: Block) {
        if (block.grid) {
            for (let m = block.grid.min[0]; m <= block.grid.max[0]; m++) {
                for (let n = block.grid.min[1]; n <= block.grid.max[1]; n++) {
                    var key = this.getKey(m, n);
                    var r = this.gridMap.get(key);
                    if (Array.isArray(r)) r.remove(g => g == block);
                }
            }
        }
        block.grid = undefined;
    }
    public gridRange() {
        var minX, minY, maxX, maxY;
        this.gridMap.forEach((value, key) => {
            var ks = key.split(/\,/g);
            var x = parseFloat(ks[0]);
            var y = parseFloat(ks[1]);
            if (typeof minX == 'undefined') {
                minX = x;
                minY = y;
                maxX = x;
                maxY = y;
            }
            else {
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
            }
        });
        return new Rect(minX * this.cellSize, minY * this.cellSize, maxX * this.cellSize, maxY * this.cellSize);
    }
    /**
     * 
     * @param point 全局坐标
     * @returns 
     */
    public findBlocksByPoint(point: Point, predict?: (block: Block) => boolean) {
        var relativePoint = this.getRelativePoint(point);
        var gxMin = Math.floor(relativePoint.x / this.cellSize);
        var gxMax = Math.ceil(relativePoint.x / this.cellSize);
        var gyMin = Math.floor(relativePoint.y / this.cellSize);
        var gyMax = Math.ceil(relativePoint.y / this.cellSize);
        if (typeof predict == 'undefined') predict = (b) => {
            return b.getVisibleContentBound().contain(point);
        }
        var blocks: Block[] = [];
        for (let i = gxMin; i <= gxMax; i++) {
            for (let j = gyMin; j <= gyMax; j++) {
                var key = this.getKey(i, j);
                var gm = this.gridMap.get(key);
                if (gm && Array.isArray(gm)) {
                    var r = gm.find(predict);
                    if (r) { blocks.push(r); }
                }
            }
        }
        return blocks;
    }
    public findBlocksByRect(rect: Rect, predict?: (block: Block) => boolean) {
        var relativeRect = this.getRelativeRect(rect);
        var gxMin = Math.floor(relativeRect.x / this.cellSize);
        var gxMax = Math.ceil((relativeRect.x + relativeRect.width) / this.cellSize);
        var gyMin = Math.floor(relativeRect.y / this.cellSize);
        var gyMax = Math.ceil((relativeRect.y + relativeRect.height) / this.cellSize);
        var blocks: Block[] = [];
        if (typeof predict == 'undefined') predict = (b) => {
            return b.isCrossBlockVisibleArea(rect);
        }
        for (let i = gxMin; i <= gxMax; i++) {
            for (let j = gyMin; j <= gyMax; j++) {
                var key = this.getKey(i, j);
                var gm = this.gridMap.get(key);
                if (gm && Array.isArray(gm)) {
                    if (typeof predict == 'function') {
                        var rs = gm.findAll(predict);
                        rs.forEach(r => {
                            if (r && !blocks.exists(r)) { blocks.push(r); }
                        })
                    }
                    else {
                        gm.each(g => {
                            if (!blocks.exists(g)) blocks.push(g);
                        })
                    }
                }
            }
        }
        return blocks;
    }
    public getMoveAlignOffset(rect: Rect, movePoint: Point, moveRect: Rect, feelDist: number, predict: (block: Block) => boolean) {

        var relativeRect = this.getRelativeRect(rect);
        var gxMin = Math.floor(relativeRect.x / this.cellSize);
        var gxMax = Math.ceil((relativeRect.x + relativeRect.width) / this.cellSize);
        var gyMin = Math.floor(relativeRect.y / this.cellSize);
        var gyMax = Math.ceil((relativeRect.y + relativeRect.height) / this.cellSize);

        var moveExtendRect = moveRect.extend(feelDist);
        var cxMin = Math.floor(moveExtendRect.x / this.cellSize);
        var cxMax = Math.ceil((moveExtendRect.x + moveExtendRect.width) / this.cellSize);
        var cyMin = Math.floor(moveExtendRect.y / this.cellSize);
        var cyMax = Math.ceil((moveExtendRect.y + moveExtendRect.height) / this.cellSize);

        var cxs: number[] = [];
        var cys: number[] = [];
        for (let i = cxMin; i <= cxMax; i++)cxs.push(i);
        for (let j = cyMin; j <= cyMax; j++)cys.push(j);

        var bs: { moveRect: Rect, moveArrow: string, rect: Rect, arrow: string }[] = [];
        function nearBlock(block: Block) {
            var cr = block.getVisibleContentBound();
            if (Math.abs(moveRect.left - cr.left) < feelDist || Math.abs(moveRect.right - cr.left) < feelDist) bs.push({ moveRect, moveArrow: Math.abs(moveRect.right - cr.left) < feelDist ? "right" : 'left', rect: cr, arrow: 'left' })
            else if (Math.abs(moveRect.left - cr.right) < feelDist || Math.abs(moveRect.right - cr.right) < feelDist) bs.push({ moveRect, moveArrow: Math.abs(moveRect.right - cr.right) < feelDist ? "right" : 'left', rect: cr, arrow: 'right' })
            else if (Math.abs(moveRect.top - cr.top) < feelDist || Math.abs(moveRect.bottom - cr.top) < feelDist) bs.push({ moveRect, moveArrow: Math.abs(moveRect.top - cr.top) < feelDist ? "top" : 'bottom', rect: cr, arrow: 'top' })
            else if (Math.abs(moveRect.top - cr.bottom) < feelDist || Math.abs(moveRect.bottom - cr.bottom) < feelDist) bs.push({ moveRect, moveArrow: Math.abs(moveRect.top - cr.bottom) < feelDist ? "top" : 'bottom', rect: cr, arrow: 'bottom' })
        }
        for (let i = gxMin; i <= gxMax; i++) {
            for (let j = gyMin; j <= gyMax; j++) {
                if (cxs.includes(i) || cys.includes(j)) {
                    var key = this.getKey(i, j);
                    var gm = this.gridMap.get(key);
                    if (gm && Array.isArray(gm)) {
                        var rs = gm.findAll(predict);
                        if (rs) {
                            rs.each(r => nearBlock(r))
                        }
                    }
                }
            }
        }
        var offset: Point = movePoint.clone();
        bs.forEach(b => {
            if (b.arrow == 'top') offset.y = b.rect.top;
            else if (b.arrow == 'bottom') offset.y = b.rect.bottom;
            else if (b.arrow == 'left') offset.x = b.rect.left;
            else if (b.arrow == 'right') offset.x = b.rect.right;
        })
        return { point: offset, lines: bs };
    }

}