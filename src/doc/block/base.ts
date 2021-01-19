import { Events } from "../../util/events";
import { Page } from "../page";
import { BlockFactory } from "./block.factory";
import { BlockClass } from "./declare";

export class BaseBlock extends Events {
    childs: BaseBlock[] = [];
    parent: BaseBlock;
    name: BlockClass;
    page: Page;
    constructor(page: Page) {
        super();
        this.page = page;
    }
    find(predict: (block: BaseBlock) => boolean, considerSelf?: boolean): BaseBlock {
        if (considerSelf == true && predict(this)) return this;
        return this.childs.arrayJsonFind('childs', predict);
    }
    findAll(predict: (block: BaseBlock) => boolean, considerSelf?: boolean): BaseBlock[] {
        var blocks: BaseBlock[] = [];
        if (considerSelf == true && predict(this)) { blocks.push(this) }
        let childBlocks = this.childs.arrayJsonFindAll('childs', predict);
        return blocks.concat(childBlocks);
    }
    closest(predict: (block: BaseBlock) => boolean, ignoreSelf?: boolean) {
        if (ignoreSelf !== true && predict(this)) return this;
        var pa = this.parent;
        while (true) {
            if (pa && predict(pa) == true) return pa;
            else {
                if (!pa) break;
                pa = pa.parent;
            }
        }
    }
    parents(predict: (block: BaseBlock) => boolean, ignoreSelf?: boolean) {
        var blocks: BaseBlock[] = [];
        if (ignoreSelf !== true && predict(this)) blocks.push(this);
        var pa = this.parent;
        while (true) {
            if (!pa) break;
            else if (predict(pa)) blocks.push(pa);
            pa = pa.parent;
        }
        return blocks;
    }
    get at() {
        if (this.parent)
            return this.parent.childs.findIndex(x => x === this);
    }
    get prev(): BaseBlock {
        var at = this.at;
        if (at > 0 && this.parent) return this.parent.childs[at - 1];
    }
    get next(): BaseBlock {
        var at = this.at;
        if (this.parent && at < this.parent.childs.length - 1) return this.parent.childs[at + 1];
    }
    async load(data) {
        try {
            for (var n in data) {
                if (n == 'childs') continue;
                this[n] = data[n];
            }
            if (Array.isArray(data.childs)) {
                for (var i = 0; i < data.childs.length; i++) {
                    var dc = data.childs[i];
                    var block = BlockFactory.createBlock(dc.name, this.page);
                    await block.load(dc);
                    this.childs.push(block);
                }
            }
        }
        catch (err) {

        }
    }
    async get() {

    }
}