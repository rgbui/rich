import { Block } from "..";
import { Rect } from "../../common/vector/point";

export class Block$Board {
    getBlockPicker(this: Block) {
        var pickers: {}[] = [];
        var width = this.fixedWidth;
        var height = this.fixedHeight;
        var rect = new Rect(0, 0, width, height);
        var gm = this.globalWindowMatrix;
        var gs = gm.resolveMatrixs();
        /**
         * 这里基本没有skew，只有scale,rotate,translate
         * scale 水平和垂直相等
         */
        var dis = 20;
        var extendRect = rect.extend(dis / gm.getScaling().x);


        return pickers;
    }
}