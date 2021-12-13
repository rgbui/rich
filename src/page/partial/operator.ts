import { Page } from "..";
import { useSelectMenuItem } from "../../../component/view/menu";
import { MenuItemType } from "../../../component/view/menu/declare";
import { Block } from "../../block";
import { BlockUrlConstant } from "../../block/constant";
import { BlockDirective } from "../../block/enum";
import { BlockFactory } from "../../block/factory/block.factory";
import { Rect } from "../../common/point";
import { ActionDirective, OperatorDirective } from "../../history/declare";
import { DropDirection } from "../../kit/handle/direction";
import { Anchor } from "../../kit/selection/anchor";
import { PageDirective } from "../directive";

export class Page$Operator {
    /**
    * 创建一个block
    * @param url 
    * @param data 
    * @param parent 
    * @param at 
    * 
    */
    async createBlock(this: Page, url: string, data: Record<string, any>, parent: Block, at?: number, childKey?: string) {
        var block = await BlockFactory.createBlock(url, this, data, parent);
        if (typeof childKey == 'undefined') childKey = 'childs';
        if (!parent.allBlockKeys.some(s => s == childKey)) {
            console.error(`${parent.url} not support childKey:${childKey}`);
            childKey = parent.allBlockKeys[0];
        }
        var bs = parent.blocks[childKey];
        if (!Array.isArray(bs)) parent.blocks[childKey] = bs = [];
        if (typeof at == 'undefined') at = bs.length;
        bs.insertAt(at, block);
        this.snapshoot.record(OperatorDirective.create, {
            parentId: parent.id, childKey, at, preBlockId: block.prev ? block.prev.id : undefined, data: await block.get()
        });
        await block.created()
        this.addBlockUpdate(parent);
        return block;
    }
    async onCreateTailTextSpan(this: Page) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.onAction(ActionDirective.onCreateTailTextSpan, async () => {
                    var lastBlock = this.findReverse(g => g.isBlock);
                    var newBlock: Block;
                    if (lastBlock && lastBlock.parent == this.views.last()) {
                        newBlock = await this.createBlock(BlockUrlConstant.TextSpan, {}, lastBlock.parent, lastBlock.at + 1);
                    }
                    else {
                        newBlock = await this.createBlock(BlockUrlConstant.TextSpan, {}, this.views.last());
                    }
                    newBlock.mounted(() => {
                        this.kit.explorer.onFocusAnchor(newBlock.createAnchor());
                        resolve(true);
                    })
                })

            }
            catch (ex) {
                this.onError(ex);
                reject(ex);
            }
        })
    }
    async onBatchDelete(this: Page, blocks: Block[]) {
        await this.onAction(ActionDirective.onBatchDeleteBlocks, async () => {
            await blocks.eachAsync(async bl => {
                await bl.delete()
            });
        })
    }
    async onTurn(this: Page, block: Block, url: string, callback: (newBlock: Block) => void) {
        await this.onAction(ActionDirective.onTurn, async () => {
            var newBlock = await block.turn(url);
            callback(newBlock);
        });
    }
    async onBatchTurn(this: Page, blocks: Block[], url: string) {
        var bs: Block[] = [];
        await this.onAction(ActionDirective.onBatchTurn, async () => {
            await blocks.eachAsync(async bl => {
                var newBlock = await bl.turn(url);
                bs.push(newBlock);
            })
        });
        return bs;
    }
    async onBackTurn(this: Page, block: Block, callback: (newBlock: Block) => void) {
        await this.onAction(ActionDirective.onBackTurn, async () => {
            if (block.isListBlock) {
                var cs = block.getChilds(block.childKey);
                if (cs.length > 0) await block.parent.appendArray(cs, block.at + 1, block.parent.childKey);
            }
            var newBlock = await block.turn(BlockUrlConstant.TextSpan);
            callback(newBlock);
        });
    }
    async onCombineLikeTextSpan(this: Page, block: Block, willCombineBlock: Block, after?: () => Promise<void>) {
        await this.onAction(ActionDirective.combineTextSpan, async () => {
            if (willCombineBlock.childs.length > 0) {
                if (block.content && block.childs.length == 0) {
                    await this.createBlock(BlockUrlConstant.Text, { content: block.content }, block, 0);
                    block.updateProps({ content: '' });
                }
                var cs = willCombineBlock.childs.map(c => c);
                await cs.eachAsync(async (c) => {
                    await block.append(c)
                })
            }
            else {
                if (block.content && block.childs.length == 0) {
                    await this.createBlock(BlockUrlConstant.Text, { content: block.content }, block, 0);
                    block.updateProps({ content: '' });
                }
                if (willCombineBlock.content) {
                    await this.createBlock(BlockUrlConstant.Text, { content: willCombineBlock.content }, block, block.childs.length);
                }
            }
            await willCombineBlock.delete();
            if (typeof after == 'function') {
                await after();
            }
        });
    }
    onBlurAnchor(this: Page, anchor: Anchor) {
        if (anchor.block) {
            anchor.block.blurAnchor(anchor);
        }
        this.emit(PageDirective.blurAnchor, anchor);
    }
    onFocusAnchor(this: Page, anchor: Anchor) {
        if (anchor.block) {
            anchor.block.focusAnchor(anchor);
        }
        this.emit(PageDirective.focusAnchor, anchor);
    }
    onBackspaceToTopPage(this: Page) {

    }
    onDropLeaveBlock(this: Page, dragBlocks: Block[], dropBlock: Block, direction: DropDirection) {
        this.kit.page.emit(PageDirective.dropLeaveBlock, dragBlocks, dropBlock, direction);
    }
    onDropEnterBlock(this: Page, dragBlocks: Block[], dropBlock: Block, direction: DropDirection) {
        this.kit.page.emit(PageDirective.dropLeaveBlock, dragBlocks, dropBlock, direction);
    }
    /**
     * 批量将block拖到另一个block
     * @param this 
     * @param blocks 
     * @param to 
     * @param arrow 
     */
    async onBatchDragBlocks(this: Page, blocks: Block[], to: Block, direction: DropDirection) {
        /**
         * 就是将blocks append 到to 下面
         */
        await this.onAction(ActionDirective.onBatchDragBlocks, async () => {
            await to.drop(blocks, direction);
        })
    }
    async onBatchDargCreateBlocks(this: Page, blocks: any[], to: Block, direction: DropDirection) {
        /**
        * 就是将blocks append 到to 下面
        */
        await this.onAction(ActionDirective.onBatchDragBlockDatas, async () => {
            await to.dropBlockDatas(blocks, direction);
        })
    }
    /**
     * 对block打开右键菜单
     * @param this 
     * @param blocks 
     * @param event 
     */
    async onOpenMenu(this: Page, blocks: Block[], event: MouseEvent) {
        var re = await useSelectMenuItem(
            {
                roundArea: Rect.fromEvent(event),
                direction: 'left'
            },
            await blocks[0].onGetContextMenus()
        );
        if (re) {
            if (blocks.length == 1) await blocks[0].onClickContextMenu(re.item, re.event);
            else await this.onClickContextMenu(blocks, re.item, re.event)
        }
    }
    async onClickContextMenu(this: Page, blocks: Block[], item: MenuItemType<BlockDirective>, event: MouseEvent) {
        switch (item.name) {
            case BlockDirective.delete:
                this.onBatchDelete(blocks);
                break;
            case BlockDirective.copy:
                /**
                 * 将元素复制到服务器，
                 * 然后可以跨平台粘贴
                 */
                break;
            case BlockDirective.link:
                break;
            case BlockDirective.trun:
                this.onBatchTurn(blocks, item.url);
                break;
            case BlockDirective.trunIntoPage:
                break;
        }
    }
    async onPasterFiles(this: Page, files: File[]) {
        if (!files || Array.isArray(files) && files.length == 0) return;
        if (this.kit.explorer.isOnlyAnchor) {
            var anchor = this.kit.explorer.activeAnchor;
            var block = anchor.block;
            await this.onAction(ActionDirective.onPasteCreateBlocks, async () => {
                var firstBlock = block;
                for (let i = 0; i < files.length; i++) {
                    var file = files[i];
                    if (file.type == 'image/png') {
                        //图片
                        block = await block.visibleDownCreateBlock('/image', { initialData: { file } });
                    }
                    else {
                        block = await block.visibleDownCreateBlock('/file', { initialData: { file } });
                    }
                }
                if (firstBlock.isTextContentBlockEmpty) {
                    await firstBlock.delete();
                }
                block.mounted(() => {
                    var anchor = block.visibleHeadAnchor;
                    if (anchor)
                        anchor.explorer.onFocusAnchor(anchor);
                });
            })
        }
        else if (this.kit.explorer.hasSelectionRange) {
            var bs = this.kit.explorer.selectedBlocks;
            var block = bs.last().closest(x => x.isBlock);
            if (this.kit.explorer.hasTextRange) bs = [];
            await this.onAction(ActionDirective.onPasteCreateBlocks, async () => {
                for (let i = 0; i < files.length; i++) {
                    var file = files[i];
                    if (file.type == 'image/png') {
                        //图片
                        block = await block.visibleDownCreateBlock('/image', { initialData: { file } });
                    }
                    else {
                        block = await block.visibleDownCreateBlock('/file', { initialData: { file } });
                    }
                }
                await bs.eachAsync(async b => {
                    await b.delete();
                })
                block.mounted(() => {
                    var anchor = block.visibleHeadAnchor;
                    if (anchor)
                        anchor.explorer.onFocusAnchor(anchor);
                });
            })
        }

    }
    async onPasteCreateBlocks(this: Page, blocks: any[]) {
        if (blocks.length == 0) return;
        if (this.kit.explorer.isOnlyAnchor) {
            var anchor = this.kit.explorer.activeAnchor;
            var block = anchor.block;
            await this.onAction(ActionDirective.onPasteCreateBlocks, async () => {
                var firstBlock = block;
                for (let i = 0; i < blocks.length; i++) {
                    var bd = blocks[i];
                    block = await block.visibleDownCreateBlock(bd.url, bd);
                }
                if (firstBlock.isTextContentBlockEmpty) {
                    await firstBlock.delete();
                }
                block.mounted(() => {
                    var anchor = block.visibleHeadAnchor;
                    if (anchor)
                        anchor.explorer.onFocusAnchor(anchor);
                });
            })
        }
        else if (this.kit.explorer.hasSelectionRange) {
            var bs = this.kit.explorer.selectedBlocks;
            var block = bs.last().closest(x => x.isBlock);
            if (this.kit.explorer.hasTextRange) bs = [];
            await this.onAction(ActionDirective.onPasteCreateBlocks, async () => {
                for (let i = 0; i < blocks.length; i++) {
                    var bd = blocks[i];
                    block = await block.visibleDownCreateBlock(bd.url, bd);
                }
                await bs.eachAsync(async b => {
                    await b.delete();
                })
                block.mounted(() => {
                    var anchor = block.visibleHeadAnchor;
                    if (anchor)
                        anchor.explorer.onFocusAnchor(anchor);
                });
            })
        }
    }
}