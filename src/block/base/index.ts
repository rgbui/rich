

import { Events } from "../../util/events";
import { util } from "../../util/util";
import { Point } from "../../common/point";
import { Page } from "../../page";
import { Anchor } from "../../selector/anchor";
import { BlockFactory } from "../factory/block.factory";
import { BlockAppear, BlockDisplay, Locate } from "./enum";
import { BlockStyle } from "../style";
import { BaseComponent } from "./component";

import { BlockPart, PartPlace } from "./part";
import { TextEle } from "../../common/text.ele";
export abstract class Block extends Events {
    parent: Block;
    url: string;
    page: Page;
    id: string;
    date: number;
    styles: BlockStyle[] = [];
    blocks: Record<string, Block[]> = { childs: [] };
    get childs() {
        return this.blocks.childs;
    }
    blockChilds(name: string) {
        return this.blocks[name];
    }
    get hasChilds() {
        if (Object.keys(this.blocks).length > 0) {
            for (var n in this.blocks) {
                if (Array.isArray(this.blocks[n]) && this.blocks[n].length > 0) return true;
            }
        }
        return false;
    }
    private styleId: string;
    get style() {
        return this.styles.find(x => x.id == this.styleId);
    }
    get parentBlocks() {
        if (this.parent) {
            for (var n in this.parent.blocks) {
                if (this.parent.blocks[n].exists(g => g === this)) {
                    return this.parent.blocks[n];
                }
            }
        }
    }
    get at() {
        return this.parentBlocks.findIndex(g => g === this);
    }
    get prev() {
        if (this.parentBlocks) {
            var at = this.at;
            if (at > 0) {
                return this.parentBlocks[at - 1];
            }
        }
    }
    get next() {
        var pbs = this.parentBlocks;
        if (pbs) {
            var at = this.at;
            if (at < pbs.length - 1) {
                return pbs[at + 1];
            }
        }
    }
    constructor(page: Page) {
        super();
        this.id = util.guid();
        this.date = new Date().getTime();
        this.page = page;
    }
    find(predict: (block: Block) => boolean, considerSelf?: boolean): Block {
        if (considerSelf == true && predict(this)) return this;
        var result: Block;
        for (let n in this.blocks) {
            this.blocks[n].each(block => {
                if (predict(block) == true) {
                    result = block;
                    return false;
                }
                var r = block.find(predict);
                if (r) { result = r; return false }
            });
            if (result) break;
        }
        return result;
    }
    findAll(predict: (block: Block) => boolean, considerSelf?: boolean): Block[] {
        var blocks: Block[] = [];
        if (considerSelf == true && predict(this)) { blocks.push(this) };
        for (let n in this.blocks) {
            this.blocks[n].each(block => {
                if (predict(block) == true) {
                    blocks.push(block);
                }
                else {
                    var rs = block.findAll(predict);
                    if (rs.length > 0) {
                        blocks.concat(rs);
                    }
                }
            })
        }
        return blocks;
    }
    closest(predict: (block: Block) => boolean, ignoreSelf?: boolean) {
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
    parents(predict: (block: Block) => boolean, ignoreSelf?: boolean) {
        var blocks: Block[] = [];
        if (ignoreSelf !== true && predict(this)) blocks.push(this);
        var pa = this.parent;
        while (true) {
            if (!pa) break;
            else if (predict(pa)) blocks.push(pa);
            pa = pa.parent;
        }
        return blocks;
    }
    /***
    * 查找当前容器里面首位的内容元素，
    * 而且是视野上面的
    **/
    get visibleInnerBefore() {
        var c: Block = this;
        while (true) {
            if (c.isLayout) {
                var keys = Object.keys(c.blocks);
                var ps = this.parts.findAll(g => keys.exists(g.name) && g.place == PartPlace.childs);
                keys = ps.map(p => p.name);
                var key = keys.length > 0 ? keys.first() : 'childs';
                var firstBlock = c.blocks[key].first();
                if (firstBlock) {
                    if (!firstBlock.isLayout) return firstBlock;
                    else c = firstBlock;
                }
                else return null;
            }
            else return c;
        }
    }
    /**
     * 查换当前容器里面末尾的内容元素
     */
    get visibleInnerAfter() {
        var c: Block = this;
        while (true) {
            if (c.isLayout) {
                var keys = Object.keys(c.blocks);
                var ps = this.parts.findAll(g => keys.exists(g.name) && g.place == PartPlace.childs);
                keys = ps.map(p => p.name);
                var key = 'childs';
                if (keys.length > 0) key = keys.last();
                var lastBlock = c.blocks[key].last();
                if (lastBlock) {
                    if (!lastBlock.isLayout) return lastBlock;
                    else c = lastBlock;
                }
                else return null;
            }
            else return c;
        }
    }
    isLoad = false;
    async load(data) {
        try {
            for (var n in data) {
                if (n == 'blocks') continue;
                else if (n == 'styles') continue;
                this[n] = data[n];
            }
            if (Array.isArray(data.styles)) {
                this.styles = [];
                await data.styles.eachAsync(async (style) => {
                    var st = new BlockStyle(this);
                    await st.load(style);
                    this.styles.push(st)
                })
            }
            if (typeof data.blocks == 'object') {
                for (var n in data.blocks) {
                    var childs = data.blocks[n];
                    this.blocks[n] = [];
                    await childs.eachAsync(async (dc) => {
                        var block = BlockFactory.createBlock(dc.url, this.page);
                        block.parent = this;
                        await block.load(dc);
                        this.blocks[n].push(block);
                    })
                }
            }
            this.isLoad = true;
        }
        catch (err) {
            this.page.onError(err);
        }
    }
    async get() {
        var json: Record<string, any> = { id: this.id, url: this.url };
        json.styles = await this.styles.asyncMap(async x => await x.get());
        json.blocks = {};
        for (let b in this.blocks) {
            json.blocks[b] = await this.blocks[b].asyncMap(async x => await x.get());
        }
        return json;
    }
    viewComponent: typeof BaseComponent | ((props: any) => JSX.Element)
    view: BaseComponent<this>;
    el: HTMLElement;
    setState(state: Record<string, any>) {
        Object.assign(this, state);
        this.view.forceUpdate();
    }
    protected parts: BlockPart[] = [];
    setPart(name: string, part: Partial<BlockPart>) {
        var pa = this.parts.find(g => g.name == name);
        if (pa) {
            Object.assign(pa, part);
        }
        else {
            pa = new BlockPart();
            pa.block = this;
            Object.assign(pa, { name }, part);
        };
        this.parts.sort((x, y) => {
            if (typeof x.index == 'undefined' || typeof y.index == 'undefined') {
                if (typeof x.index == 'number') {
                    return 1;
                }
                else if (typeof y.index == 'number') {
                    return -1;
                }
                return 0;
            }
            else x.index > y.index ? -1 : 1
        })
    }
    removePart(name: string) {
        this.parts.remove(g => g.name == name);
    }
    findPart(predict: (part: BlockPart) => boolean) {
        if (this.havePart) {
            return this.parts.find(predict);
        }
    }
    get visibleHeadPart() {
        if (this.havePart) {
            return this.parts.first();
        }
        else return null;
    }
    get visibleBackPart() {
        if (this.havePart) {
            return this.parts.last();
        }
        else return null;
    }
    get visibleHeadAnchor() {
        var anchor = this.page.selector.createAnchor();
        anchor.part = this.visibleHeadPart;
        if (anchor.isText) {
            anchor.at = 0;
        }
        return anchor;
    }
    get visibleBackAnchor() {
        var anchor = this.page.selector.createAnchor();
        anchor.part = this.visibleBackPart;
        if (anchor.isText) {
            anchor.at = anchor.textContent.length;
        }
        return anchor;
    }
    get isText(): boolean {
        return this.appear == BlockAppear.text
    }
    get isSolid(): boolean {
        return this.appear == BlockAppear.solid
    }
    get havePart() {
        return this.parts.length > 0;
    }
    protected display: BlockDisplay;
    protected appear: BlockAppear;
    /**
     * 布局用的block，该block只具有特定的调节布局效果，本身没有任何内容可以设置
     */
    get isLayout(): boolean {
        return this.appear == BlockAppear.layout
    }
    get isLine(): boolean {
        return this.display == BlockDisplay.inline;
    }
    get isBlock(): boolean {
        return this.display == BlockDisplay.block;
    }
    get isRow(): boolean {
        return this.url == '/row';
    }
    get isCol(): boolean {
        return this.url == '/col'
    }
    get visiblePre() {
        var current: Block = this;
        var prev = current.prev;
        while (true) {
            if (prev) {
                if (!prev.isLayout) return prev;
                else {
                    return prev.visibleInnerAfter;
                }
            }
            else {
                current = current.parent;
                if (current && !current.isLayout) return current;
                if (current) {
                    prev = current.prev;
                }
                else break;
            }
        }
    }
    get visibleNext() {
        var current: Block = this;
        var next = current.next;
        while (true) {
            if (next) {
                if (!next.isLayout) return next;
                else {
                    return next.visibleInnerBefore;
                }
            }
            else {
                current = current.parent;
                if (current) {
                    next = current.next;
                }
                else break;
            }
        }
    }
    get visiblePrevAnchor() {
        var pre = this.visiblePre;
        if (pre) return pre.visiblePrevAnchor
    }
    get visibleNextAnchor() {
        var next = this.visibleNext;
        if (next) return next.visibleHeadAnchor;
    }
    visibleDownAnchor(x: number) {
        var rc = this.closest(x => x.isRow);
        if (rc && rc.next) {
            var nextRow = rc.next;
            var bound = nextRow.getBounds().first();
            var point = new Point(x, bound.top);
            return this.visibleAnchor(point)
        }
    }
    visibleUpAnchor(x: number): Anchor {
        var rc = this.closest(x => x.isRow);
        if (rc) {
            var panel = rc.prev;
            if (panel) {
                var bound = panel.getBounds().first();
                return this.visibleAnchor(new Point(x, bound.top + bound.height));
            }
        }
    }
    /***
     * 通过坐标计算视野是处于block那个part中，或者block本身
     * 注意，当前的block有可能是layout block，那么需要通过坐标找到子视野的block，如果没有子block，这实际是个不可能出现的错误
     * 如果是一个isPanel的block，那么需要确认当前的坐标是否处于子的block中，别外注意，如果坐标是点在当前的空白block中，可能归宿到视野子内容
     * @param point 坐标（当前坐标明确是处于当前的block中）
     */
    visibleAnchor(point: Point): Anchor {
        var part = this.visiblePointPart(point);
        var anchor = this.page.selector.createAnchor();
        if (part instanceof Block) {
            anchor.block = part;
            if (part.isText) {
                anchor.at = TextEle.getAt(part.textEl, point);
            }
        }
        else {
            anchor.part = part;
            anchor.block = part.block;
            if (anchor.part.isText) {
                anchor.at = TextEle.getAt(part.textEl, point);
            }
        }
        return anchor;
    }
    visiblePointPart(point: Point) {
        var as = this.allVisibleBlockAndParts;
        var ps = as.map(e => {
            var bounds = e.getBounds();
            var newPoint = TextEle.cacDistance(point, bounds);
            return {
                dis: newPoint,
                part: e
            }
        });
        if (ps.exists(g => g.dis.x == 0 && g.dis.y == 0))
            return ps.find(g => g.dis.x == 0 && g.dis.y == 0).part;
        if (ps.exists(g => g.dis.y == 0))
            return ps.findAll(g => g.dis.y == 0).findMin(g => g.dis.x).part
        return ps.findMin(g => g.dis.y).part
    }
    content: string;
    get htmlContent() {
        return {
            __html: TextEle.getHtml(this.content)
        }
    }
    updateContent(content: string, partName?: string) {
        var pa: BlockPart;
        if (partName) pa = this.findPart(g => g.name == partName);
        if (pa && pa.propkey) {
            this[pa.propkey] = content;
        }
        else this.content = content;
    }
    getBounds() {
        return TextEle.getBounds(this.el);
    }
    /**
     * 获取视觉上的block和part
     */
    get visibleBlockAndParts() {
        if (this.isLayout) return [];
        if (this.havePart) return this.parts;
        else return [this];
    }
    get allVisibleBlockAndParts() {
        var bs: (Block | BlockPart)[] = [];
        var gs = this.visibleBlockAndParts;
        bs.addRange(gs);
        for (var n in this.blocks) {
            var blocks = this.blocks[n];
            blocks.each(b => {
                bs.addRange(b.allVisibleBlockAndParts);
            })
        }
        return bs;
    }
    onMousedown(anchor: Anchor) { }
    /**
     * 鼠标移到元素内，不包含子元素
     * @param event 
     */
    onMouseover() { }
    /***
     * 鼠标移到元素外，不包含子元素
     */
    onMouseout() { }
    /**
     * 鼠标移到元素内，包括子元素
     * @param event 
     */
    onMouseenter() { }
    /**
     * 鼠标移到元素外，包括子元素
     * @param event 
     */
    onMouseleave() { }
    get textEl() {
        var el = this.el;
        if (!el.classList.contains('sy-appear-text')) {
            var c: HTMLElement = el.querySelector('.sy-appear-text');
            if (!c) throw new Error('not found appear text')
            else el = c;
        }
        return el;
    }
    get soldEl() {
        var el = this.el;
        if (!el.classList.contains('sy-appear-solid')) {
            var c: HTMLElement = el.querySelector('.sy-appear-solid');
            if (!c) throw new Error('not found appear solid')
            else el = c;
        }
        return el;
    }
}