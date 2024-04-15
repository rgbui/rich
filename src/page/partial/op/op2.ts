import lodash from "lodash";
import { Page } from "../..";
import { Block } from "../../../block";
import { AppearAnchor } from "../../../block/appear";
import { BlockChildKey, BlockUrlConstant } from "../../../block/constant";
import { BlockFactory } from "../../../block/factory/block.factory";
import { OperatorDirective, ActionDirective } from "../../../history/declare";
import { DropDirection } from "../../../kit/handle/direction";
import { PageDirective } from "../../directive";
import { util } from "echarts";
import { TableSchema } from "../../../../blocks/data-grid/schema/meta";
import { Title } from "../../../../blocks/interaction/title";
import { channel } from "../../../../net/channel";
import { ElementType } from "../../../../net/element.type";

export class Page$Operator2 {
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
        await this.onNotifyCreateBlock(block);
        if (parent) {
            if (typeof childKey == 'undefined') childKey = block.isLine ? BlockChildKey.childs : (parent?.hasSubChilds ? BlockChildKey.subChilds : BlockChildKey.childs);
            if (!parent.allBlockKeys.some(s => s == childKey)) {
                console.error(`${parent.url} not support childKey:${childKey}`);
                childKey = parent.allBlockKeys[0];
            }
            var bs = parent.blocks[childKey];
            if (!Array.isArray(bs)) parent.blocks[childKey] = bs = [];
            if (typeof at == 'undefined' || at == -1) at = bs.length;
            bs.insertAt(at, block);
            await block.created();
            this.snapshoot.record(OperatorDirective.$create, {
                pos: block.pos,
                data: await block.get()
            }, block);
            this.monitorBlockOperator(block, 'create');
            this.addBlockUpdate(parent);
            this.addBlockChange(block);
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
            this.monitorBlockOperator(block, 'create');
            this.addPageUpdate();
        }
        await block.loadSyncBlock();
        return block;
    }
    async onCreateTailTextSpan(this: Page, panel?: Block) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.onAction(ActionDirective.onCreateTailTextSpan, async () => {
                    panel = panel || this.views[0];
                    var lastBlock = panel.findReverse(g => g.isBlock);
                    var newBlock: Block;
                    if (lastBlock && lastBlock.parent == panel) {
                        newBlock = await this.createBlock(BlockUrlConstant.TextSpan, {}, lastBlock.parent, lastBlock.at + 1);
                    }
                    else {
                        newBlock = await this.createBlock(BlockUrlConstant.TextSpan, {}, panel);
                    }
                    newBlock.mounted(() => {
                        this.kit.anchorCursor.onFocusBlockAnchor(newBlock, { last: true, render: true, merge: true });
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
        blocks = blocks.toArray(c => c);
        lodash.remove(blocks, c => c.url == BlockUrlConstant.Title);
        if (blocks.length > 0)
            await this.onAction(ActionDirective.onBatchDeleteBlocks, async () => {
                var pre = blocks.first().prevFind(c => c.isVisible && !blocks.includes(c) && !blocks.some(s => s.exists(g => g.id == c.id)) && c.isBlock);
                if (!pre) blocks.first().nextFind(c => c.isVisible && !blocks.includes(c) && !blocks.some(s => s.exists(g => g.id == c.id)) && c.isBlock);
                if (pre) {
                    this.kit.anchorCursor.focusBlockAnchor(pre, { last: true, render: true })
                }
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
    async onTurn(this: Page, block: Block, url: string, callback: (newBlock: Block, oldBlock: Block) => void) {
        await this.onAction(ActionDirective.onTurn, async () => {
            var oldBlock = block;
            var newBlock = await block.turn(url);
            callback(newBlock, oldBlock);
        });
    }
    async onReplace(this: Page, block: Block, blockData: (Record<string, any> | Block) | ((Record<string, any> | Block)[]), action?: (block: Block) => Promise<void>) {
        if (!Array.isArray(blockData)) blockData = [blockData];
        var newBlock: Block = null;
        await this.onAction(ActionDirective.onReplace, async () => {
            if (blockData[0] instanceof Block) newBlock = (await block.replace(blockData as Block[]))[0];
            else newBlock = (await block.replaceDatas(blockData as Record<string, any>[]))[0];
            if (typeof action == 'function') await action(newBlock);
        });
        return newBlock;
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
            if (willCombineBlock.hasSubChilds && willCombineBlock.subChilds.length > 0) {
                if (block.hasSubChilds) {
                    await block.appendArray(willCombineBlock.subChilds, undefined, BlockChildKey.subChilds)
                }
                else {
                    await block.parent.appendArray(willCombineBlock.subChilds, block.at + 1, block.parent.hasSubChilds ? BlockChildKey.subChilds : BlockChildKey.childs)
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
            if (this.keyboardPlate.isAlt()) {
                var blockDatas = await blocks.asyncMap(async b => b.cloneData());
                var bs = await to.dropBlockDatas(blockDatas, direction);
                this.addUpdateEvent(async () => {
                    this.kit.anchorCursor.onSelectBlocks(bs, { render: true, merge: true });
                })
            }
            else {
                await to.drop(blocks, direction);
                this.addUpdateEvent(async () => {
                    this.kit.anchorCursor.onSelectBlocks(blocks, { render: true, merge: true });
                })
            }
        })
    }
    async onBatchDragCreateBlocks(this: Page, blocks: any[], to: Block, direction: DropDirection) {
        /**
        * 就是将blocks append 到to 下面
        */
        await this.onAction(ActionDirective.onBatchDragBlockDatas, async () => {
            await to.dropBlockDatas(blocks, direction);
        })
    }

    async updateProps(this: Page, props: Record<string, any>) {
        var oldValue: Record<string, any> = {};
        var newValue: Record<string, any> = {};
        for (let prop in props) {
            if (!lodash.isEqual(lodash.get(this, prop), lodash.get(props, prop))) {
                oldValue[prop] = util.clone(lodash.get(this, prop));
                newValue[prop] = util.clone(lodash.get(props, prop));
                lodash.set(this, prop, util.clone(lodash.get(props, prop)));
            }
        }
        if (Object.keys(oldValue).length > 0 || Object.keys(newValue).length > 0) {
            this.snapshoot.record(OperatorDirective.pageUpdateProp, {
                old: oldValue,
                new: newValue
            }, this);
        }
    }
    async onUpdateProps(this: Page, props: Record<string, any>, isUpdate?: boolean, callback?: () => void) {
        await this.onAction(ActionDirective.onPageUpdateProps, async () => {
            await this.updateProps(props);
            if (typeof callback == 'function') callback();
            if (isUpdate) this.addPageUpdate();
        });
    }
    async onUpdatePageData(this: Page, data: Record<string, any>) {
        for (let n in data) {
            if (lodash.isUndefined(data[n])) {
                delete data[n];
            }
        }
        if ([
            ElementType.SchemaData,
            ElementType.SchemaRecordView,
            ElementType.SchemaView
        ].includes(this.pe.type) && !this.isSchemaRecordViewTemplate) {
            data.title = data.text;
            delete data.text;
            Object.assign(this.formRowData, data);
            this.forceUpdate();
            this.view.pageBar?.forceUpdate();
            var tb = this.find(c => c.url == BlockUrlConstant.Title);
            if (tb) {
                await (tb as Title).loadPageInfo();
                tb.forceUpdate()
            }
            if (this.pe.type == ElementType.SchemaData) {
                if (!this.openPageData?.pre && this.formRowData?.id) {
                    await this.schema.rowUpdate({ dataId: this.formRowData?.id, data: this.formRowData })
                }
            }
        }
        else if (this.isSchemaRecordViewTemplate) {

            var sr = this.schema.views.find(g => g.id == this.pe.id1);
            if (sr) {
                await this.schema.onSchemaOperate([{
                    name: 'updateSchemaView',
                    data: data,
                    id: this.pe.id1,
                }])
                this.forceUpdate();
            }
        }
        else {
            if (this.pe.type == ElementType.Schema) {
                var schema = await TableSchema.loadTableSchema(this.pe.id, this.ws);
                var props = lodash.pick(data, ['icon', 'description', 'text'])
                if (schema && Object.keys(props).length > 0)
                    schema.update(props)
            }
            channel.air('/page/update/info', {
                elementUrl: this.elementUrl,
                pageInfo: data
            })
        }
    }
}