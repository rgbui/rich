import { Page } from "..";
import { Block } from "../../block";
import { Point, Rect } from "../../common/vector/point";

const CellSize = 100;
export class GridSearch {
    constructor(public page: Page) { }
    private gridMap: Map<string, Block[]> = new Map();
    private blockMap: Map<string, { block: Block, grid: { min: number[], max: number[], rect: Rect } }> = new Map();
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
            var grid = { min: [gxMin, gyMin], max: [gxMax, gyMax], rect };
            this.blockMap.set(block.id, { block, grid });
            return newRect;
        }
    }
    public remove(block: Block) {
        var bc = this.blockMap.get(block.id);
        if (bc.grid) {
            for (let m = bc.grid.min[0]; m <= bc.grid.max[0]; m++) {
                for (let n = bc.grid.min[1]; n <= bc.grid.max[1]; n++) {
                    var key = this.getKey(m, n);
                    var r = this.gridMap.get(key);
                    if (Array.isArray(r)) r.remove(g => g == block);
                }
            }
        }
        this.blockMap.delete(block.id);
    }
    private range: Rect = new Rect();
    public start(event: MouseEvent) {
        var block = this.findPointBlock(event);
        var rs: Rect[] = [];
        if (block) {
            var newRange = this.sync(block);
            rs.push(newRange);
        }
        var center = this.page.getRelativePoint(Point.from(event));
        var step = 0;
        var size = 10;
        var arrowIsOvers = [false, false, false, false];
        function searchOver(arrow: number) {
            if (arrow == 0 || arrow == 2) {
                var minY = center.y - (step - 1) * size;
                if (arrow == 2) minY = center.y + (step - 1) * size;
                var minX = center.x - step * size;
                for (let i = 0; i < step * 2; i++) {
                    var x = minX + i * size;
                    var y = minY + (arrow == 0 ? 0 - size : size);
                    var rg = rs.find(r => r.conatin(new Point(x, y)))
                    if (rg) {
                        var dx = rg.x + rg.width - x;
                        var skipStep = Math.floor(dx / size);
                        i += skipStep;
                    }
                    else {
                        var newBlock = this.findPointBlock(new Point(x, y));
                        if (newBlock) {
                            var newRange = this.sync(block);
                            rs.push(newRange);
                            var dx = newRange.x + newRange.width - x;
                            var skipStep = Math.floor(dx / size);
                            i += skipStep;
                        }
                    }
                }
            }
            else if (arrow == 1 || arrow == 3) {
                var minX = center.x - (step - 1) * size;
                if (arrow == 1) minX = center.x + (step - 1) * size;
                var minY = center.y - step * size;
                for (let i = 0; i < step * 2; i++) {
                    var x = minX + (arrow == 3 ? 0 - size : size);
                    var y = minY + i * size;
                    var rg = rs.find(r => r.conatin(new Point(x, y)))
                    if (rg) {
                        var dy = rg.y + rg.height - y;
                        var skipStep = Math.floor(dy / size);
                        i += skipStep;
                    }
                    else {
                        var newBlock = this.findPointBlock(new Point(x, y));
                        if (newBlock) {
                            var newRange = this.sync(block);
                            rs.push(newRange);
                            var dy = newRange.y + newRange.height - y;
                            var skipStep = Math.floor(dy / size);
                            i += skipStep;
                        }
                    }
                }
            }
        }
        function removeRects() {
            var newRect = new Rect(center.x, center.y, 0, 0);
            newRect = newRect.extend(size * step);
            rs.removeAll(r => r.isContainRect(newRect))
        }
        while (!arrowIsOvers.every(o => o)) {
            step += 1;
            searchOver(0);
            searchOver(1);
            searchOver(2);
            searchOver(3);
            removeRects()
        }
    }
    public join(event: MouseEvent) {
        // var block = this.findPointBlock(event);
        // if (block?.isLine) block = block.closest(x => !x.isLine);
        // if (block) {
        //     var newRange = this.sync(block);

        // }
    }
    private findPointBlock(point: Point | MouseEvent) {
        var block = this.page.getBlockInMouseRegion(point);
        if (block?.isLine) block = block.closest(x => !x.isLine);
        return block;
    }
}