
import { Events } from "../../util/events";
import { getBlockSelectData } from "./data";
import { BlockGroup, BlockSelectorItem } from "./delcare";
class BlockStore extends Events {
    constructor() {
        super();
    }
    private _blockGroups: BlockGroup[];
    async import(force?: boolean) {
        if (!Array.isArray(this._blockGroups) || force == true) {
            this._blockGroups = getBlockSelectData();
        }
    }
    find(predict: (data: Record<string, any>) => boolean) {
        var isBreak: boolean = false;
        var d: any;
        this._blockGroups.forEach(bg => {
            bg.childs.forEach(c => {
                var r = predict(c);
                if (r == true) {
                    d = c;
                    isBreak = true;
                }
            })
        });
        return d;
    }
    findAll(label: string) {
        var bs = this._blockGroups.map(b => {
            return {
                ...b,
                childs: b.childs.findAll(g => !label || label && g.text && ('/' + g.text).startsWith(label) || g.label.startsWith(label) || Array.isArray(g.labels) && g.labels.exists(c => c.startsWith(label)))
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
    findFitTurnBlocks(urls: string[]): BlockSelectorItem[] {
        var cs: BlockSelectorItem[] = [];
        this._blockGroups.each(bg => {
            bg.childs.each(c => {
                if (urls.some(s => s == c.url))
                    cs.push(c);
            })
        });
        return cs;
    }
}
export var blockStore = new BlockStore();