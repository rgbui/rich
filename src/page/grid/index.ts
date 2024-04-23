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
            return this.panel.getBoardRelativeRect(rect);
        }
        else if (this.panel instanceof Block) {
            return this.panel.getBoardRelativeRect(rect);
        }
    }
    private getRelativePoint(point: Point) {
        if (this.relativePanelPoint) return point.relative(this.relativePanelPoint);
        if (this.panel instanceof Page) {
            return this.panel.getBoardRelativePoint(point);
        }
        else if (this.panel instanceof Block) {
            return this.panel.getBoardRelativePoint(point);
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
    private eachBlock(predict: (block: Block) => void) {
        if (this.panel instanceof Page) {
            this.panel.each((b) => {
                if (b.panelGridMap === this || b.gridMap && b.parent.panelGridMap === this) {
                    if (!b.isLine && !b.isLayout && !b.isPart)
                        predict(b);
                }
            })
        }
        else if (this.panel instanceof Block) {
            this.panel.each(b => {
                if (b.panelGridMap === this || b.gridMap && b.parent.panelGridMap === this) {
                    if (!b.isLine && !b.isLayout && !b.isPart)
                        predict(b);
                }
            });
        }
    }
    public start() {
        this.relativePanelPoint = this.getRelativeRect(new Rect(0, 0, 0, 0)).leftTop;
        this.eachBlock(b => this.sync(b));
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
        this.eachBlock(b => {
            var rect = b.getVisibleContentBound();
            var newRect = rect;
            if (typeof minX == 'undefined') {
                minX = newRect.left;
                minY = newRect.top;
                maxX = newRect.right;
                maxY = newRect.bottom;
            }
            else {
                minX = Math.min(minX, newRect.left);
                minY = Math.min(minY, newRect.top);
                maxX = Math.max(maxX, newRect.right);
                maxY = Math.max(maxY, newRect.bottom);
            }
        })
        if (typeof minX == 'number') {
            var rect = new Rect(new Point(minX, minY), new Point(maxX, maxY));
            return rect;
        }
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
}