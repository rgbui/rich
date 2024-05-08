
import { Block } from "..";
import { OperatorDirective } from "../../history/declare";
import { DropDirection } from "../../kit/handle/direction";
import { BlockChildKey, BlockUrlConstant, ParseBlockUrl } from "../constant";
import { Col } from "../element/col";
import { BlockRenderRange } from "../enum";
import lodash from 'lodash';
import { AppearAnchor } from "../appear";
import { Matrix } from "../../common/matrix";
import { BlockFactory } from "../factory/block.factory";
import { Tab } from "../../../blocks/layout/tab";
import { channel } from "../../../net/channel";

export class Block$Operator {
    isDeleted(this: Block) {
        return this.closest(x => x.deleted == true) ? true : false
    }
    /**
     * 标记块是被删除的
     */
    deleted: boolean
    /***
     * 彻底的删除元素
     */
    async delete(this: Block) {
        var pbs = this.parentBlocks;
        if (Array.isArray(pbs) && pbs.exists(g => g === this)) {
            try {
                await this.page.monitorBlockOperator(this, 'delete');
            }
            catch (ex) {
                this.page.onError(ex)
            }
            await this.page.onNotifyEditBlock(this);
            this.needUpdate = true;
            this.page.snapshoot.record(OperatorDirective.$delete, {
                pos: this.pos,
                data: await this.get()
            }, this);
            lodash.remove(pbs, g => g === this);
            this.deleted = true;
            if (pbs.length > 0) {
                if (this.parent && this.parent.isRow && !this.parent.isPart) {
                    var sum = pbs.sum(pb => (pb as any).widthPercent || 100);
                    await pbs.eachAsync(async (pb) => {
                        await pb.updateProps({ widthPercent: ((pb as any).widthPercent || 100) * 100 / sum }, BlockRenderRange.self)
                    })
                }
            }
            if (this.parent) {
                this.page.notifyActionBlockUpdate(this.parent);
                this.page.notifyActionBlockResetLayout(this.parent);
                this.page.notifyActionBlockSync(this.parent);
                if (this.parent?.url == BlockUrlConstant.Mind) {
                    var parent = this.parent;
                    this.page.addActionCompletedEvent(async () => {
                        (parent as any).renderAllMinds();
                    })
                }
                delete this.parent;
            }
        }
    }
    async getWillTurnData(this: Block, url: string) {
        return await this.get();
    }
    async turn(this: Block, url: string, da?: Record<string, any>) {
        var oldUrl = this.getUrl();
        this.page.monitorBlockOperator(this, 'turn');
        if (this.url == BlockUrlConstant.Head && url.startsWith(BlockUrlConstant.Head)) {
            //这里只是大标题的切换，不需要做任何的处理，更新一些属性即可
            var pb = ParseBlockUrl(url);
            await this.updateProps(pb.data.level ? Object.assign(pb.data, da || {}) : { level: 'h1', ...(da || {}) }, BlockRenderRange.self);
            this.page.monitorBlockOperator(this, 'turn');
            return this;
        }
        if (this.url == BlockUrlConstant.List && url.startsWith(BlockUrlConstant.List)) {
            var pb = ParseBlockUrl(url);
            await this.updateProps(pb.data.listType ? Object.assign(pb.data, da || {}) : { listType: 0, ...(da || {}) }, BlockRenderRange.self);
            return this;
        }
        else if (url == BlockUrlConstant.Link) {
            var content = (await this.getPlain()) || '';
            content = content.slice(0, content.indexOf('\n') > -1 ? content.indexOf('\n') : content.length);
            var r = await channel.air('/page/create/sub', {
                pageId: this.page.pageInfo?.id,
                text: content
            });
            if (r) {
                da = Object.assign(da || {}, { link: { name: 'page', pageId: r.id } })
            }
        }
        /**
         * 这里可能会存在自转换 
         */
        if (this.url == url) return this;

        var data = await this.getWillTurnData(url);
        if (da) data = Object.assign(data || {}, da);
        var newBlock = await BlockFactory.createBlock(url, this.page, data, this.parent);
        await this.page.onNotifyCreateBlock(newBlock);
        var bs = this.parent.blocks[this.parentKey];
        bs.insertAt(this.at, newBlock);
        bs.remove(g => g == this);
        newBlock.id = this.id;
        newBlock.needUpdate = true;
        this.page.monitorBlockOperator(newBlock, 'turn');
        this.page.notifyActionBlockUpdate(newBlock.parent);
        await this.page.onNotifyEditBlock(this);
        this.page.snapshoot.record(OperatorDirective.$turn, {
            pos: newBlock.pos,
            from: oldUrl,
            to: url
        }, this);
        return newBlock;
    }
    async replace(this: Block, newBlock: Block[]) {
        var at = this.at;
        var pk = this.parentKey;
        await this.parent.appendArray(newBlock, at, pk);
        await this.delete()
        return newBlock;
    }
    async replaceDatas(this: Block, blockData: Record<string, any>[]) {
        var at = this.at;
        var pk = this.parentKey;
        var newBlocks = await this.parent.appendArrayBlockData(blockData, at, pk);
        await this.delete();
        return newBlocks;
    }
    async clearEmptyBlock(this: Block) {
        var c = this.closest(x => x.isBlock);
        if (c.isContentEmpty) {
            await c.delete()
        }
        else {
            var rs: Block[] = [];

            c.eachReverse(g => {
                if (g.isContentEmpty) {
                    rs.push(g);
                }
            })
            await rs.eachAsync(async r => await r.delete())
        }
    }
    /***
     * 移出元素或是彻底的删除元素，这里需要一个向上查换，一个向下查找的过程
     * 1. 如果元素本身是布局的元素，那么此时的布局元结构是空的，那么可能会从里到外依次删除
     * 2. 如果layout里面的元素是这样的 row-col-row-ele（行内仅仅只有一个col时）
     * 需要调成row-ele,其中col-row需要删除
     */
    async layoutCollapse(this: Block) {
        /**
         * 
         * @param panel 自动删除空row,空col
         */
        var sub = this.find(panel => panel.childs.length == 0 && (panel.isRow || panel.isCol) && !panel.isPart, true);
        if (sub) {
            while (true) {
                if (sub) {
                    var pa = sub.parent;
                    if (sub.childs.length == 0) {
                        await sub.delete();
                        sub = pa;
                    }
                    else break;
                }
                else break;
            }
        }
        if (this.isRow && !this.isPart) {
            var cols = this.childs;
            if (cols.length > 1) {
                var sum = cols.sum(x => (x as Col).widthPercent);
                await cols.eachAsync(async (col) => {
                    await col.updateProps({ widthPercent: (col as Col).widthPercent * 100 / sum }, BlockRenderRange.self)
                })
            }
            else if (cols.length == 1) {
                var cs = cols.first().childs.map(c => c);
                var at = this.at;
                for (let i = 0; i < cs.length; i++) {
                    await this.parent.append(cs[i], at + i)
                }
                await this.delete();
            }
        }
        this.page.notifyActionBlockUpdate(this);
    }
    async insertBefore(this: Block, to: Block, childsKey?: string) {
        await to.parent.append(this,
            to.at,
            childsKey
        );
    }
    async insertAfter(this: Block, to: Block, childsKey?: string) {
        await to.parent.append(this,
            to.at + 1,
            childsKey
        );
    }
    /**
    * 移走元素，这个不是删除，
    * 元素更多的是从当前位置移到别一个位置
    * @returns 
    */
    private async remove(this: Block) {
        if (!this.parent) return;
        var pbs = this.parentBlocks;
        if (Array.isArray(pbs) && pbs.exists(g => g === this)) {
            this.needUpdate = true;
            pbs.remove(this);
            if (pbs.length > 0) {
                if (this.parent.isRow && !this.parent.isPart) {
                    var sum = pbs.sum(pb => (pb as any).widthPercent || 100);
                    await pbs.eachAsync(async (pb) => {
                        await pb.updateProps({ widthPercent: ((pb as any).widthPercent || 100) * 100 / sum }, BlockRenderRange.self)
                    })
                }
            }
            this.page.notifyActionBlockUpdate(this.parent);
            this.page.notifyActionBlockResetLayout(this.parent);
            delete this.parent;
        }
    }
    async append(this: Block, block: Block, at?: number, childKey?: string) {
        if (typeof childKey == 'undefined') {
            if (block.isLine)
                childKey = BlockChildKey.childs;
            else {
                if (this.hasSubChilds) childKey = BlockChildKey.subChilds
                else childKey = BlockChildKey.childs;
            }
        }
        if (!this.allBlockKeys.some(s => s == childKey)) {
            throw 'not append the block support subkey';
        }
        var bs = this.blocks[childKey];
        if (typeof at == 'undefined') at = bs.length;
        if (block.parent && bs.exists(block) && block.at < at) {
            at -= 1;
        }
        var from = block.pos;
        this.page.monitorBlockOperator(block.parent, 'from', block);
        this.page.notifyActionBlockSync(block.parent);
        await block.remove();
        bs.insertAt(at, block);
        block.parent = this;
        this.page.monitorBlockOperator(block.parent, 'to', block);
        this.page.notifyActionBlockSync(block.parent);
        await this.page.onNotifyEditBlock(this);
        this.page.snapshoot.record(OperatorDirective.$move, {
            from,
            to: block.pos
        }, this);
        this.page.notifyActionBlockUpdate(this);
    }
    async appendBlock(this: Block, blockData: Record<string, any>, at?: number, childKey?: string) {
        var newBlock = await this.page.createBlock(blockData.url, blockData, this, at, childKey);
        return newBlock;
    }
    async appendArray(this: Block, blocks: Block[], at?: number, childKey?: string) {
        if (typeof childKey == 'undefined') {
            if (blocks.first().isLine) childKey = BlockChildKey.childs;
            else {
                if (this.hasSubChilds) childKey = BlockChildKey.subChilds;
                else childKey = BlockChildKey.childs;
            }
        }
        var bs = this.blocks[childKey];
        if (typeof at == 'undefined') at = bs.length;
        var b;
        for (let i = 0; i < blocks.length; i++) {
            var bb = blocks[i];
            if (i == 0) {
                await this.append(bb, at, childKey);
                b = bb;
            }
            else {
                await this.append(bb, b.at + 1, childKey);
                b = bb;
            }
        }
    }
    /**
     * childKey不能为空
     * @param this 
     * @param blocks 
     * @param at 
     * @param childKey 
     * @returns 
     */
    async appendArrayBlockData(this: Block, blocks: Record<string, any>[], at: number, childKey: string) {
        if (!this.allBlockKeys.some(s => s == childKey)) {
            throw 'not append the block support subkey';
        }
        var bs = this.blocks[childKey];
        if (typeof at == 'undefined') at = bs.length;
        var b;
        var cs: Block[] = [];
        for (let i = 0; i < blocks.length; i++) {
            var bb = blocks[i];
            if (i == 0) {
                b = await this.appendBlock(bb, at, childKey);
                cs.push(b);
            }
            else {
                b = await this.appendBlock(bb, b.at + 1, childKey);
                cs.push(b);
            }
        }
        return cs;
    }
    /**
     * 在当前集合中移动元素
     * @param this 
     * @param at 
     * @returns 
     */
    async move(this: Block, at: number) {
        var currentAt = this.at;
        if (currentAt == at) return;
        var from = this.pos;
        var ps = this.parentBlocks;
        ps.move(this, at);
        this.needUpdate = true;
        await this.page.onNotifyEditBlock(this);
        this.page.snapshoot.record(OperatorDirective.$move, {
            from,
            to: this.pos
        }, this);
        this.page.notifyActionBlockUpdate(this.parent);
    }
    /**
     * 将一堆blocks拖到this block中
     * @param this 
     * @param blocks 
     * @param direction 
     */
    async drop(this: Block, blocks: Block[], direction: DropDirection) {
        if (blocks.some(s => s.isLine)) throw 'line blokc is not drop';
        switch (direction) {
            case DropDirection.bottom:
            case DropDirection.top:
                var row = this.closest(x => !x.isLine);
                var childsKey = row.parent.hasSubChilds ? BlockChildKey.subChilds : BlockChildKey.childs;
                if (direction == DropDirection.bottom) {
                    await row.parent.appendArray(blocks, row.at + 1, childsKey);
                }
                else {
                    await row.parent.appendArray(blocks, row.at, childsKey);
                }
                break;
            case DropDirection.left:
                if (this.isCol || this.parent.isCol) {
                    var col = this.isCol ? this : this.parent;
                    var sum = col.childs.sum(x => (x as Col).widthPercent);
                    var r = Math.round(100 / (col.childs.length + 1));
                    await col.childs.eachAsync(async c => {
                        await c.updateProps({ widthPercent: ((c as Col).widthPercent / sum) * (100 - r) },BlockRenderRange.self)
                    })
                    var newCol = await this.page.createBlock(BlockUrlConstant.Col, { widthPercent: r }, col.parent, col.at);
                    await blocks.eachAsync(async (block) => {
                        await newCol.append(block);
                    })
                }
                else {
                    var newRow = await this.page.createBlock(BlockUrlConstant.Row, {
                        blocks: {
                            childs: [
                                { url: BlockUrlConstant.Col, widthPercent: 50 },
                                { url: BlockUrlConstant.Col, widthPercent: 50 }
                            ]
                        }
                    }, this.parent, this.at);
                    await blocks.eachAsync(async (block) => {
                        await newRow.childs.first().append(block);
                    })
                    await newRow.childs.last().append(this);
                }
                /**
                 * 这里新增一个元素，需要调整当前行内的所有元素比例
                 */
                break;
            case DropDirection.right:
                if (this.isCol || this.parent.isCol) {
                    var col = this.isCol ? this : this.parent;
                    var sum = col.childs.sum(x => (x as Col).widthPercent);
                    var r = Math.round(100 / (col.childs.length + 1));
                    await col.childs.eachAsync(async c => {
                        await c.updateProps({ widthPercent: ((c as Col).widthPercent / sum) * (100 - r) },BlockRenderRange.self)
                    })
                    var newCol = await this.page.createBlock(BlockUrlConstant.Col, { widthPercent: r }, col.parent, col.at + 1);
                    await blocks.eachAsync(async (block) => {
                        await newCol.append(block);
                    })
                }
                else {
                    var newRow = await this.page.createBlock(BlockUrlConstant.Row, {
                        blocks: {
                            childs: [
                                { url: BlockUrlConstant.Col, widthPercent: 50 },
                                { url: BlockUrlConstant.Col, widthPercent: 50 }
                            ]
                        }
                    }, this.parent, this.at);
                    await blocks.eachAsync(async (block) => {
                        await newRow.childs.last().append(block);
                    })
                    await newRow.childs.first().append(this);
                }
                /**
                * 这里新增一个元素，需要调整当前行内的所有元素比例
                */
                break;
            case DropDirection.inner:
                /**
                 * 这时判断是否可以允许换行的block，还是替换 
                 * */
                var p = this.getInnerPanelBlock();
                var cs = p.childs.map(c => c);
                await p.appendArray(blocks);
                await cs.eachAsync(async (c) => {
                    if (c.isContentEmpty) await c.delete()
                })
                break;
            case DropDirection.sub:
                if (this.hasSubChilds) {
                    await this.appendArray(blocks, 0, BlockChildKey.subChilds)
                }
                else await this.parent.appendArray(blocks, this.at, this.parent.hasSubChilds ? BlockChildKey.subChilds : BlockChildKey.childs)
                break;
        }
    }
    async dropBlockDatas(this: Block, blocks: Record<string, any>[], direction: DropDirection) {
        if (blocks.some(s => s.isLine)) throw 'line blokc is not drop';
        var bs: Block[] = [];
        switch (direction) {
            case DropDirection.bottom:
            case DropDirection.top:
                var row = this.closest(x => x.isBlock);
                var childsKey = row.parent.hasSubChilds ? BlockChildKey.subChilds : BlockChildKey.childs;
                if (direction == DropDirection.bottom) {
                    bs = await row.parent.appendArrayBlockData(blocks, row.at + 1, childsKey);
                }
                else {
                    bs = await row.parent.appendArrayBlockData(blocks, row.at, childsKey);
                }
                break;
            case DropDirection.left:
                if (this.isCol || this.parent.isCol) {
                    var col = this.isCol ? this : this.parent;
                    var sum = col.childs.sum(x => (x as Col).widthPercent);
                    var r = Math.round(100 / (col.childs.length + 1));
                    await col.childs.eachAsync(async c => {
                        await c.updateProps({ widthPercent: ((c as Col).widthPercent / sum) * (100 - r) },BlockRenderRange.self)
                    })
                    var newCol = await this.page.createBlock(BlockUrlConstant.Col, { widthPercent: r }, col.parent, col.at);
                    await blocks.eachAsync(async (block) => {
                        bs.push(await newCol.appendBlock(block));
                    })
                }
                else {
                    var newRow = await this.page.createBlock(BlockUrlConstant.Row, {
                        blocks: {
                            childs: [
                                { url: BlockUrlConstant.Col, widthPercent: 50 },
                                { url: BlockUrlConstant.Col, widthPercent: 50 }
                            ]
                        }
                    }, this.parent, this.at);
                    await blocks.eachAsync(async (block) => {
                        bs.push(await newRow.childs.first().appendBlock(block));
                    })
                    await newRow.childs.last().appendBlock(this);
                }
                /**
                 * 这里新增一个元素，需要调整当前行内的所有元素比例
                 */
                break;
            case DropDirection.right:
                if (this.isCol || this.parent.isCol) {
                    var col = this.isCol ? this : this.parent;
                    var sum = col.childs.sum(x => (x as Col).widthPercent);
                    var r = Math.round(100 / (col.childs.length + 1));
                    await col.childs.eachAsync(async c => {
                        await c.updateProps({ widthPercent: ((c as Col).widthPercent / sum) * (100 - r) },BlockRenderRange.self)
                    });
                    var newCol = await this.page.createBlock(BlockUrlConstant.Col, { widthPercent: r }, col.parent, col.at + 1);
                    await blocks.eachAsync(async (block) => {
                        bs.push(await newCol.appendBlock(block));
                    })
                }
                else {
                    var newRow = await this.page.createBlock(BlockUrlConstant.Row, {
                        blocks: {
                            childs: [
                                { url: BlockUrlConstant.Col, widthPercent: 50 },
                                { url: BlockUrlConstant.Col, widthPercent: 50 }
                            ]
                        }
                    }, this.parent, this.at);
                    await blocks.eachAsync(async (block) => {
                        bs.push(await newRow.childs.last().appendBlock(block));
                    })
                    await newRow.childs.first().append(this);
                }
                /**
                * 这里新增一个元素，需要调整当前行内的所有元素比例
                */
                break;
            case DropDirection.inner:
                /**
                 * 这时判断是否可以允许换行的block，还是替换 
                 * */
                var p = (this as Tab).getInnerPanelBlock();
                if (p) {
                    var cs = p.childs.map(c => c);
                    bs = await p.appendArrayBlockData(blocks, undefined, BlockChildKey.childs);
                    await cs.eachAsync(async (c) => {
                        if (c.isContentEmpty) await c.delete()
                    })
                }
                break;
            case DropDirection.sub:
                if (this.hasSubChilds) bs = await this.appendArrayBlockData(blocks, 0, this.hasSubChilds ? BlockChildKey.subChilds : BlockChildKey.childs);
                else bs = await this.parent.appendArrayBlockData(blocks, this.at, this.parent.hasSubChilds ? BlockChildKey.subChilds : BlockChildKey.childs);
                break;
        }
        return bs;
    }
    async updateAppear(this: Block, appear: AppearAnchor, newValue: string, range = BlockRenderRange.none) {
        await this.updateProps({ [appear.prop]: newValue });
        await this.changeAppear(appear);
    }
    /**
    * 子类继承实现
    * @param oldProps 
    * @param newProps 
    */
    async changeAppear(this: Block, appear: AppearAnchor) {

    }
    async updateProps(this: Block, props: Record<string, any>, range = BlockRenderRange.self, force?: boolean) {
        if (!props || lodash.isObject(props) && Object.keys(props).length == 0) return;
        var oldValue: Record<string, any> = {};
        var newValue: Record<string, any> = {};
        if (typeof props['refLinks'] != 'undefined') {
            if (props['refLinks'] == null) {
                await this.page.monitorBlockOperator(this, 'delete');
            }
        }
        for (let prop in props) {
            if (!(force == true) && !lodash.isEqual(lodash.get(this, prop), lodash.get(props, prop))) {
                oldValue[prop] = await this.clonePropData(prop);
                newValue[prop] = await this.clonePropData(prop, lodash.get(props, prop));
                await this.setPropData(prop, newValue[prop]);
            }
            else {
                oldValue[prop] = await this.clonePropData(prop);
                newValue[prop] = await this.clonePropData(prop, lodash.get(props, prop));
                await this.setPropData(prop, newValue[prop]);
            }
        }
        if (Object.keys(oldValue).length > 0 || Object.keys(newValue).length > 0) {
            if (typeof newValue['content'] != 'undefined' || typeof newValue['refLinks'] != 'undefined') {
                await this.page.monitorBlockOperator(this, 'content');
            }
            await this.changeProps(oldValue, newValue);
            this.page.notifyActionBlockSync(this);
            this.syncUpdate(range);
            for (let n in newValue) {
                /**
                 * 只保留标记@prop 的才record
                 * 部分属性是带有路径的，而_props只记最外层的prop key
                 * 如cardConfig.auto,而_props只有cardConfig
                 */
                if (this.__props.some(p => n == p || n.startsWith(p + "."))) continue
                else { delete newValue[n]; delete oldValue[n] }
            }
            if (Object.keys(newValue).length > 0) {
                var keys = Object.keys(newValue);
                if (!(keys.includes('editor') || keys.includes('editDate')))
                    await this.page.onNotifyEditBlock(this);
                this.page.snapshoot.record(OperatorDirective.$update, {
                    pos: this.pos,
                    old_value: oldValue,
                    new_value: newValue,
                    range
                }, this);
            }
        }
    }
    /**
     * 将textspan中的content转成
     * textspan中childs[content]
     * @param this 
     * @returns 返回text lineblock
     */
    async wrapTextContent(this: Block) {
        var content = this.content;
        await this.updateProps({ content: '' }, BlockRenderRange.self);
        var textBlock = await this.page.createBlock(BlockUrlConstant.Text, { content }, this, 0, 'childs');
        return textBlock;
    }
    async updateMatrix(this: Block, oldMatrix: Matrix, newMatrix: Matrix) {
        this.syncUpdate(BlockRenderRange.self);
        this.matrix = newMatrix;
        this.page.notifyActionBlockSync(this);
        this.page.snapshoot.record(OperatorDirective.$update, {
            pos: this.pos,
            old_value: { matrix: oldMatrix.getValues() },
            new_value: { matrix: newMatrix.getValues() },
            range: BlockRenderRange.self
        }, this);
    }
    onlyUpdateMatrix(this: Block, newMatrix: Matrix) {
        this.matrix = newMatrix;
    }
    /**
     * 子类继承实现
     * @param oldProps 
     * @param newProps 
     */
    async changeProps(oldProps: Record<string, any>, newProps: Record<string, any>) {

    }
    async manualUpdateProps(this: Block,
        oldProps: Record<string, any>,
        newProps: Record<string, any>,
        range = BlockRenderRange.self,
        options?: {
            isOnlyRecord?: boolean,
            isOnlyStore?: boolean
        }
    ) {
        var oldValue: Record<string, any> = {};
        var newValue: Record<string, any> = {};
        if (options?.isOnlyStore == true) {
            newValue = newProps;
            oldValue = oldProps;
        }
        else {
            if (options?.isOnlyRecord == true) {
                for (let prop in newProps) {
                    oldValue[prop] = await this.clonePropData(prop, lodash.get(oldProps, prop));
                    newValue[prop] = await this.clonePropData(prop, lodash.get(newProps, prop));
                    await this.setPropData(prop, newValue[prop])
                }
            }
            else {
                for (let prop in newProps) {
                    if (!lodash.isEqual(lodash.get(oldProps, prop), lodash.get(newProps, prop))) {
                        oldValue[prop] = await this.clonePropData(prop, lodash.get(oldProps, prop));
                        newValue[prop] = await this.clonePropData(prop, lodash.get(newProps, prop));
                        await this.setPropData(prop, newValue[prop])
                    }
                }
            }
        }

        if (Object.keys(oldValue).length > 0) {
            this.syncUpdate(range);
            for (let n in newValue) {
                /**只保留标记@prop 的才record */
                if (this.__props.includes(n)) continue
                else { delete newValue[n]; delete oldValue[n] }
            }
            if (typeof newValue['content'] != 'undefined' || typeof newValue['refLinks'] != 'undefined') {
                this.page.monitorBlockOperator(this, 'content');
            }
            this.page.notifyActionBlockSync(this);
            if (Object.keys(newValue).length > 0)
                this.page.snapshoot.record(OperatorDirective.$update, {
                    pos: this.pos,
                    old_value: oldValue,
                    new_value: newValue,
                    range
                }, this);
        }
    }
    syncUpdate(this: Block, range = BlockRenderRange.none) {
        switch (range) {
            case BlockRenderRange.self:
                this.page.notifyActionBlockUpdate(this);
                break;
            case BlockRenderRange.parent:
                this.needUpdate = true;
                this.page.notifyActionBlockUpdate(this.parent)
                break;
            case BlockRenderRange.none:
                break;
            case BlockRenderRange.page:
                this.page.notifyActionPageUpdate()
                break;
        }
    }
}