import { Block } from "..";
export class Block$Seek {
    blockChilds(this: Block, name: string) {
        return this.blocks[name];
    }
    /**
     * 
     * @param this 
     * @param predict  返回false 表示不在循环了 返回-1 表示不在进入子元素了
     * @param conside 是否考虑自身
     * @param isDepth 深度优先，还是广度优先
     * @returns 
     */
    each(this: Block, predict: (block: Block) => false | -1 | void, conside: boolean = false, isDepth = false) {
        function _each(block: Block) {
            var isBreak: boolean = false;
            for (let i = 0; i < block.allBlockKeys.length; i++) {
                if (isBreak) break;
                var bs = block.blocks[block.allBlockKeys[i]];
                for (let j = 0; j < bs.length; j++) {
                    if (isDepth == true) {
                        if (_each(bs[j]) == true) { isBreak = true; break; }
                        var r = predict(bs[j]);
                        if (r === false) { isBreak = true; break };
                    }
                    else {
                        var r = predict(bs[j]);
                        if (r === false) { isBreak = true; break }
                        else if (r === -1) continue;
                        if (_each(bs[j]) == true) { isBreak = true; break; }
                    }
                }
            }
            return isBreak;
        }
        if (isDepth == true) {
            if (_each(this) == true) return;
            if (conside == true && predict(this) == false) return;
        }
        else {
            if (conside == true && predict(this) == false) return;
            _each(this);
        }
    }
    /**
     * 
     * @param this 
     * @param predict  返回false 表示不在循环了 返回-1 表示不在进入子元素了 
     * @param consider 
     * @param isDepth 
     * @returns 
     */
    eachReverse(this: Block, predict: (Block: Block) => false | -1 | void, consider: boolean = false, isDepth = false) {
        function _each(block: Block) {
            var isBreak: boolean = false;
            for (let i = block.allBlockKeys.length - 1; i > -1; i--) {
                if (isBreak) break;
                var bs = block.blocks[block.allBlockKeys[i]];
                for (let j = bs.length - 1; j > -1; j--) {
                    if (isDepth == true) {
                        if (_each(bs[j]) == true) { isBreak = true; break; }
                        if (predict(bs[j]) == false) { isBreak = true; break };
                    }
                    else {
                        var r = predict(bs[j]);
                        if (r == false) { isBreak = true; break }
                        else if (r == -1) continue;
                        if (_each(bs[j]) == true) { isBreak = true; break; }
                    }
                }
            }
            return isBreak;
        }
        if (isDepth == true) {
            if (_each(this) == true) return;
            if (consider == true && predict(this) == false) return;
        }
        else {
            if (consider == true && predict(this) == false) return;
            _each(this);
        }
    }
    /***
    * 这是从里面最开始的查询
    */
    find(this: Block, predict: (block: Block) => boolean,
        consider: boolean = false,
        finalPredict?: (block: Block) => boolean, isDepth = true): Block {
        var block: Block;
        this.each(r => {
            if (typeof finalPredict == 'function' && finalPredict(r) == true) return false;
            if (predict(r) == true) {
                block = r;
                return false;
            }
        }, consider, isDepth);
        return block;
    }
    exists(this: Block, predict: (block: Block) => boolean,
        consider: boolean = false,
        finalPredict?: (block: Block) => boolean, isDepth = false) {
        var r = this.find(predict, consider, finalPredict, isDepth);
        if (r) return true;
        else return false;
    }
    findReverse(this: Block, predict: (block: Block) => boolean, consider: boolean = false,
        finalPredict?: (block: Block) => boolean, isDepth = true) {
        var block: Block;
        this.eachReverse(r => {
            if (typeof finalPredict == 'function' && finalPredict(r) == true) return false;
            if (predict(r) == true) {
                block = r;
                return false;
            }
        }, consider, isDepth);
        return block;
    }
    prevFindAll(this: Block, predict: (block: Block) => boolean, consider: boolean = false, finalPredict?: (block: Block) => boolean) {
        var bs: Block[] = [];
        var isFinal: boolean = false;
        function _find(block: Block, consider: boolean = false) {
            var blocks: Block[] = [];
            block.eachReverse(r => {
                if (typeof finalPredict == 'function' && finalPredict(r) == true) {
                    isFinal = true;
                    return false;
                }
                if (predict(r) == true) {
                    blocks.push(r);
                }
            }, consider, true);
            return blocks;
        }
        if (consider == true) {
            var r = _find(this, true);
            if (r) bs.addRange(r);
        }
        if (isFinal) return;
        function prevParentFind(block: Block) {
            var pa = block.parent;
            if (pa) {
                var rs = pa.allChilds;
                var at = rs.findIndex(g => g == block);
                for (let i = at - 1; i > -1; i--) {
                    var r = _find(rs[i], true);
                    if (r) { bs.addRange(r); }
                    if (isFinal) return;
                }
                var g = prevParentFind(pa);
                if (g) return g;
            }
        }
        prevParentFind(this);
        return bs;
    }
    prevFind(this: Block, predict: (block: Block) => boolean, consider: boolean = false, finalPredict?: (block: Block) => boolean): Block {
        var isFinal: boolean = false;
        function _find(block: Block, consider: boolean = false) {
            var bl: Block;
            block.eachReverse(r => {
                if (typeof finalPredict == 'function' && finalPredict(r) == true) { isFinal = true; return false; }
                if (predict(r) == true) {
                    bl = r;
                    return false;
                }
            }, consider, true);
            return bl;
        }
        if (consider == true) {
            var r = _find(this, true);
            if (r) return r;
        }
        if (isFinal) return;
        function prevParentFind(block: Block) {
            var pa = block.parent;
            if (pa) {
                var rs = pa.allChilds;
                var at = rs.findIndex(g => g == block);
                for (let i = at - 1; i > -1; i--) {
                    var r = _find(rs[i], true);
                    if (r) return r;
                    if (isFinal) return;
                }
                if (typeof finalPredict == 'function' && finalPredict(pa) == true) return;
                if (predict(pa) == true) return pa;
                var g = prevParentFind(pa);
                if (g) return g;
            }
        }
        return prevParentFind(this);
    }
    nextFind(this: Block, predict: (block: Block) => boolean, consider: boolean = false, finalPredict?: (block: Block) => boolean): Block {
        var isFinal: boolean = false;
        function _find(block: Block, consider: boolean = false) {
            var bl: Block;
            block.each(r => {
                if (typeof finalPredict == 'function' && finalPredict(r) == true) { isFinal = true; return false; }
                if (predict(r) == true) {
                    bl = r;
                    return false;
                }
            }, consider);
            return bl;
        }
        if (consider == true) {
            var r = _find(this, true);
            if (r) return r;
        }
        if (isFinal) return;
        function nextParentFind(block: Block) {
            var pa = block.parent;
            if (pa) {
                var rs = pa.allChilds;
                var at = rs.findIndex(g => g == block);
                for (let i = at + 1; i < rs.length; i++) {
                    var r = _find(rs[i], true);
                    if (r) return r;
                    if (isFinal) return;
                }
                // if (typeof finalPredict == 'function' && finalPredict(pa) == true) return;
                // if (predict(pa) == true) return pa;
                var g = nextParentFind(pa);
                if (g) return g;
            }
        }
        return nextParentFind(this);
    }
    nextFindAll(this: Block, predict: (block: Block) => boolean, consider: boolean = false, finalPredict?: (block: Block) => boolean, isConsideFinal?: boolean
    ) {
        var bs: Block[] = [];
        var isFinal: boolean = false;
        function _find(block: Block, consider: boolean = false) {
            var blocks: Block[] = [];
            block.each(r => {
                if (isConsideFinal == true) {
                    if (predict(r) == true) {
                        blocks.push(r);
                    }
                    if (typeof finalPredict == 'function' && finalPredict(r) == true) {
                        isFinal = true;
                        return false;
                    }
                }
                else {
                    if (typeof finalPredict == 'function' && finalPredict(r) == true) {
                        isFinal = true;
                        return false;
                    }
                    if (predict(r) == true) {
                        blocks.push(r);
                    }
                }
            }, consider);
            return blocks;
        }
        if (consider == true) {
            var r = _find(this, true);
            if (r) bs.addRange(r);
        }
        if (isFinal) return bs;
        function nextParentFind(block: Block) {
            var pa = block.parent;
            if (pa) {
                var rs = pa.allChilds;
                var at = rs.findIndex(g => g == block);
                for (let i = at + 1; i < rs.length; i++) {
                    var r = _find(rs[i], true);
                    if (r) { bs.addRange(r); }
                    if (isFinal) return;
                }
                var g = nextParentFind(pa);
                if (g) return g;
            }
        }
        nextParentFind(this);
        return bs;
    }
    contains(this: Block, block: Block, ignore: boolean = false) {
        if (ignore == false && block === this) return true;
        var r = this.find(g => g == block);
        if (r) return true;
        else return false;
    }
    findAll(this: Block, predict: (block: Block) => boolean, consider: boolean = false, finalPredict?: (block: Block) => boolean): Block[] {
        var blocks: Block[] = [];
        this.each(r => {
            if (typeof finalPredict == 'function' && finalPredict(r) == true) return false;
            if (predict(r) == true) {
                blocks.push(r);
            }
        }, consider, true);
        return blocks;
    }
    closest(this: Block, predict: (block: Block) => boolean, ignore: boolean = false, finalPredict?: (block: Block) => boolean): Block {
        if (ignore !== true && predict(this)) return this;
        var pa = this.parent;
        while (true) {
            if (typeof finalPredict == 'function' && finalPredict(pa) == true) return undefined;
            if (pa && predict(pa) == true) return pa;
            else {
                if (!pa) break;
                pa = pa.parent;
            }
        }
    }
    parents(this: Block, predict: (block: Block) => boolean, ignore: boolean = false, finalPredict?: (block: Block) => boolean) {
        var blocks: Block[] = [];
        if (ignore !== true && predict(this)) blocks.push(this);
        var pa = this.parent;
        while (true) {
            if (!pa) break;
            else if (typeof finalPredict == 'function' && finalPredict(pa) == true) break;
            else if (predict(pa)) blocks.push(pa);
            pa = pa.parent;
        }
        return blocks;
    }
    /**
     * 查找与当前块有相交的块
     * 包括视频上的包含、相交
     * @param this 
     */
    findFramesByIntersect(this: Block) {
        var blocks = this.page.findAll(g => g.isFrame);
        var poly = this.getVisiblePolygon();
        return blocks.findAll(g => {
            var vp = g.getVisiblePolygon();
            return vp.bound.isCross(poly.bound)
        })
    }
    isBefore(this: Block, block: Block) {
        var pos = this.el.compareDocumentPosition(block.el);
        if (pos == 4 || pos == 20) {
            return true
        }
        return false
    }
    isAfter(this: Block, block: Block) {
        return block.isBefore(this)
    }
}