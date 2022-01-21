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
    private range:Rect=new Rect();
    public join(event: MouseEvent) {
        var block = this.findPointBlock(event);
        if (block?.isLine) block = block.closest(x => !x.isLine);
        if (block) {
            var newRange=this.sync(block);

        }
    }
    private findPointBlock(point: Point | MouseEvent) {
        return this.page.getBlockInMouseRegion(point);
    }
}