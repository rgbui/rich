
import { IconValueType } from "../../component/view/icon";
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
    findFitTurnBlocks(blocks: { url: string, icon?: IconValueType, text?: string, label?: string }[]): BlockSelectorItem[] {
        var cs: BlockSelectorItem[] = [];
        blocks.forEach(bl => {
            this._blockGroups.each(bg => {
                bg.childs.each(c => {
                    if (bl.url == c.url && c.isLine !== true)
                        cs.push({
                            url: c.url,
                            label: bl.label,
                            text: bl.text || c.text,
                            icon: bl.icon || c.icon
                        });
                })
            });
        })
        return cs;
    }
}
export var blockStore = new BlockStore();