import { PageWrite } from ".";
import { useAITool } from "../../../extensions/ai";
import { AppearAnchor } from "../../block/appear";

export function AiInput(write: PageWrite, aa: AppearAnchor, event: React.KeyboardEvent) {
    if (aa.block.page.ws.aiConfig?.disabled === true) return false;
    if (aa.isSolid) return false;
    if (!aa.isEmpty) return false;
    if (!aa?.block.isSupportTextStyle) return false;
    if (event.key.toLowerCase() == ' ' || event.keyCode === 32) {
        var sel = window.getSelection();
        if (sel.focusOffset == 0 && aa.isRowStart && !aa.isSolid) {
            var block = aa.block.closest(x => x.isBlock);
            useAITool({ block })
            return true;
        }
    }
    return false;
}