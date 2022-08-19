import { Page } from "..";
import { useSelectMenuItem } from "../../../component/view/menu";
import { MenuItem } from "../../../component/view/menu/declare";
import { Block } from "../../block";
import { AppearAnchor } from "../../block/appear";
import { BlockUrlConstant } from "../../block/constant";
import { BlockDirective } from "../../block/enum";
import { BlockFactory } from "../../block/factory/block.factory";
import { Rect } from "../../common/vector/point";
import { ActionDirective, OperatorDirective } from "../../history/declare";
import { DropDirection } from "../../kit/handle/direction";
import { PageLayoutType } from "../declare";
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
        if (parent) {
            if (typeof childKey == 'undefined') childKey = parent.childKey;
            if (!parent.allBlockKeys.some(s => s == childKey)) {
                console.error(`${parent.url} not support childKey:${childKey}`);
                childKey = parent.allBlockKeys[0];
            }
            var bs = parent.blocks[childKey];
            if (!Array.isArray(bs)) parent.blocks[childKey] = bs = [];
            if (typeof at == 'undefined') at = bs.length;
            bs.insertAt(at, block);
            await block.created();
            this.snapshoot.record(OperatorDirective.$create, {
                pos: block.pos,
                data: await block.get()
            }, block);
            this.addBlockUpdate(parent);
        }
        else {
            if (typeof at == 'undefined')
                this.views.push(block);
            else this.views.splice(at, 0, block);
            await block.created();
            this.snapshoot.record(OperatorDirective.$create, {
                pos: block.pos,
                data: await block.get()
            }, block);
            this.addPageUpdate();
        }
        return block;
    }
    async onCreateTailTextSpan(this: Page) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.onAction(ActionDirective.onCreateTailTextSpan, async () => {
                    var panel = this.views[0];
                    var lastBlock = panel.findReverse(g => g.isBlock);
                    var newBlock: Block;
                    if (lastBlock && lastBlock.parent == panel) {
                        newBlock = await this.createBlock(BlockUrlConstant.TextSpan, {}, lastBlock.parent, lastBlock.at + 1);
                    }
                    else {
                        newBlock = await this.createBlock(BlockUrlConstant.TextSpan, {}, this.views.last());
                    }
                    newBlock.mounted(() => {
                        this.kit.writer.cursor.onFocusBlockAnchor(newBlock, { last: true, render: true, merge: true });
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
            if (this.kit.picker.blocks.some(s => blocks.some(c => c == s))) {
                this.kit.picker.blocks.removeAll(s => blocks.includes(s));
                if (this.kit.picker.blocks.length == 0) {
                    this.kit.picker.onCancel();
                }
                else this.kit.picker.onRePicker();
            }
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
                    await block.updateProps({ content: '' });
                }
                var cs = willCombineBlock.childs.map(c => c);
                await cs.eachAsync(async (c) => {
                    await block.append(c)
                })
            }
            else {
                if (block.content && block.childs.length == 0) {
                    await this.createBlock(BlockUrlConstant.Text, { content: block.content }, block, 0);
                    await block.updateProps({ content: '' });
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
    onBlurAnchor(this: Page, anchor: AppearAnchor) {
        if (anchor.block) {
            anchor.block.blurAnchor(anchor);
        }
        this.emit(PageDirective.blurAnchor, anchor);
    }
    onFocusAnchor(this: Page, anchor: AppearAnchor) {
        if (anchor.block) {
            anchor.block.focusAnchor(anchor);
        }
        this.emit(PageDirective.focusAnchor, anchor);
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
            else await this.onClickBatchBlocksContextMenu(blocks, re.item, re.event)
        }
    }
    async onClickBatchBlocksContextMenu(this: Page, blocks: Block[], item: MenuItem<BlockDirective | string>, event: MouseEvent) {
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
    async onOpenNav(this: Page, d: { nav: boolean }) {
        this.onAction('onOpenNav', async () => {
            this.updateProps({ nav: d.nav });
            if (this.requireSelectLayout == true) {
                this.updateProps({ requireSelectLayout: false, 'pageLayout.type': PageLayoutType.doc });
            }
            if (d.nav == false) {
                if (this.views.length > 1)
                    await this.views[1].delete()
            }
            else {
                await this.createBlock(BlockUrlConstant.View,
                    {
                        url: BlockUrlConstant.View,
                        blocks: { childs: [{ url: BlockUrlConstant.Outline }] }
                    },
                    undefined,
                    undefined,
                    undefined
                )
            }
        })
        this.forceUpdate();
    }
    async onOpenRefPages(this: Page, d: { refPages: boolean }) {
        await this.onAction('onOpenNav', async () => {
            this.updateProps({ autoRefPages: d.refPages });
            if (this.requireSelectLayout == true) {
                this.updateProps({ requireSelectLayout: false, 'pageLayout.type': PageLayoutType.doc });
            }
            if (d.refPages == false) {
                var r = this.views.find(g => g.url == BlockUrlConstant.RefLinks);
                if (r) await r.delete()
            }
            else {
                var view = this.views[0];
                await this.createBlock(BlockUrlConstant.RefLinks, { url: BlockUrlConstant.RefLinks }, view, view.childs.length, 'childs');
            }
        })
        this.forceUpdate();
    }
}