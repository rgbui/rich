import { Events } from "../util/events";
import { util } from "../util/util";
import { Point, Rect } from "../common/point";
import { Page } from "../page";
import { Anchor } from "../selector/selection/anchor";
import { BlockFactory } from "./factory/block.factory";
import { BlockAppear, BlockDisplay, BlockRenderRange, Locate } from "./base/enum";
import { Pattern } from "./pattern/index";
import { BaseComponent } from "./base/component";
import { TextEle } from "../common/text.ele";
import { dom } from "../common/dom";
import { ActionDirective, OperatorDirective } from "../history/declare";
import { Block$Seek } from "./seek";
import { BlockSelection } from "../selector/selection/selection";
import { prop } from "./factory/observable";
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
            for (var n in this.blocks) {
                if (Array.isArray(this.blocks[n]) && this.blocks[n].length > 0) return true;
            }
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

    remove() {
        if (!this.parent) return;
        var pbs = this.parentBlocks;
        if (Array.isArray(pbs) && pbs.exists(g => g === this)) {
            this.page.snapshoot.record(OperatorDirective.remove, {
                parentId: this.parent.id,
                childKey: this.parentKey,
                at: this.at,
                preBlockId: this.prev ? this.prev.id : undefined
            })
            pbs.remove(this);
            this.page.onAddUpdate(this.parent);
            delete this.parent;
        }
    }
    /***
     * 彻底的删除元素
     */
    async delete() {
        var pb = this.parentBlocks;
        if (Array.isArray(pb) && pb.exists(g => g === this)) {
            this.page.snapshoot.record(OperatorDirective.delete, {
                parentId: this.parent.id,
                childKey: this.parentKey,
                at: pb.findIndex(g => g === this),
                preBlockId: this.prev ? this.prev.id : undefined,
                data: await this.get()
            })
            this.parentBlocks.remove(this);
            this.page.onAddUpdate(this.parent);
            delete this.parent;
        }
    }
    /***
     * 移出元素，如果元素本身是布局的元素，那么此时的布局元结构是空的，那么可能会从里到外依次删除
     */
    async deleteLayout() {
        async function clearPanel(panel: Block) {
            if (panel.childs.length == 0) {
                if ((panel.isRow || panel.isCol) && !panel.isPart) {
                    var pa = panel.parent;
                    await panel.delete();
                    clearPanel(pa);
                }
            }
        }
        await clearPanel(this);
    }
    insertBefore(to: Block) {
        to.parent.append(this,
            to.at,
            to.parentKey
        );
    }
    insertAfter(to: Block) {
        to.parent.append(this,
            to.at + 1,
            to.parentKey
        );
    }
    append(block: Block, at?: number, childKey?: string) {
        if (typeof childKey == 'undefined') childKey = 'childs';
        var bs = this.blocks[childKey];
        if (typeof at == 'undefined') at = bs.length;
        if (block.parent && bs.exists(block) && block.at < at) {
            at -= 1;
        }
        block.remove();
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
    updateProps(props: Record<string, any>, range = BlockRenderRange.none) {
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
            if (range == BlockRenderRange.self)
                this.page.onAddUpdate(this);
            else if (range == BlockRenderRange.parent)
                this.page.onAddUpdate(this.parent)
            this.page.snapshoot.record(OperatorDirective.updateProp, {
                blockId: this.id,
                old: oldValue,
                new: newValue
            });
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
     * 查换当前容器里面末尾的内容元素
     */
    get visiblePitLastContent() {
        return this.findReverse(g => !g.isLayout);
    }
    isLoad = false;
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
                if (typeof this[pro] != 'undefined')
                    json[pro] = util.clone(this[pro]);
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
    viewComponent: typeof BaseComponent | ((props: any) => JSX.Element)
    view: BaseComponent<this>;
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
        var anchor = this.page.selector.explorer.createAnchor();
        anchor.block = this;
        if (anchor.isText) {
            anchor.at = 0;
        }
        return anchor;
    }
    get visibleBackAnchor() {
        var anchor = this.page.selector.explorer.createAnchor();
        anchor.block = this;
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
    get dragBlock(): Block {
        if (this.isLine) {
            var r = this.closest(g => !g.isLine);
            if (r.isPart) return r.dragBlock;
            else return r;
        }
        else if (this.isPart) {
            return this.partParent
        }
        else if (this.isRow) return;
        else if (this.isCol) return;
        else if (this.isArea) return;
        else return this;
    }
    get dropBlock(): Block {
        if (this.isLine) return;
        if (this.isPart) return;
        else if (this.isRow) return;
        else if (this.isCol) return;
        return this;
    }
    get visiblePre() {
        var current: Block = this;
        var prev = current.prev;
        while (true) {
            if (prev) {
                if (!prev.isLayout) return prev;
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
     * 如果是一个isPanel的block，那么需要确认当前的坐标是否处于子的block中，别外注意，如果坐标是点在当前的空白block中，可能归宿到视野子内容
     * @param point 坐标（当前坐标明确是处于当前的block中）
     */
    visibleAnchor(point: Point): Anchor {
        var part = this.visiblePoint(point);
        var anchor = this.page.selector.explorer.createAnchor();
        anchor.block = part;
        if (part.isText) {
            anchor.at = TextEle.getAt(part.textEl, point);
        }
        return anchor;
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
    async visibleDownCreateBlock(url: string, data: Record<string, any> = {}) {
        var row = this.closest(x => x.isRow);
        var newBlock = await this.page.createBlock('/row', {
            blocks: {
                childs: [
                    { url, ...data }
                ]
            }
        }, row.parent, row.at + 1);
        return newBlock;
    }
    @prop()
    content: string = '';
    get isEmpty() {
        return this.content ? false : true
    }
    get htmlContent() {
        return this.content;
        // return TextEle.getTextHtml(this.content)
    }
    updateContent(content: string, partName?: string) {
        this.content = content;
    }
    getBounds() {
        return TextEle.getBounds(this.el);
    }
    getVisibleBound() {
        return Rect.from(this.el.getBoundingClientRect());
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
    private dragOverTime;
    private lastPoint: Point;
    private overArrow: string;
    onDragOverStart() {
        dom(this.el).removeClass(g => g.startsWith('sy-block-drag-over'));
        if (this.dragOverTime) {
            clearTimeout(this.dragOverTime);
            this.dragOverTime = null;
        }
        this.overArrow = '';
        delete this.lastPoint;
    }
    onDragOver(point: Point) {
        var self = this;
        var bound = this.getVisibleBound();
        var el = this.el as HTMLElement;
        var arrow: string;
        if (this.lastPoint && this.lastPoint.nearBy(point, 3) && bound.conatin(point)
        ) {
            if (!this.dragOverTime) {
                self.overArrow = '';
                this.dragOverTime = setTimeout(() => {
                    self.overArrow = 'right';
                    dom(el).removeClass(g => g.startsWith('sy-block-drag-over'))
                    el.classList.add('sy-block-drag-over-' + self.overArrow);
                    self.page.selector.dropBlock = self;
                    self.page.selector.dropArrow = self.overArrow as any;
                }, 2e3);
            }
        }
        else {
            if (this.dragOverTime) {
                clearTimeout(this.dragOverTime);
                this.dragOverTime = null;
            }
            self.overArrow = '';
        }
        if (self.overArrow) return;
        if (point.x <= bound.left) {
            arrow = 'left';
        }
        else if (point.x >= bound.left + bound.width) {
            arrow = 'right';
        }
        else if (point.y <= bound.top + bound.height / 2) {
            arrow = 'up';
        }
        else if (point.y >= bound.top + bound.height / 2) {
            arrow = 'down';
        }
        dom(el).removeClass(g => g.startsWith('sy-block-drag-over'))
        el.classList.add('sy-block-drag-over-' + arrow);
        this.lastPoint = point.clone();
        this.page.selector.dropArrow = arrow as any;
        this.page.selector.dropBlock = this;
    }
    onDragLeave() {
        dom(this.el).removeClass(g => g.startsWith('sy-block-drag-over'));
        if (this.dragOverTime) {
            clearTimeout(this.dragOverTime);
            this.dragOverTime = null;
        }
        this.overArrow = '';
        delete this.lastPoint;
    }

    /***
     *用户输入
     */
    private inputTime;
    private currentLastInputText: string;
    /**
     * 用户一直输入内容,如果用户停留超过0.7秒，就记录
     */
    onStoreInputText(from: number, text: string, force: boolean = false, action?: () => Promise<void>) {
        if (this.inputTime) {
            clearTimeout(this.inputTime);
            delete this.inputTime;
        }
        var excute = async () => {
            this.page.snapshoot.declare(ActionDirective.onInputText);
            this.content = TextEle.getTextContent(this.textEl);
            this.page.snapshoot.record(OperatorDirective.updateTextReplace, {
                blockId: this.id,
                start: from,
                end: this.currentLastInputText ? from + this.currentLastInputText.length : from,
                text
            });
            this.currentLastInputText = text;
            if (typeof action == 'function') await action();
            this.page.snapshoot.store();
            if (this.inputTime) {
                clearTimeout(this.inputTime);
                delete this.inputTime;
            }
        }
        /***
            * 这里需要将当前的变化通知到外面，
            * 当然用户在输的过程中，该方法会不断的执行，所以通知需要加一定的延迟，即用户停止几秒钟后默认为输入
            */
        if (force == false) this.inputTime = setTimeout(async () => { await excute(); }, 7e2);
        else excute()
    }
    private deleteInputTime;
    private currentLastDeleteText: string;
    async onStoreInputDeleteText(from: number, text: string, force: boolean = false, action?: () => Promise<void>) {
        if (this.deleteInputTime) {
            clearTimeout(this.deleteInputTime);
            delete this.deleteInputTime;
        }
        var excute = async () => {
            var pa = this.page;
            pa.snapshoot.declare(ActionDirective.onInputText);
            this.content = TextEle.getTextContent(this.textEl);
            var size = this.currentLastDeleteText ? this.currentLastDeleteText.length : 0;
            pa.snapshoot.record(OperatorDirective.updateTextDelete, {
                blockId: this.id,
                start: from - size,
                end: from - text.length,
                text: text.slice(0, text.length - size)
            });
            this.currentLastDeleteText = text;
            if (typeof action == 'function') await action();
            pa.snapshoot.store();
            if (this.deleteInputTime) {
                clearTimeout(this.deleteInputTime);
                delete this.deleteInputTime;
            }
        }
        /***
            * 这里需要将当前的变化通知到外面，
            * 当然用户在输的过程中，该方法会不断的执行，所以通知需要加一定的延迟，即用户停止几秒钟后默认为输入
            */
        if (force == false) this.deleteInputTime = setTimeout(async () => { await excute() }, 7e2);
        else await excute();
    }
    onWillInput() {
        if (this.inputTime) {
            clearTimeout(this.inputTime);
            delete this.inputTime;
        }
        this.currentLastInputText = '';
        if (this.deleteInputTime) {
            clearTimeout(this.deleteInputTime);
            delete this.deleteInputTime;
        }
        this.currentLastDeleteText = '';
    }
    mounted(fn: () => void) {
        this.once('mounted', fn);
    }
    async onDelete() {
        this.page.snapshoot.declare(ActionDirective.onDelete);
        var pa = this.parent;
        await this.delete();
        if (pa) await pa.deleteLayout();
        this.page.snapshoot.store();
    }
    onUpdateProps(props: Record<string, any>, range = BlockRenderRange.none) {
        this.page.onRememberUpdate();
        this.page.snapshoot.declare(ActionDirective.onUpdateProps);
        this.updateProps(props, range);
        this.page.snapshoot.store();
        this.page.onExcuteUpdate();
    }
    get isTextContent() {
        return false;
    }
    /**
     * 文本依据选区裂变创建新的block
     * 返回当前选区的block
     */
    async onFissionCreateBlock(selection: BlockSelection) {
        var isText = this.isTextContent;
        var pattern = await this.pattern.cloneData();
        var selectionBeforeContent = '', selectionAfterContent = '', selectionContent = '';
        var content = this.content;
        var selBlock: Block;
        if (this == selection.start.block && this == selection.end.block) {
            //说明block包含选区
            selectionBeforeContent = content.substring(0, selection.start.at);
            selectionContent = content.substring(selection.start.at, selection.end.at);
            selectionAfterContent = content.substring(selection.end.at);
        }
        else if (this == selection.start.block) {
            //block后半部分是选区
            selectionBeforeContent = content.substring(0, selection.start.at);
            selectionContent = content.substring(selection.start.at);
        }
        else if (this == selection.end.block) {
            //block前半部分是选区
            selectionAfterContent = content.substring(selection.end.at);
            selectionContent = content.substring(0, selection.end.at);
        }

        if (isText) {
            if (selectionBeforeContent && selectionAfterContent) {
                //包含选区
                this.updateContent(selectionBeforeContent);
                selBlock = await this.page.createBlock('/text',
                    { content: selectionContent, pattern: pattern },
                    this.parent,
                    this.at + 1);
                await this.page.createBlock('/text',
                    { content: selectionAfterContent, pattern: pattern },
                    this.parent,
                    this.at + 2);
            }
            else if (selectionBeforeContent) {
                //后半部分是选区
                this.updateContent(selectionBeforeContent);
                selBlock = await this.page.createBlock('/text',
                    { content: selectionContent, pattern: pattern },
                    this.parent,
                    this.at + 1);
            }
            else if (selectionAfterContent) {
                //前半部分是选区
                this.updateContent(selectionAfterContent);
                selBlock = await this.page.createBlock('/text',
                    { content: selectionContent, pattern: pattern },
                    this.parent,
                    this.at);
            }
            else {
                selBlock = this;
            }
        }
        else {
            if (!selectionBeforeContent && !selectionAfterContent) {
                selBlock = this;
            }
            else {
                if (selectionBeforeContent) {
                    await this.page.createBlock('/text',
                        { content: selectionBeforeContent, pattern: pattern },
                        this,
                        this.childs.length);
                }
                if (selectionContent) {
                    selBlock = await this.page.createBlock('/text',
                        { content: selectionContent, pattern: pattern },
                        this,
                        this.childs.length);
                    console.log(selBlock, 'selblock...');
                }
                if (selectionAfterContent) {
                    await this.page.createBlock('/text',
                        { content: selectionAfterContent, pattern: pattern },
                        this,
                        this.childs.length);
                }
            }
        }
        return selBlock;
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
}
export interface Block extends Block$Seek { }
util.inherit(Block, Block$Seek);