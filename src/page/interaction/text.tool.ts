import { Page } from "..";
import { TextTool, TextToolStyle } from "../../extensions/text.tool/text.tool";

export function PageTextTool(page: Page, textTool: TextTool) {
    textTool.on('error', err => page.onError(err));
    textTool.on('setStyle', styles => {
        page.kit.explorer.onSelectionSetPattern(styles);
    });
    textTool.on('getTextStyle', () => {
        var textStyle: TextToolStyle = {} as any;
        var bs = page.kit.explorer.selectedBlocks;
        return textStyle;
    })
}