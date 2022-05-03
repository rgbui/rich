import { Kit } from "../..";
import { Block } from "../../../block";
import { MouseDragger } from "../../../common/dragger";
import { Point, Rect } from "../../../common/vector/point";
import { openBoardEditTool } from "./edit";
import { CheckBoardTool } from "./selector";

export async function BoardDrag(kit: Kit, block: Block, event: React.MouseEvent) {
    /**
     * 先判断toolBoard工具栏有没有被使用，
     * 如果有使用，则根据工具栏来进行下一步操作
     */
    if (await CheckBoardTool(kit, block, event)) return;
    var downPoint = Point.from(event);
    var gm = block ? block.panelGridMap : kit.page.gridMap;
    MouseDragger({
        event,
        dis: 5,
        moveStart() {
            gm.start();
            kit.selector.setStart(Point.from(event));
        },
        move(ev, data) {
            /***
             * 这里需要基于视觉查找当前有那些块可以被选中
             */
            var movePoint = Point.from(ev);
            var bs = gm.findBlocksByRect(new Rect(downPoint, movePoint));
            kit.picker.onPicker(bs);
        },
        async moveEnd(ev, isMove, data) {
            gm.over();
            if (isMove) {
                kit.selector.close();
                await openBoardEditTool(kit);
            }
            else {
                /**
                 * 这里说明是点击选择board块，那么判断是否有shift连选操作
                 * 
                 */
            }
        }
    })
}