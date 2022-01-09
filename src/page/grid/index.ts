import { Page } from "..";
import { Block } from "../../block";
import { Point, Rect } from "../../common/vector/point";
const CellSize = 100;
export class PageGrid {
    constructor(public page: Page) { }
    private gridMap: Map<string, Block[]> = new Map();
    private getKey(x: number, y: number) { return x + "," + y }
    public sync(block: Block) {
        if (block.el) {
            var rect = Rect.fromEle(block.el);
            var newRect = this.page.getRelativeRect(rect);
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
    public findBlocksByPoint(point: Point, predict: (block: Block) => boolean) {
        var relativePoint = this.page.getRelativePoint(point);
        var gxMin = Math.floor(relativePoint.x / CellSize);
        var gxMax = Math.ceil(relativePoint.x / CellSize);
        var gyMin = Math.floor(relativePoint.y / CellSize);
        var gyMax = Math.ceil(relativePoint.y / CellSize);
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
    public findBlocksByRect(rect: Rect, predict: (block: Block) => boolean) {
        var relativeRect = this.page.getRelativeRect(rect);
        var gxMin = Math.floor(relativeRect.x / CellSize);
        var gxMax = Math.ceil((relativeRect.x + relativeRect.width) / CellSize);
        var gyMin = Math.floor(relativeRect.y / CellSize);
        var gyMax = Math.ceil((relativeRect.y + relativeRect.height) / CellSize);
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
    public findBlockNearestByPoint(point: Point, predict: (block: Block) => boolean) {
        var relativePoint = this.page.getRelativePoint(point);
        var gxMin = Math.floor(relativePoint.x / CellSize);
        var gxMax = Math.ceil(relativePoint.x / CellSize);
        var gyMin = Math.floor(relativePoint.y / CellSize);
        var gyMax = Math.ceil(relativePoint.y / CellSize);
        var xs: number[] = [];
        var ys: number[] = [];
        for (let i = gyMin; i <= gyMax; i++) { ys.push(i) }
        for (let j = gxMin; j <= gxMax; j++) { xs.push(j) }
        var xBs: Block[] = [];
        var yBs: Block[] = [];

        var yMin: number;
        var yMinBlocks: Block[] = [];

        var yMax: number;
        var yMaxBlocks: Block[] = [];
        this.gridMap.forEach((bs, key) => {
            var xy = key.split(",");
            var x = parseInt(xy[0]);
            var y = parseInt(xy[1]);
            if (xs.includes(x)) {
                xBs.addRange(bs.findAll(predict));
            }
            if (ys.includes(y)) {
                yBs.addRange(bs.findAll(predict));
            }
            if (typeof yMin == 'undefined') { yMin = y; yMinBlocks = bs; }
            else if (yMin > y) { yMin = y; yMinBlocks = bs; }
            else if (yMin == y) { yMinBlocks.addRange(bs) }
            if (typeof yMax == 'undefined') { yMax = y; yMaxBlocks = bs; }
            else if (yMax < y) { yMax = y; yMaxBlocks = bs; }
            else if (yMax == y) { yMaxBlocks.addRange(bs); }
        })
        if (yBs.length > 0) {
            return this.page.findNearestBlockByPoint(yBs, point);
        }
        if (xBs.length > 0) {
            return this.page.findNearestBlockByPoint(xBs, point);
        }
        if (gyMin <= yMin) {
            return this.page.findNearestBlockByPoint(yMinBlocks, point);
        }
        if (gyMax >= yMax) {
            return this.page.findNearestBlockByPoint(yMaxBlocks, point);
        }
    }
}