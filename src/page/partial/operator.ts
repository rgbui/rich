import { Page } from "..";
import { useSelectMenuItem } from "../../../component/view/menu";
import { MenuItemType } from "../../../component/view/menu/declare";
import { Block } from "../../block";
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
    */
    async createBlock(this: Page, url: string, data: Record<string, any>, parent: Block, at?: number, childKey?: string) {
        var block = await BlockFactory.createBlock(url, this, data, parent);
        if (typeof childKey == 'undefined') childKey = 'childs';
        var bs = parent.blocks[childKey];
        if (!Array.isArray(bs)) parent.blocks[childKey] = bs = [];
        if (typeof at == 'undefined') at = bs.length;
        bs.insertAt(at, block);
        this.snapshoot.record(OperatorDirective.create, {
            parentId: parent.id, childKey, at, preBlockId: block.prev ? block.prev.id : undefined, data: block.get()
        });
        await block.onCreated()
        this.onAddUpdate(parent);
        return block;
    }
    async onBatchDelete(this: Page, blocks: Block[]) {
        await this.onAction(ActionDirective.onBatchDeleteBlocks, async () => {
            await blocks.eachAsync(async bl => {
                await bl.delete()
            });
        })
    }
    async onBatchTurn(this: Page, blocks: Block[], url: string) {
        await this.onAction(ActionDirective.onBatchTurn, async () => {
            await blocks.eachAsync(async bl => {
                await bl.turn(url);
            })
        })
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
            await blocks.eachAsync(async block => {
                await block.move(to, direction);
            })
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
                this.onBatchTurn(blocks, item.value);
                break;
            case BlockDirective.trunIntoPage:
                break;
        }
    }
}