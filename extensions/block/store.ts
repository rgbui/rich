import { EmojiSrcType } from "../../blocks/general/emoji";
import { Block } from "../../src/block";
import { Rect } from "../../src/common/point";
import { Events } from "../../util/events";
import { util } from "../../util/util";
import { OpenEmoji } from "../emoji";
import { OpenTableStoreSelector } from "../tablestore";
import { BlockGroup, BlockSelectorItem, BlockSelectorOperator } from "./delcare";
class BlockStore extends Events {
    constructor() {
        super();
        this.import();
    }
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
    findAllBlocks(label: string): BlockSelectorItem[] {
        var cs: BlockSelectorItem[] = [];
        var fs = this.findAll(label);
        fs.each(c => {
            cs.addRange(c.childs);
        });
        return cs;
    }
    findFitTurnBlocks(block: Block): BlockSelectorItem[] {
        var cs: BlockSelectorItem[] = [];
        this._blockGroups.each(bg => {
            bg.childs.each(c => {
                cs.push(c);
            })
        });
        return cs;
    }
    async open(operator: BlockSelectorOperator, rect: Rect) {
        var extra: Record<string, any> = {};
        switch (operator) {
            case BlockSelectorOperator.createTable:
                var re = await OpenTableStoreSelector(rect);
                if (re) {
                    extra.initialInformation = util.clone(re);
                }
                break;
            case BlockSelectorOperator.selectEmoji:
                var result = await OpenEmoji(rect);
                if (result) {
                    extra.src = { mime: 'emoji', code: result.code } as EmojiSrcType;
                }
                break;
        }
        return extra;
    }
}
export var blockStore = new BlockStore();