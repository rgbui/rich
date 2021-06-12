import { Kit } from "../../kit";
export function PageKit(kit: Kit) {
    var page = kit.page;
    kit.on('mouseup', event => {
        if (kit.explorer.hasTextRange) page.textTool.open(event)
        else page.textTool.close()
    })
    kit.on("keydown", (event) => {
        if (page.blockSelector.isVisible)
            return page.blockSelector.interceptKey(event);
        else if (page.referenceSelector.isVisible)
            return page.referenceSelector.interceptKey(event);
    });
    kit.on('inputting', (value, anchor) => {
        if (page.blockSelector.isTriggerOpen(value))
            page.blockSelector.open(anchor.bound.leftBottom, value)
        else if (page.blockSelector.isTriggerFilter(value))
            page.blockSelector.onInputFilter(value)
        else if (page.referenceSelector.isTriggerOpen(value))
            page.referenceSelector.open(anchor.bound.leftBottom)
        else if (page.referenceSelector.isTriggerFilter(value))
            page.referenceSelector.onInputFilter(value)
    });
    kit.on('willInput', () => {
        page.blockSelector.close();
        page.referenceSelector.close();
    });
}