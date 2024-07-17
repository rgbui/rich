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
        PageLayoutType.doc,
        PageLayoutType.db
    ].includes(kit.page.pageLayout.type)
    ) return;
    /**
     * 通过鼠标来查找block，然后判断当前文档类型或块的类型来决后续该由谁来操作
     * 注意:block不一定能找到
     * 判断块的类型来决定后续的操作分类，不一定靠谱
     */
    var block = kit.page.getBlockByMouseOrPoint(event.nativeEvent);
    if (!block && kit.page.nav) {
        block = kit.page.views.first()
    }
    if (block?.isLine) block = block.closest(x => x.isContentBlock);
    if (kit.boardSelector.isSelector && block) {
        CheckBoardSelector(kit, block, event);
        return;
    }

    if (kit.page.isBoard || block?.isFreeBlock || block?.isBoardBlock) {
        if (window.shyConfig?.isDev)
            console.log('board block:', block)
        event.preventDefault()
        var sel = window.getSelection();
        var focusNode = sel.focusNode;
        if (!(focusNode && kit.page.viewEl.contains(focusNode))) {
            sel.collapse(kit.page.viewEl)
        }
        BoardDrag(kit, block, event);
    } else {
        if (window.shyConfig?.isDev)
            console.log('doc block:', block)
        kit.boardSelector.close();
        kit.picker.onCancel();
        DocDrag(kit, block, event);
    }

}
