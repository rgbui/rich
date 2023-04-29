import { PageWrite } from ".";
import { useAITool } from "../../../extensions/ai";
import { AppearAnchor } from "../../block/appear";

export function AiInput(write: PageWrite, aa: AppearAnchor, event: React.KeyboardEvent) {
    if (event.key.toLowerCase() == ' ' || event.keyCode === 32) {
        var sel = window.getSelection();
        if (sel.focusOffset == 0 && aa.isRowStart) {
            var block = aa.block.closest(x => x.isBlock);
            useAITool({
                block,
                pos: { roundArea: block.getVisibleBound(), relativeEleAutoScroll: block.el },
            })
            return true;
        }
    }
    return false;
}