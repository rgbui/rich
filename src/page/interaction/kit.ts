import { Kit } from "../../kit";
export function PageKit(kit: Kit) {
    var page = kit.page;
    kit.on('mouseup', event => {
        if (kit.explorer.hasTextRange) {
            if (kit.explorer.selectedBlocks.length == 1 && !kit.explorer.selectedBlocks[0].isSupportTextStyle)
                page.textTool.close()
            else page.textTool.open(kit.explorer.getSelectionPoint(),
                kit.explorer.selectedBlocks[0]
            )
        }
        else page.textTool.close()
    })
    kit.on("keydown", (event) => {
        if (page.blockSelector.isVisible)
            return page.blockSelector.interceptKey(event);
        else if (page.referenceSelector.isVisible)
            return page.referenceSelector.interceptKey(event);
    });
    kit.on('inputting', (value, anchor, options) => {
        if (page.blockSelector.isTriggerOpen(value))
            page.blockSelector.open(anchor.bound.leftBottom, value);
        else if (page.blockSelector.isTriggerFilter(value))
            page.blockSelector.onInputFilter(value);
        else if (page.referenceSelector.isTriggerOpen(value))
            page.referenceSelector.open(anchor.bound.leftBottom);
        else if (page.referenceSelector.isTriggerFilter(value))
            page.referenceSelector.onInputFilter(value);
        else page.inputDetector.match(value, anchor, options);
    });
    kit.on('willInput', () => {
        page.blockSelector.close();
        page.referenceSelector.close();
    });
    kit.on('error', error => page.onError(error));
}