import { Page } from "..";
import { TextTool } from "../../extensions/text.tool/text.tool";


export function PageTextTool(page: Page, textTool: TextTool) {
    textTool.on('error', err => page.onError(err));
    textTool.on('selectionExcuteCommand', command => {
        page.kit.explorer.onSelectionExcuteCommand(command);
    })
}