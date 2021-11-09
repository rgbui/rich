import { Block } from "..";
import { util } from "../../../util/util";
import { OperatorDirective } from "../../history/declare";
import { DropDirection } from "../../kit/handle/direction";
import { BlockUrlConstant } from "../constant";
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
            this.page.onAddUpdate(this.parent);
            await this.parent.layoutCollapse();
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
            this.page.onAddUpdate(this.parent);
            await this.parent.layoutCollapse();
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
        async function clearOneColOrRow(panel: Block) {
            if (!panel.isPart && (panel.isRow || panel.isCol) && panel.childs.length == 1) {
                var firstChild = panel.childs.first();
                if (firstChild.isCol || firstChild.isRow) {
                    var c = panel;
                    await firstChild.childs.eachAsync(async child => {
                        await child.insertAfter(c);
                        await clearOneColOrRow(child);
                        c = child;
                    })
                    await panel.delete();
                }
            }
        }
        await clearOneColOrRow(this);
        /**
         * 
         * @param panel 自动删除空row,空col
         */
        async function clearEmptyPanel(panel: Block) {
            if (panel.childs.length == 0) {
                if ((panel.isRow || panel.isCol) && !panel.isPart) {
                    var pa = panel.parent;
                    await panel.delete();
                    if (pa)
                        await clearEmptyPanel(pa);
                }
            }
        }
        await clearEmptyPanel(this);
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
        }
        await block.remove();
        bs.insertAt(at, block);
        block.parent = this;
        this.page.snapshoot.record(OperatorDirective.append, {
            parentId: this.id,
            childKey,
            at,
            prevBlockId: block.prev ? block.prev.id : undefined,
            blockId: block.id
        });
        this.page.onAddUpdate(this);
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
                var row = to.closest(x => x.isRow);
                if (row.childs.length > 1) {
                    var col = await this.page.createBlock(BlockUrlConstant.Col, {
                        blocks: {
                            childs: [
                                { url: BlockUrlConstant.Row },
                                { url: BlockUrlConstant.Row }
                            ]
                        }
                    }, to.parent, to.at);
                    if (direction == DropDirection.bottom) {
                        await col.childs.first().append(to);
                        await col.childs.last().append(self);
                    }
                    else {
                        await col.childs.first().append(self);
                        await col.childs.last().append(to);
                    }
                }
                else {
                    var increse: number = 0;
                    if (direction == DropDirection.bottom) increse = 1;
                    var newRow = await this.page.createBlock(BlockUrlConstant.Row, {},
                        row.parent,
                        row.at + increse);
                    await newRow.append(self);
                }
                break;
            case DropDirection.left:
                await this.insertBefore(to);
                /**
                 * 这里新增一个元素，需要调整当前行内的所有元素比例
                 */
                break;
            case DropDirection.right:
                await this.insertAfter(to);
                /**
                * 这里新增一个元素，需要调整当前行内的所有元素比例
                */
                break;
            case DropDirection.inner:
                break;
            case DropDirection.sub:
                break;
        }
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
                    this.page.onAddUpdate(this);
                    break;
                case BlockRenderRange.parent:
                    this.page.onAddUpdate(this.parent)
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
                this.page.onAddUpdate(this);
                break;
            case BlockRenderRange.parent:
                this.page.onAddUpdate(this.parent)
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