
import { Block } from "..";
import { util } from "../../../util/util";
import { OperatorDirective } from "../../history/declare";
import { DropDirection } from "../../kit/handle/direction";
import { BlockUrlConstant } from "../constant";
import { Col } from "../element/col";
import { BlockRenderRange } from "../enum";
import lodash from 'lodash';
import { AppearAnchor } from "../appear";
import { Matrix } from "../../common/matrix";
import { Point } from "../../common/vector/point";
import { BlockFactory } from "../factory/block.factory";

export class Block$Operator {
    /***
     * 彻底的删除元素
     */
    async delete(this: Block) {
        var pbs = this.parentBlocks;
        if (Array.isArray(pbs) && pbs.exists(g => g === this)) {
            this.page.snapshoot.record(OperatorDirective.$delete, {
                pos: this.pos,
                data: await this.get()
            }, this);
            pbs.remove(this);
            if (pbs.length > 0) {
                if (this.parent && this.parent.isRow && !this.parent.isPart) {
                    var sum = pbs.sum(pb => (pb as any).widthPercent || 100);
                    await pbs.eachAsync(async (pb) => {
                        await pb.updateProps({ widthPercent: ((pb as any).widthPercent || 100) * 100 / sum })
                    })
                }
            }
            if (this.parent) {
                this.page.addBlockUpdate(this.parent);
                this.page.addBlockClearLayout(this.parent);
                delete this.parent;
            }
        }
    }
    async getWillTurnData(this: Block, url: string) {
        return await this.get();
    }
    async turn(this: Block, url: string) {
        var oldUrl = this.url;
        var data = await this.getWillTurnData(url);
        var newBlock = await BlockFactory.createBlock(url, this.page, data, this.parent);
        var bs = this.parent.blocks[this.parentKey];
        bs.insertAt(this.at, newBlock);
        bs.remove(g => g == this);
        newBlock.id = this.id;
        this.page.addBlockUpdate(newBlock.parent);
        this.page.snapshoot.record(OperatorDirective.$turn, {
            pos: newBlock.pos,
            from: oldUrl,
            to: url
        }, this);
        return newBlock;
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
                    await col.updateProps({ widthPercent: (col as Col).widthPercent * 100 / sum })
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
    }
    async insertBefore(this: Block, to: Block, childsKey?: string) {
        await to.parent.append(this,
            to.at,
            childsKey || to.parent.childKey
        );
    }
    async insertAfter(this: Block, to: Block, childsKey?: string) {
        await to.parent.append(this,
            to.at + 1,
            childsKey || to.parent.childKey
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
            pbs.remove(this);
            if (pbs.length > 0) {
                if (this.parent.isRow && !this.parent.isPart) {
                    var sum = pbs.sum(pb => (pb as any).widthPercent || 100);
                    await pbs.eachAsync(async (pb) => {
                        await pb.updateProps({ widthPercent: ((pb as any).widthPercent || 100) * 100 / sum })
                    })
                }
            }
            this.page.addBlockUpdate(this.parent);
            this.page.addBlockClearLayout(this.parent);
            delete this.parent;
        }
    }
    async append(this: Block, block: Block, at?: number, childKey?: string) {
        if (typeof childKey == 'undefined') childKey = 'childs';
        if (!this.allBlockKeys.some(s => s == childKey)) {
            throw 'not append the block support subkey';
        }
        var bs = this.blocks[childKey];
        if (typeof at == 'undefined') at = bs.length;
        if (block.parent && bs.exists(block) && block.at < at) {
            at -= 1;
        }
        var from = block.pos;
        await block.remove();
        bs.insertAt(at, block);
        block.parent = this;
        this.page.snapshoot.record(OperatorDirective.$move, {
            from,
            to: this.pos
        }, this);
        this.page.addBlockUpdate(this);
    }
    async appendBlock(this: Block, blockData: Record<string, any>, at?: number, childKey?: string) {
        if (typeof childKey == 'undefined') childKey = 'childs';
        if (!this.allBlockKeys.some(s => s == childKey)) {
            throw 'not append the block support subkey';
        }
        var bs = this.blocks[childKey];
        if (typeof at == 'undefined') at = bs.length;
        var newBlock = await this.page.createBlock(blockData.url, blockData, this, at, childKey);
        return newBlock;
    }
    async appendArray(this: Block, blocks: Block[], at?: number, childKey?: string) {
        if (typeof childKey == 'undefined') childKey = 'childs';
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
    async appendArrayBlockData(this: Block, blocks: Record<string, any>[], at?: number, childKey?: string) {
        if (typeof childKey == 'undefined') childKey = 'childs';
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
     * 注意元素移到to元素下面，并非简单的append，
     * 例如 将一个元素移到一个并排的元素下面时，需要主动的创建一个col，如果当前元素没有col容器时
     * @param to 
     * @param direction 
     */
    async move(this: Block, to: Block, direction: DropDirection) {
        var self = this;
        switch (direction) {
            case DropDirection.bottom:
            case DropDirection.top:
                var row = to.closest(x => x.isBlock);
                var childsKey = 'childs';
                if (row.parent.url == BlockUrlConstant.List) {
                    childsKey = 'subChilds';
                }
                if (direction == DropDirection.bottom) {
                    await row.parent.append(this, row.at + 1, childsKey);
                }
                else {
                    await row.parent.append(this, row.at, childsKey);
                }
                break;
            case DropDirection.left:
                if (to.isCol || to.parent.isCol) {
                    var col = to.isCol ? to : to.parent;
                    var sum = col.childs.sum(x => (x as Col).widthPercent);
                    var r = Math.round(100 / (col.childs.length + 1));
                    await col.childs.eachAsync(async (c) => {
                        await c.updateProps({ widthPercent: ((c as Col).widthPercent / sum) * (100 - r) })
                    })
                    var newCol = await this.page.createBlock(BlockUrlConstant.Col, { widthPercent: r }, col.parent, col.at);
                    await newCol.append(this);
                }
                else {
                    var newRow = await this.page.createBlock(BlockUrlConstant.Row, {
                        blocks: {
                            childs: [
                                { url: BlockUrlConstant.Col, widthPercent: 50 },
                                { url: BlockUrlConstant.Col, widthPercent: 50 }
                            ]
                        }
                    }, to.parent, to.at)
                    await newRow.childs.first().append(this);
                    await newRow.childs.last().append(to);
                }
                /**
                 * 这里新增一个元素，需要调整当前行内的所有元素比例
                 */
                break;
            case DropDirection.right:
                if (to.isCol || to.parent.isCol) {
                    var col = to.isCol ? to : to.parent;
                    var sum = col.childs.sum(x => (x as Col).widthPercent);
                    var r = Math.round(100 / (col.childs.length + 1));
                    await col.childs.eachAsync(async (c) => {
                        await c.updateProps({ widthPercent: ((c as Col).widthPercent / sum) * (100 - r) })
                    })
                    var newCol = await this.page.createBlock(BlockUrlConstant.Col, { widthPercent: r }, col.parent, col.at + 1);
                    await newCol.append(this);
                }
                else {
                    var newRow = await this.page.createBlock(BlockUrlConstant.Row, {
                        blocks: {
                            childs: [
                                { url: BlockUrlConstant.Col, widthPercent: 50 },
                                { url: BlockUrlConstant.Col, widthPercent: 50 }
                            ]
                        }
                    }, to.parent, to.at)
                    await newRow.childs.first().append(to);
                    await newRow.childs.last().append(this);
                }
                /**
                * 这里新增一个元素，需要调整当前行内的所有元素比例
                */
                break;
            case DropDirection.inner:
                /**这时判断是否可以允许换行的block，还是替换 */
                var old = to;
                await to.parent.append(this, old.at);
                await old.delete();
                break;
            case DropDirection.sub:
                await to.acceptSubFromMove(this);
                break;
        }
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
                var childsKey = row.parent.childKey;
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
                        await c.updateProps({ widthPercent: ((c as Col).widthPercent / sum) * (100 - r) })
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
                        await c.updateProps({ widthPercent: ((c as Col).widthPercent / sum) * (100 - r) })
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
                var cs = this.childs.map(c => c);
                await this.appendArray(blocks);
                await cs.eachAsync(async (c) => {
                    await c.delete()
                })
                break;
            case DropDirection.sub:
                for (let i = blocks.length - 1; i >= 0; i--) {
                    await this.acceptSubFromMove(blocks[i]);
                }
                break;
        }
    }
    async dropBlockDatas(this: Block, blocks: Record<string, any>[], direction: DropDirection) {
        if (blocks.some(s => s.isLine)) throw 'line blokc is not drop';
        switch (direction) {
            case DropDirection.bottom:
            case DropDirection.top:
                var row = this.closest(x => x.isBlock);
                var childsKey = row.parent.childKey;
                if (direction == DropDirection.bottom) {
                    await row.parent.appendArrayBlockData(blocks, row.at + 1, childsKey);
                }
                else {
                    await row.parent.appendArrayBlockData(blocks, row.at, childsKey);
                }
                break;
            case DropDirection.left:
                if (this.isCol || this.parent.isCol) {
                    var col = this.isCol ? this : this.parent;
                    var sum = col.childs.sum(x => (x as Col).widthPercent);
                    var r = Math.round(100 / (col.childs.length + 1));
                    await col.childs.eachAsync(async c => {
                        await c.updateProps({ widthPercent: ((c as Col).widthPercent / sum) * (100 - r) })
                    })
                    var newCol = await this.page.createBlock(BlockUrlConstant.Col, { widthPercent: r }, col.parent, col.at);
                    await blocks.eachAsync(async (block) => {
                        await newCol.appendBlock(block);
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
                        await newRow.childs.first().appendBlock(block);
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
                        await c.updateProps({ widthPercent: ((c as Col).widthPercent / sum) * (100 - r) })
                    });
                    var newCol = await this.page.createBlock(BlockUrlConstant.Col, { widthPercent: r }, col.parent, col.at + 1);
                    await blocks.eachAsync(async (block) => {
                        await newCol.appendBlock(block);
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
                        await newRow.childs.last().appendBlock(block);
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
                var cs = this.childs.map(c => c);
                await this.appendArrayBlockData(blocks);
                await cs.eachAsync(async (c) => {
                    await c.delete()
                })
                break;
            case DropDirection.sub:
                await this.appendArrayBlockData(blocks, 0, this.childKey);
                break;
        }
    }
    /**
     * 表示当前元素如何接收该元素至sub,
     * @param this 
     * @param sub  子元素是要移动的
     */
    async acceptSubFromMove(this: Block, sub: Block) {

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
    async updateProps(this: Block, props: Record<string, any>, range = BlockRenderRange.self) {
        var oldValue: Record<string, any> = {};
        var newValue: Record<string, any> = {};
        for (let prop in props) {
            if (!lodash.isEqual(lodash.get(this, prop), lodash.get(props, prop))) {
                oldValue[prop] = this.clonePropData(prop);
                newValue[prop] = this.clonePropData(prop, lodash.get(props, prop));
                lodash.set(this, prop, this.cloneProp(prop, lodash.get(props, prop)));
            }
        }
        if (Object.keys(oldValue).length > 0 || Object.keys(newValue).length > 0) {
            await this.changeProps(oldValue, newValue);
            this.syncUpdate(range);
            this.page.snapshoot.record(OperatorDirective.$update, {
                pos: this.pos,
                old_value: oldValue,
                new_value: newValue
            }, this);
        }
    }
    async updateMatrix(this: Block, oldMatrix: Matrix, newMatrix: Matrix) {
        this.syncUpdate(BlockRenderRange.self);
        this.matrix = newMatrix;
        this.page.snapshoot.record(OperatorDirective.$update, {
            pos: this.pos,
            old_value: { matrix: oldMatrix.getValues() },
            new_value: { matrix: newMatrix.getValues() },
        }, this);
    }
    /**
     * 子类继承实现
     * @param oldProps 
     * @param newProps 
     */
    async changeProps(oldProps: Record<string, any>, newProps: Record<string, any>) {

    }
    manualUpdateProps(this: Block,
        oldProps: Record<string, any>,
        newProps: Record<string, any>,
        range = BlockRenderRange.self, isOnlyRecord: boolean = false) {
        var oldValue: Record<string, any> = {};
        var newValue: Record<string, any> = {};
        if (isOnlyRecord == true) {
            for (let prop in newProps) {
                oldValue[prop] = this.clonePropData(prop, lodash.get(oldProps, prop));
                newValue[prop] = this.clonePropData(prop, lodash.get(newProps, prop));
                lodash.set(this, prop, this.cloneProp(prop, lodash.get(newProps, prop)))
            }
        }
        else {
            for (let prop in newProps) {
                if (!lodash.isEqual(lodash.get(oldProps, prop), lodash.get(newProps, prop))) {
                    oldValue[prop] = this.clonePropData(prop, lodash.get(oldProps, prop));
                    newValue[prop] = this.clonePropData(prop, lodash.get(newProps, prop));
                    lodash.set(this, prop, this.cloneProp(prop, lodash.get(newProps, prop)));
                }
            }
        }
        if (Object.keys(oldValue).length > 0) {
            this.syncUpdate(range);
            this.page.snapshoot.record(OperatorDirective.$update, {
                pos: this.pos,
                old_value: oldValue,
                new_value: newValue
            }, this);
        }
    }
    updateArrayInsert(this: Block, key: string, at: number, data: any, range = BlockRenderRange.self) {
        if (!Array.isArray(this[key])) this[key] = [];
        this[key].insertAt(at, data);
        this.page.snapshoot.record(OperatorDirective.arrayPropInsert, {
            blockId: this.id,
            propKey: key,
            data: typeof data.get == 'function' ? data.get() : util.clone(data),
            at: at
        }, this);
        this.syncUpdate(range);
    }
    updateArrayRemove(this: Block, key: string, at: number, range = BlockRenderRange.self) {
        var data = this[key][at];
        lodash.remove(this[key], (g, i) => i == at);
        this.page.snapshoot.record(OperatorDirective.arrayPropRemove, {
            blockId: this.id,
            propKey: key,
            data: typeof data.get == 'function' ? data.get() : util.clone(data),
            at: at
        }, this);
        this.syncUpdate(range);
    }
    updateArrayUpdate(this: Block, key: string, at: number, data: any, range = BlockRenderRange.self) {
        var old = this[key][at];
        var oldData = typeof old?.get == 'function' ? old.get() : old;
        var newData = typeof data?.get == 'function' ? data.get() : data;
        if (!util.valueIsEqual(oldData, newData)) {
            this.page.snapshoot.record(OperatorDirective.arrayPropUpdate, {
                blockId: this.id,
                propKey: key,
                old: util.clone(oldData) as Record<string, any>,
                new: util.clone(newData) as Record<string, any>,
                at: at
            }, this);
            this[key][at] = data;
            this.syncUpdate(range);
        }
    }
    syncUpdate(this: Block, range = BlockRenderRange.none) {
        switch (range) {
            case BlockRenderRange.self:
                this.page.addBlockUpdate(this);
                break;
            case BlockRenderRange.parent:
                this.page.addBlockUpdate(this.parent)
                break;
            case BlockRenderRange.none:
                break;
            case BlockRenderRange.page:
                break;
        }
    }
    relativePagePoint(this: Block, point: Point) {
        var rb = this.relativeBlock;
        if (rb) {
            var nb = rb.matrix.inverseTransform(point);
            return rb.relativePagePoint(nb);
        }
        else return point;
    }
}