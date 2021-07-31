import { Events } from "../../util/events";
import { util } from "../../util/util";
import { Point, Rect } from "../common/point";
import { Page } from "../page";
import { Anchor } from "../kit/selection/anchor";
import { BlockFactory } from "./factory/block.factory";
import { BlockAppear, BlockDisplay, BlockRenderRange } from "./enum";
import { Pattern } from "./pattern/index";
import { BlockView } from "./view";
import { TextEle } from "../common/text.ele";
import { ActionDirective, OperatorDirective } from "../history/declare";
import { Block$Seek } from "./partial/seek";
import { prop } from "./factory/observable";
import { TemporaryPurpose } from "../page/partial/declare";
import { DropDirection } from "../kit/handle/direction";
import { Exception, ExceptionType } from "../error/exception";
import { BlockUrlConstant } from "./constant";
import "./style.less";
import { Block$Method } from "./partial/method";
export abstract class Block extends Events {
    parent: Block;
    url: string;
    page: Page;
    id: string;
    date: number;
    pattern: Pattern;
    blocks: Record<string, Block[]> = { childs: [] };
    private __props: string[];
    get childs() {
        return this.blocks.childs;
    }
    get allChilds() {
        var keys = this.blockKeys;
        var rs: Block[] = [];
        keys.each(key => {
            rs.addRange(this.blocks[key]);
        });
        return rs;
    }
    get patternState() {
        return 'default';
    }
    get hasChilds() {
        if (Object.keys(this.blocks).length > 0) {
            var keys = this.blockKeys;
            if (keys.exists(key => this.blocks[key].length > 0)) return true;
        }
        return false;
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
    get hasBrother() {
        var pb = this.parentBlocks;
        if (pb.length > 1) return true;
        else return false;
    }
    get parentKey() {
        var pb = this.parentBlocks;
        for (var n in this.parent.blocks) {
            if (this.parent.blocks[n] == pb) return n;
        }
    }
    get blockKeys() {
        return Object.keys(this.blocks);
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
            else if (at == 0) {
                var keys = this.parent.blockKeys;
                var parentKey = this.parentKey;
                var i = keys.findIndex(g => g == parentKey);
                if (i > 0) {
                    return this.parent.blocks[keys[i - 1]].last()
                }
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
            else if (at == pbs.length - 1) {
                var keys = this.parent.blockKeys;
                var parentKey = this.parentKey;
                var i = keys.findIndex(g => g == parentKey);
                if (i < keys.length - 1) {
                    return this.parent.blocks[keys[i + 1]].first();
                }
            }
        }
    }
    /**
     * 当前元素下面的元素，注意在同一个ChildKey中
     */
    get nexts() {
        var pbs = this.parentBlocks;
        var at = this.at;
        return pbs.findAll((g, i) => i > at);
    }
    /**
     * 文本内容是否可以支持多行，
     * 仅对文本block有用
     */
    get multiLines() {
        return true;
    }
    /**
     * 是否换行时，支持连续创建
     */
    get isContinuouslyCreated() {
        return false;
    }
    /**
     * 连续输入时，克隆的一些属性
     */
    get continuouslyProps() {
        return {}
    }
    constructor(page: Page) {
        super();
        this.id = util.guid();
        this.date = new Date().getTime();
        this.page = page;
        this.pattern = new Pattern(this);
        if (typeof this.init == 'function') this.init();
    }
    init() {

    }
    /**
     * 当前元素内部第一个坑位元素
     */
    get firstPitBlock() {
        return this.find(g => true);
    }
    /**
     * 当前元素内部最后一个坑位元素
     */
    get lastPitBlock() {
        return this.findReverse(g => true);
    }
    /**
     * 移走元素，这个不是删除，
     * 元素更多的是从当前位置移到别一个位置
     * @returns 
     */
    async remove() {
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
    async delete() {
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
    async turn(url: string) {
        var data = await this.get();
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
    async layoutCollapse() {
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
    async insertBefore(to: Block) {
        await to.parent.append(this,
            to.at,
            to.parentKey
        );
    }
    async insertAfter(to: Block) {
        await to.parent.append(this,
            to.at + 1,
            to.parentKey
        );
    }
    async append(block: Block, at?: number, childKey?: string) {
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
    async move(to: Block, direction: DropDirection) {
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
    updateProps(props: Record<string, any>, range = BlockRenderRange.self) {
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
    updateArrayInsert(key: string, at: number, data: any, range = BlockRenderRange.self) {
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
    updateArrayRemove(key: string, at: number, range = BlockRenderRange.self) {
        var data = this[key][at];
        this.page.snapshoot.record(OperatorDirective.arrayPropRemove, {
            blockId: this.id,
            propKey: key,
            data: typeof data.get == 'function' ? data.get() : util.clone(data),
            at: at
        });
        this.syncUpdate(range);
    }
    syncUpdate(range = BlockRenderRange.none) {
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
    updateArrayUpdate(key: string, at: number, data: any, range = BlockRenderRange.self) {
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
    /***
    * 查找当前容器里面首位的内容元素，
    * 而且是视野上面的
    **/
    get visiblePitFirstContent() {
        return this.find(g => !g.isLayout);
    }
    /**
     * 查找当前容器里面末尾的内容元素
     */
    get visiblePitLastContent() {
        return this.findReverse(g => !g.isLayout && !g.hasChilds);
    }
    isLoad = false;
    /**
     * 实始加载，就是初始block时触发
     * 主要是加载初始的数据和模板
     */
    async initialLoad() {

    }
    async load(data) {
        try {
            if (!this.pattern)
                this.pattern = new Pattern(this);
            for (var n in data) {
                if (n == 'blocks') continue;
                else if (n == 'pattern') {
                    await this.pattern.load(data[n]);
                    continue;
                }
                this[n] = data[n];
            }
            if (typeof data.blocks == 'object') {
                for (var n in data.blocks) {
                    var childs = data.blocks[n];
                    this.blocks[n] = [];
                    await childs.eachAsync(async (dc) => {
                        var block = await BlockFactory.createBlock(dc.url, this.page, dc, this);
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
        if (typeof this.pattern.get == 'function')
            json.pattern = await this.pattern.get();
        else {
            console.log(this, this.pattern);
        }
        json.blocks = {};
        for (let b in this.blocks) {
            json.blocks[b] = await this.blocks[b].asyncMap(async x => await x.get());
        }
        if (Array.isArray(this.__props)) {
            this.__props.each(pro => {
                if (Array.isArray(this[pro])) {
                    json[pro] = this[pro].map(pr => {
                        if (typeof pr?.get == 'function') return pr.get();
                        else return util.clone(pr);
                    })
                }
                else if (typeof this[pro] != 'undefined') {
                    if (typeof this[pro]?.get == 'function')
                        json[pro] = this[pro].get();
                    else json[pro] = util.clone(this[pro]);
                }
            })
        }
        return json;
    }
    async cloneData() {
        var json: Record<string, any> = { url: this.url };
        json.pattern = await this.pattern.cloneData();
        json.blocks = {};
        for (let b in this.blocks) {
            json.blocks[b] = await this.blocks[b].asyncMap(async x => await x.cloneData());
        }
        return await BlockFactory.createBlock(this.url, this.page, json, null);
    }
    async clone() {
        var data = await this.cloneData();
        return await BlockFactory.createBlock(data.url, this.page, data, null);
    }
    viewComponent: typeof BlockView | ((props: any) => JSX.Element)
    view: BlockView<this>;
    el: HTMLElement;
    get visibleStyle() {
        var style: Record<string, any> = {};
        if (this.isBlock) {
            Object.assign(style, {
                width: ((this as any).widthPercent || 100) + '%'
            });
        }
        Object.assign(style, this.pattern.style);
        return style;
    }
    childsEl: HTMLElement;
    get visibleHeadAnchor() {
        return this.page.kit.explorer.createAnchor(this);
    }
    get visibleBackAnchor() {
        return this.page.kit.explorer.createAnchor(this, -1);
    }
    get isText(): boolean {
        return this.appear == BlockAppear.text
    }
    get isSolid(): boolean {
        return this.appear == BlockAppear.solid
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
    get isLineSolid(): boolean {
        return false;
    }
    get isBlock(): boolean {
        return this.display == BlockDisplay.block;
    }
    /***
     * 注意换行的元素不一定非得是/row，
     * 如表格里面自定义的换行
     */
    get isRow(): boolean {
        return false;
    }
    get isCol(): boolean {
        return false;
    }
    get isArea(): boolean {
        return false;
    }
    partName: string;
    get isPart(): boolean {
        if (typeof this.partName == 'string') return true;
        else return false;
    }
    get partParent(): Block {
        return this.closest(x => !x.isPart);
    }
    get visiblePre() {
        var current: Block = this;
        var prev = current.prev;
        while (true) {
            if (prev) {
                /**
                 * 非layout容器，也是有可能有子block的
                 * 例如list块,本身是个文本块，但包含子模块
                 */
                if (!prev.isLayout) {
                    if (prev.hasChilds) {
                        var vp = prev.visiblePitLastContent;
                        if (vp) return vp;
                    }
                    return prev;
                }
                else {
                    return prev.visiblePitLastContent;
                }
            }
            else {
                current = current.parent;
                if (current && !current.isLayout) return current;
                if (current) {
                    prev = current.prev;
                }
                else {
                    break;
                }
            }
        }
    }
    get visibleNext() {
        var current: Block = this;
        if (!current.isLayout && current.hasChilds) {
            var t = current.visiblePitFirstContent;
            if (t) return t;
        }
        var next = current.next;
        while (true) {
            if (next) {
                if (!next.isLayout) return next;
                else {
                    return next.visiblePitFirstContent;
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
        if (pre) return pre.visibleBackAnchor;
    }
    get visibleNextAnchor() {
        var next = this.visibleNext;
        if (next) return next.visibleHeadAnchor;
    }
    get row() {
        return this.closest(x => x.isRow);
    }
    get nextRow() {
        var row = this.row;
        if (row) {
            while (true) {
                if (row.parent && row.parent.isCol) {
                    if (row.parent.parent && row.parent.parent.isRow) {
                        row = row.parent.parent;
                    } else break;
                }
                else break;
            }
            return row.nextFind(g => g.isRow && !g.contains(row));
        }
    }
    get prevRow() {
        var row = this.row;
        if (row) {
            while (true) {
                if (row.parent && row.parent.isCol) {
                    if (row.parent.parent && row.parent.parent.isRow) {
                        row = row.parent.parent;
                    } else break;
                }
                else break;
            }
            return row.prevFind(g => g.isRow && !g.contains(row));
        }
    }
    visibleDownAnchor(anchor: Anchor) {
        var x: number;
        if (anchor.isText) {
            var line = TextEle.getLineByAt(anchor.textEl, anchor.at);
            if (line) {
                x = line.point.x;
            }
        }
        else if (anchor.isSolid) x = anchor.soldEl.getBoundingClientRect().left;
        var nextRow = this.nextRow;
        if (nextRow) {
            var bound = nextRow.getBounds().first();
            return nextRow.visibleAnchor(new Point(x, bound.top + 1))
        }
    }
    visibleUpAnchor(anchor: Anchor): Anchor {
        var x: number;
        if (anchor.isText) {
            var line = TextEle.getLineByAt(anchor.textEl, anchor.at);
            if (line) {
                x = line.point.x;
            }
        }
        else if (anchor.isSolid) x = anchor.soldEl.getBoundingClientRect().left;
        var prevRow = this.prevRow;
        if (prevRow) {
            var bound = prevRow.getBounds().first();
            return prevRow.visibleAnchor(new Point(x, bound.top + bound.height - 1));
        }
    }
    visibleInnerDownAnchor(anchor: Anchor) {
        if (anchor.isText) {
            var line = TextEle.getLineByAt(anchor.textEl, anchor.at);
            if (line.line == line.total) {
                return anchor.block.visibleDownAnchor(anchor);
            }
            else {
                var newPoint = line.point.clone();
                newPoint.y += line.lineheight * 1.5;
                return anchor.block.visibleAnchor(newPoint);
            }
        }
        else return anchor.block.visibleDownAnchor(anchor);
    }
    visibleInnerUpAnchor(anchor: Anchor) {
        if (anchor.isText) {
            var line = TextEle.getLineByAt(anchor.textEl, anchor.at);
            if (line.line == 1) {
                return anchor.block.visibleUpAnchor(anchor);
            }
            else {
                var newPoint = line.point.clone();
                newPoint.y -= line.lineheight * 0.5;
                return anchor.block.visibleAnchor(newPoint);
            }
        }
        else return anchor.block.visibleUpAnchor(anchor);
    }
    /***
     * 通过坐标计算视野是处于block那个part中，或者block本身
     * 注意，当前的block有可能是layout block，那么需要通过坐标找到子视野的block，如果没有子block，这实际是个不可能出现的错误
     * 如果是一个isPanel的block，那么需要确认当前的坐标是否处于子的block中，另外注意，如果坐标是点在当前的空白block中，可能归宿到视野子内容
     * @param point 坐标（当前坐标明确是处于当前的block中）
     */
    visibleAnchor(point: Point): Anchor {
        var block = this.visiblePoint(point);
        return this.page.kit.explorer.createAnchor(block, block.isText ? TextEle.getAt(block.textEl, point) : undefined);
    }
    visiblePoint(point: Point) {
        var as = this.allVisibleBlocks;
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
    /**
     * 创建block，有两种方式
     * 1. 是在当前的row下面添加新的row-block
     * 2. 如果当前的block有相邻的元素，那么可能是 row->[block,col{block...}]
     * @param url 
     * @param data 
     * @returns 
     */
    async visibleDownCreateBlock(url: string, data: Record<string, any> = {}) {
        var row = this.closest(x => x.isRow);
        if (row.childs.length > 1 && this.parent === row) {
            var col = await this.page.createBlock(BlockUrlConstant.Col, {
                blocks: {
                    childs: [{ url: BlockUrlConstant.Row }, { url: BlockUrlConstant.Row }]
                }
            }, this.parent, this.at + 1);
            col.childs.first().append(this);
            return await this.page.createBlock(url, data, col.childs.last());
        }
        else {
            var newRow = await this.page.createBlock(BlockUrlConstant.Row, {
                blocks: {
                    childs: [
                        { url, ...data }
                    ]
                }
            }, row.parent, row.at + 1);
            return newRow.childs.first();
        }
    }
    /**
     * 在当前的block的右侧创建一个新的block
     * 通常创建的都是行内元素，如果是块元素，实际上在拖动布局中处理了
     * @param url 
     * @param data 
     */
    async visibleRightCreateBlock(url: string, data: Record<string, any>) {
        if (this.isTextContent) {
            return await this.page.createBlock(url, data, this.parent, this.at + 1);
        }
        else {
            var content = this.content;
            this.updateProps({ content: '' });
            var at = 0;
            if (content)
                await this.page.createBlock(BlockUrlConstant.Text, { content }, this, at++);
            return await this.page.createBlock(url, data, this, at);
        }
    }
    @prop()
    content: string = '';
    get isEmpty() {
        return this.textContent ? false : true
    }
    get textContent(): string {
        var c = this.content;
        if (typeof c == 'string') return c;
        else if (c === null || c === undefined) return '';
        else if (c && typeof (c as any).toString == 'function') return (c as any).toString();
        return '';
    }
    /**
     * 是否可以自动删除
     */
    get isCanAutomaticallyDeleted() {
        return this.isEmpty && !this.isPart && !this.hasChilds;
    }
    get htmlContent() {
        return this.content;
    }
    getBounds() {
        return TextEle.getBounds(this.el);
    }
    getVisibleBound() {
        return this.cacheComputed(TemporaryPurpose.blockBound, () => Rect.from(this.el.getBoundingClientRect()));
    }
    getVisibleContentBound() {
        return this.getVisibleBound();
    }
    /**
     * 获取视觉上的block和part
     */
    get visibleBlock() {
        if (this.isLayout) return [];
        else return [this];
    }
    get allVisibleBlocks() {
        var bs: (Block)[] = [];
        var gs = this.visibleBlock;
        bs.addRange(gs);
        for (var n in this.blocks) {
            var blocks = this.blocks[n];
            blocks.each(b => {
                bs.addRange(b.allVisibleBlocks);
            })
        }
        return bs;
    }
    get textEl() {
        var el = this.el;
        if (!el.classList.contains('sy-appear-text')) {
            var c: HTMLElement = el.querySelector('.sy-appear-text');
            if (!c) throw new Exception(ExceptionType.notFoundTextEle)
            else el = c;
        }
        return el;
    }
    get soldEl() {
        var el = this.el;
        if (!el.classList.contains('sy-appear-solid')) {
            var c: HTMLElement = el.querySelector('.sy-appear-solid');
            if (!c) throw new Exception(ExceptionType.notFoundSolidEle)
            else el = c;
        }
        return el;
    }
    async onInputText(value: string, at: number, end: number, action?: () => Promise<void>) {
        await this.page.onAction(ActionDirective.onInputText, async () => {
            this.page.snapshoot.record(OperatorDirective.updateTextReplace, {
                blockId: this.id,
                start: at,
                end: end,
                value
            });
            if (typeof action == 'function') await action();
        })
    }
    async onDeleteText(value: string, start: number, end: number, action?: () => Promise<void>) {
        await this.page.onAction(ActionDirective.onDeleteText, async () => {
            var block = this;
            var pa = this.page;
            pa.snapshoot.record(OperatorDirective.updateTextDelete, {
                blockId: block.id,
                start,
                end,
                text: value
            });
            if (typeof action == 'function') await action();
        })
    }
    async onAction(directive: ActionDirective, action: () => Promise<void>) {
        await this.page.onAction(directive, action);
    }
    mounted(fn: () => void) {
        this.once('mounted', fn);
    }
    onMounted() {
        this.emit('mounted');
    }
    async onDelete() {
        await this.page.onAction(ActionDirective.onDelete, async () => {
            var pa = this.parent;
            await this.delete();
            if (pa) await pa.layoutCollapse();
        })
    }
    async onUpdateProps(props: Record<string, any>, range = BlockRenderRange.none) {
        await this.page.onAction(ActionDirective.onUpdateProps, async () => {
            this.updateProps(props, range);
        })
    }
    get isTextContent() {
        return false;
    }
    focusAnchor(anchor: Anchor) {
        if (this.isText && this.isEmpty) {
            this.textEl.classList.add('empty');
        }
    }
    blurAnchor(anchor: Anchor) {
        if (this.isText) {
            this.textEl.classList.remove('empty');
        }
    }
    private temporarys: { flag: string, purpose: TemporaryPurpose, data: any }[] = [];
    cacheComputed<T>(purpose: TemporaryPurpose, computed: () => T): T {
        var tp = this.temporarys.find(g => g.purpose == purpose);
        var flag = this.page.getTemporaryFlag(purpose);
        if (tp && tp.flag == flag && typeof flag != 'undefined' && typeof tp.data != 'undefined') return tp.data;
        else {
            if (!tp) {
                tp = { flag, purpose, data: undefined };
                this.temporarys.push(tp);
            }
            tp.flag = flag;
            tp.data = computed();
            return tp.data;
        }
    }
    async onCreated() {
        var keys = this.blockKeys;
        for (let key of keys) {
            await this.blocks[key].eachAsync(async (block) => {
                await block.onCreated();
            })
        }
    }
    get isSupportAnchor() {
        if (this.isLayout) return false;
        if (this.isText && !this.textEl) return false;
        if (this.isSolid && !this.soldEl) return false;
        return true;
    }
    get isSupportTextStyle(){
        return true;
    }
}
export interface Block extends Block$Seek { }
util.inherit(Block, Block$Seek);

export interface Block extends Block$Method { }
util.inherit(Block, Block$Method);