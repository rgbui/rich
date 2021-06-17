import { Page } from "..";
import { BlockSelector } from "../../extensions/block";
export function PageBlockSelector(page: Page, selector: BlockSelector) {
    selector.on('error', err => page.onError(err));
    selector.on('select', (blockData, value) => {
        page.kit.textInput.onBlockSelectorInsert(blockData, value);
    });
}