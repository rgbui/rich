import { Kit } from "..";
import { PageLayoutType } from "../../page/declare";
import { BoardDrag } from "./board";
import { CheckBoardSelector } from "../board.selector/selector";
import { DocDrag } from "./doc";

/***
 * page的点击至拖动主要分两大类
 * 文档
 * 白板
 * 
 */
export async function PageDrag(kit: Kit, event: React.MouseEvent) {
    kit.operator.onClearPage();
    if (!kit.page.pageLayout?.type || ![
        PageLayoutType.board,
        PageLayoutType.ppt,
        PageLayoutType.doc
    ].includes(kit.page.pageLayout.type)
    ) return;
    /**
     * 通过鼠标来查找block，然后判断当前文档类型或块的类型来决后续该由谁来操作
     * 注意:block不一定能找到
     * 判断块的类型来决定后续的操作分类，不一定靠谱
     */
    var block = kit.page.getBlockByMouseOrPoint(event.nativeEvent);
    if (block?.isLine) block = block.closest(x => !x.isLine);
    if (kit.boardSelector.isSelector && block) {
        CheckBoardSelector(kit, block, event);
        return;
    }
    console.log('block', block)
    if (kit.page.isBoard || block?.isFreeBlock || block?.isBoardBlock) {
      
        event.preventDefault()
        window.getSelection().collapse(kit.page.viewEl)
        BoardDrag(kit, block, event);
    } else {
        kit.boardSelector.close();
        kit.picker.onCancel();
        DocDrag(kit, block, event);
    }

}
