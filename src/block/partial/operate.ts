
import { Block } from "..";
import { util } from "../../../util/util";
import { OperatorDirective } from "../../history/declare";
import { DropDirection } from "../../kit/handle/direction";
import { BlockUrlConstant } from "../constant";
import { Col } from "../element/col";
import { BlockRenderRange } from "../enum";

export class Block$Operator {
    /**
    * 移走元素，这个不是删除，
    * 元素更多的是从当前位置移到别一个位置
    * @returns 
    */
    async remove(this: Block) {
        if (!this.parent) return;
        var pbs = this.parentBlocks;
        if (Array.isArray(pbs) && pbs.exists(g => g === this)) {
            this.page.snapshoot.record(OperatorDirective.remove, {
                parentId: this.parent.id,
                childKey: this.parentKey,
                at: this.at,
                preBlockId: this.prev ? this.prev.id : undefined
            });
            pbs.remove(this);
            if (pbs.length > 0) {
                if (this.parent.isRow && !this.parent.isPart) {
                    var sum = pbs.sum(pb => (pb as any).widthPercent || 100);
                    pbs.each(pb => {
                        pb.updateProps({ widthPercent: ((pb as any).widthPercent || 100) * 100 / sum })
                    })
                }
            }
            this.page.addBlockUpdate(this.parent);
            this.page.addBlockClearLayout(this.parent);
            delete this.parent;
        }
    }
    /***
     * 彻底的删除元素
     */
    async delete(this: Block) {
        var pbs = this.parentBlocks;
        if (Array.isArray(pbs) && pbs.exists(g => g === this)) {
            this.page.snapshoot.record(OperatorDirective.delete, {
                parentId: this.parent.id,
                childKey: this.parentKey,
                at: this.at,
                preBlockId: this.prev ? this.prev.id : undefined,
                data: await this.get()
            })
            pbs.remove(this);
            if (pbs.length > 0) {
                if (this.parent.isRow && !this.parent.isPart) {
                    var sum = pbs.sum(pb => (pb as any).widthPercent || 100);
                    pbs.each(pb => {
                        pb.updateProps({ widthPercent: ((pb as any).widthPercent || 100) * 100 / sum })
                    })
                }
            }
            this.page.addBlockUpdate(this.parent);
            this.page.addBlockClearLayout(this.parent);
            delete this.parent;
        }
    }
    async getWillTurnData(this: Block, url: string) {
        return await this.get();
    }
    async turn(this: Block, url: string) {
        var data = await this.getWillTurnData(url);
        var newBlock = await this.page.createBlock(url, data, this.parent, this.at);
        await this.delete();
        return newBlock;
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
        if (this.isRow) {
            var cols = this.childs;
            var sum = cols.sum(x => (x as Col).widthPercent);
            cols.forEach(col => {
                col.updateProps({ widthPercent: (col as Col).widthPercent * 100 / sum })
            })
        }
    }
    async insertBefore(this: Block, to: Block) {
        await to.parent.append(this,
            to.at,
            to.parentKey
        );
    }
    async insertAfter(this: Block, to: Block) {
        await to.parent.append(this,
            to.at + 1,
            to.parentKey
        );
    }
    async append(this: Block, block: Block, at?: number, childKey?: string) {
        if (typeof childKey == 'undefined') childKey = 'childs';
        var bs = this.blocks[childKey];
        if (typeof at == 'undefined') at = bs.length;
        if (block.parent && bs.exists(block) && block.at < at) {
            at -= 1;
            bs.remove(g => g == block);
        }
        else {
            await block.remove();
        }
        bs.insertAt(at, block);
        block.parent = this;
        this.page.snapshoot.record(OperatorDirective.append, {
            parentId: this.id,
            childKey,
            at,
            prevBlockId: block.prev ? block.prev.id : undefined,
            blockId: block.id
        });
        this.page.addBlockUpdate(this);
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
                var row = to.closest(x =>x.isBlock);
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
                    col.childs.each(c => {
                        c.updateProps({ widthPercent: ((c as Col).widthPercent / sum) * (100 - r) })
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
                    col.childs.each(c => {
                        c.updateProps({ widthPercent: ((c as Col).widthPercent / sum) * (100 - r) })
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
     * 表示当前元素如何接收该元素至sub,
     * @param this 
     * @param sub  子元素是要移动的
     */
    async acceptSubFromMove(this: Block, sub: Block) {

    }
    updateProps(this: Block, props: Record<string, any>, range = BlockRenderRange.self) {
        var oldValue: Record<string, any> = {};
        var newValue: Record<string, any> = {};
        for (let prop in props) {
            if (!util.valueIsEqual(this[prop], props[prop])) {
                oldValue[prop] = util.clone(this[prop]);
                newValue[prop] = util.clone(props[prop]);
                this[prop] = util.clone(props[prop]);
            }
        }
        if (Object.keys(oldValue).length > 0) {
            switch (range) {
                case BlockRenderRange.self:
                    this.page.addBlockUpdate(this);
                    break;
                case BlockRenderRange.parent:
                    this.page.addBlockUpdate(this.parent)
                    break;
                case BlockRenderRange.none:
                    break;
            }
            this.page.snapshoot.record(OperatorDirective.updateProp, {
                blockId: this.id,
                old: oldValue,
                new: newValue
            });
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
        });
        this.syncUpdate(range);
    }
    updateArrayRemove(this: Block, key: string, at: number, range = BlockRenderRange.self) {
        var data = this[key][at];
        this.page.snapshoot.record(OperatorDirective.arrayPropRemove, {
            blockId: this.id,
            propKey: key,
            data: typeof data.get == 'function' ? data.get() : util.clone(data),
            at: at
        });
        this.syncUpdate(range);
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
        }
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
            });
            this[key][at] = data;
            this.syncUpdate(range);
        }
    }
}