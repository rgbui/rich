import { Events } from "../../src/util/events";
import { BlockGroup, BlockSelectorOperator } from "./delcare";
class BlockStore extends Events {
    private _blockGroups: BlockGroup[];
    async import() {
        if (!Array.isArray(this._blockGroups)) {
            var r = await import("./data");
            this._blockGroups = r.BlockSelectorData;
        }
    }
    findAll(label: string) {
        var bs = this._blockGroups.map(b => {
            return {
                ...b,
                childs: b.childs.findAll(g => g.label.startsWith(label) || g.labels.exists(c => c.startsWith(label)))
            }
        });
        bs.removeAll(g => g.childs.length == 0);
        return bs;
    }
    findAllBlocks(label: string) {
        var cs = [];
        var fs = this.findAll(label);
        fs.each(c => {
            cs.addRange(c.childs);
        });
        return cs;
    }
    async open(operator: BlockSelectorOperator) {
        var extra:Record<string,any>={ };
        switch (operator) {
            case BlockSelectorOperator.createTable:
                break;
            case BlockSelectorOperator.selectEmoji:
                break;
        }
        return extra;
    }
}
export var blockStore = new BlockStore();