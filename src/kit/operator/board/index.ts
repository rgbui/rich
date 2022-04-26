import { Kit } from "../..";
import { Block } from "../../../block";
import { MouseDragger } from "../../../common/dragger";
import { Point } from "../../../common/vector/point";
import { CheckBoardTool } from "./tool";

export async function BoardDrag(kit: Kit, block: Block, event: React.MouseEvent) {
    /**
     * 先判断toolBoard工具栏有没有被使用，
     * 如果有使用，则根据工具栏来进行下一步操作
     */
    if (await CheckBoardTool(kit, block, event)) return;
    var downPoint = Point.from(event);
    MouseDragger({
        event,
        dis: 5,
        moveStart() {
            kit.selector.setStart(Point.from(event));
        },
        move(ev, data) {
            /***
             * 这里需要基于视觉查找当前有那些块可以被选中
             */
        },
        async moveEnd(ev, isMove, data) {
            if (isMove) {
                kit.selector.close();
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