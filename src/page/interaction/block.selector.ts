import { Page } from "..";
import { BlockSelector } from "../../extensions/block";
export function PageBlockSelector(page: Page, selector: BlockSelector) {
    selector.on('error', err => page.onError(err));
    selector.on('select', (blockData,value) => {
        page.kit.textInput.onBlockSelectorInsert(blockData,value);
    });
    //     this.blockSelector.only('select', async (blockData) => {
    //         anchor.block.onStoreInputText(this.textAt,
    //             value.replace(/[\/、][^/、]*$/, ""),
    //             true,
    //             async () => {
    //                 await this.page.onObserveUpdate(async () => {
    //                     var newBlock = await anchor.block.visibleDownCreateBlock(blockData.url);
    //                     newBlock.mounted(() => {
    //                         var contentBlock = newBlock.find(g => !g.isLayout);
    //                         if (contentBlock) {
    //                             var newAnchor = contentBlock.visibleHeadAnchor;
    //                             this.explorer.onFocusAnchor(newAnchor);
    //                         }
    //                     });
    //                 })
    //             }
    //         )
    //     })
}