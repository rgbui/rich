import { Page } from "..";
import { Block } from "../../block";
import { Point, Rect } from "../../common/vector/point";
const CellSize = 200;
export class GridMap {
    constructor(public panel: Page | Block) { }
    private gridMap: Map<string, Block[]> = new Map();
    private getKey(x: number, y: number) { return x + "," + y }
    private getRelativeRect(rect: Rect) {
        if (this.panel instanceof Page) {
            return this.panel.getRelativeRect(rect);
        }
        else if (this.panel instanceof Block) {
            return this.panel.getRelativeRect(rect);
        }
    }
    private getRelativePoint(point: Point) {
        if (this.panel instanceof Page) {
            return this.panel.getRelativePoint(point);
        }
        else if (this.panel instanceof Block) {
            return this.panel.getRelativePoint(point);
        }
    }
    public sync(block: Block)
    {
        if (block.el) {
            var rect = Rect.fromEle(block.el);
            var newRect = this.getRelativeRect(rect);
            var gxMin = Math.floor(newRect.left / CellSize);
            var gxMax = Math.ceil((newRect.left + newRect.width) / CellSize);
            var gyMin = Math.floor(newRect.top / CellSize);
            var gyMax = Math.ceil((newRect.top + newRect.height) / CellSize);
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
    public buildGridMap() {
        var t = Date.now();
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
        console.log('es', Date.now() - t);
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
        return new Rect(minX * CellSize, minY * CellSize, maxX * CellSize, maxY * CellSize);
    }
    /**
     * 
     * @param point 全局坐标
     * @returns 
     */
    public findBlocksByPoint(point: Point, predict?: (block: Block) => boolean) {
        var relativePoint = this.getRelativePoint(point);
        var gxMin = Math.floor(relativePoint.x / CellSize);
        var gxMax = Math.ceil(relativePoint.x / CellSize);
        var gyMin = Math.floor(relativePoint.y / CellSize);
        var gyMax = Math.ceil(relativePoint.y / CellSize);
        if (typeof predict == 'undefined') predict = (b) => {
            return b.getVisibleContentBound().conatin(point);
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
        var gxMin = Math.floor(relativeRect.x / CellSize);
        var gxMax = Math.ceil((relativeRect.x + relativeRect.width) / CellSize);
        var gyMin = Math.floor(relativeRect.y / CellSize);
        var gyMax = Math.ceil((relativeRect.y + relativeRect.height) / CellSize);
        var blocks: Block[] = [];
        if (typeof predict == 'undefined') predict = (b) => {
            return b.isCrossBlockArea(rect);
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