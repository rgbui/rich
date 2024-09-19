
import { Events } from "../../util/events";
import { Point, Rect } from "../common/vector/point";
import { Page } from "../page";
import { BlockDisplay, BlockRenderRange } from "./enum";
import { Pattern } from "./pattern/index";
import { BlockView } from "./view";
import { Block$Seek } from "./partial/seek";
import { prop } from "./factory/observable";
import { Block$Event } from "./partial/on.event";
import { Block$Anchor } from "./partial/anchor";
import { Block$LifeCycle } from "./partial/left.cycle";
import { Block$Operator } from "./partial/operate";
import { BlockAppear, AppearAnchor } from "./appear";
import { Mix } from "../../util/mix";
import { TextContent } from "./element/text";
import { BlockChildKey, BlockUrlConstant } from "./constant";
import { CSSProperties } from "react";
import { PageLayoutType } from "../page/declare";
import { Matrix } from "../common/matrix";
import { Block$Board } from "./partial/board";
import { Polygon } from "../common/vector/polygon";
import { channel } from "../../net/channel";
import { GridMap } from "../page/grid";
import { ElementType, getElementUrl } from "../../net/element.type";
import { SnapshootBlockPos, SnapshootBlockPropPos } from "../history/snapshoot";
import lodash from "lodash";
import { AtomPermission } from "../page/permission";
import { util } from "../../util/util";
import { dom } from "../common/dom";
import "./style.less";
import { RefPageLink } from "../../extensions/link/declare";

export abstract class Block extends Events {
    constructor(page: Page) {
        super();
        this.__init_mixs();
        this.id = channel.query('/guid');
        this.date = new Date().getTime();
        this.page = page;
        this.pattern = new Pattern(this);
        if (typeof this._init == 'function') this._init();
        if (typeof this.init == 'function') this.init();
    }
    @prop()
    creater: string;
    @prop()
    createDate: number;
    @prop()
    editor: string;
    @prop()
    editDate: number;
    @prop()
    commentCount: number;
    /**
     * 建立栅格索引
     */
    gridMap: GridMap;
    get panelGridMap() {
        var c = this.closest(x => x.gridMap ? true : false);
        if (c) return c.gridMap;
        else return this.page.gridMap;
    }
    get panelGridMapNotSelf() {
        var c = this.closest(x => x.gridMap ? true : false, true);
        if (c) return c.gridMap;
        else return this.page.gridMap;
    }
    get panel() {
        return this.closest(x => x.isPanel);
    }
    get parentPanel() {
        return this.closest(x => x.isPanel && x !== this);
    }
    getScrollDiv() {
        if (this.el)
            return dom(this.el).findOverflowPanel()
    }
    parent: Block;
    url: string;
    page: Page;
    _id: string;
    get id() {
        var rb = this.parentSyncBlock;
        if (rb) return rb.id + '/' + this._id;
        return this._id;
    }
    set id(value) {
        if (typeof value != 'string') {
            value = channel.query('/guid');
        }
        this._id = value;
    }
    date: number;
    pattern: Pattern;
    syncBlockId: string;
    get syncBlock() {
        if (this.syncBlockId) return this;
        var rb = this.closest(x => x.syncBlockId ? true : false);
        return rb;
    }
    get parentSyncBlock() {
        return this.closest(x => x.syncBlockId ? true : false, true);
    }
    blocks: Record<string, Block[]> = { childs: [] };
    grid: { min: number[], max: number[], rect: Rect };
    /**
     * 初始化的一些数据，该数据只是初始化的参数
     * 最终的block不会存储它，
     * 比如创建一个表格块（该表格块需要提供一个模板ID,
     * 当创建表格时发现没有当前表格是空表格，
     * 那么如果此时有initialData，则会自动加载
     * ）
     */
    initialData: Record<string, any>;
    /**
     * 创建block的方式,访方式在初始创建时，
     * 可以触发一些操作
     */
    createSource: 'InputBlockSelector' | 'pageTurnLayout';
    __props: string[];
    getCurrentProps() {
        return this.__props;
    }
    get childs() {
        return this.blocks.childs;
    }
    get subChilds() {
        return this.blocks.subChilds || [];
    }
    get otherChilds() {
        return this.blocks.otherChilds || [];
    }
    get allChilds() {
        var keys = this.allBlockKeys;
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
            var keys = this.allBlockKeys;
            if (keys.exists(key => this.blocks[key].length > 0)) return true;
        }
        return false;
    }
    get parentBlocks(): Block[] {
        if (this.parent) {
            for (var n in this.parent.blocks) {
                if (this.parent.blocks[n].exists(g => g.id == this.id)) {
                    return this.parent.blocks[n];
                }
            }
        }
        else return this.page.views;
    }
    get parentKey(): BlockChildKey {
        if (this.parent) {
            var pb = this.parentBlocks;
            for (var n in this.parent.blocks) {
                if (this.parent.blocks[n] == pb) return n as BlockChildKey;
            }
        }
    }
    get allBlockKeys() {
        return [BlockChildKey.childs];
    }
    get hasSubChilds() {
        return this.allBlockKeys.includes(BlockChildKey.subChilds)
    }
    get at() {
        var bs = this.parentBlocks;
        if (!Array.isArray(bs)) {
            bs = [];
        }
        return bs.findIndex(g => g === this);
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
    /**
     * 当前元素下面的元素，注意在同一个ChildKey中
     */
    get nexts() {
        var pbs = this.parentBlocks;
        var at = this.at;
        return pbs.findAll((g, i) => i > at);
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
    viewComponent: typeof BlockView | ((props: any) => JSX.Element)
    view: BlockView<this>;
    asView<T>(): T {
        return this.view as T;
    }
    el: HTMLElement;
    childsEl: HTMLElement;
    get contentEl(): HTMLElement {
        return this.el;
    }
    get visibleStyle() {
        var style: CSSProperties = {};
        if (this.isFreeBlock) {
            style.position = 'absolute';
            style.zIndex = this.zindex;
            style.top = 0;
            style.left = 0;
            style.transformOrigin = '0% 0%';
            Object.assign(style, this.transformStyle);
        }
        else {
            style.position = 'relative';
            if (this.isBlock) {
                Object.assign(style, {
                    paddingTop: '0.2rem',
                    paddingBottom: '0.2rem',
                });
            }
            else if (this.isLine) {
                style.display = 'inline-block';
            }
        }
        var s = this.pattern.style;
        delete s.backgroundColor;
        Object.assign(style, s);
        return style;
    }
    get boxStyle() {
        var style: CSSProperties = {};
        if (this.isFreeBlock) {
            style.position = 'absolute';
            style.zIndex = this.zindex;
            style.top = 0;
            style.left = 0;
            style.transformOrigin = '0% 0%';
            Object.assign(style, this.transformStyle);
        }
        else {
            if (this.isBlock) {
                Object.assign(style, {
                    paddingLeft: '0.2rem',
                    paddingRight: '0.2rem',
                });
            }
        }
        var s = this.pattern.style;
        if (s.color) style.color = s.color;
        Object.assign(style, this.pattern.style);
        var s = this.pattern.style;
        if (s.backgroundColor) style.backgroundColor = s.backgroundColor;
        style.borderRadius = 4;
        return style;
    }
    get contentStyle() {
        var style: CSSProperties = {
            paddingTop: '0.3rem',
            paddingLeft: '0.2rem',
            paddingRight: '0.2rem',
            paddingBottom: '0.3rem'
        };
        if (this.isFreeBlock) {
            style.paddingTop = 0;
            style.paddingLeft = 0;
            style.paddingRight = 0;
            style.paddingBottom = 0;
        }
        if (this.isLine) {
            style = {
                paddingTop: 0,
                paddingLeft: 0,
                paddingRight: 0,
                paddingBottom: 0
            }
        }
        var s = this.pattern.style;
        if (s.backgroundColor) style.backgroundColor = s.backgroundColor;
        style.borderRadius = 4;
        return style;
    }
    protected display: BlockDisplay;
    /**
     * 布局用的block，该block只具有特定的调节布局效果，本身没有任何内容及样式可以设置
     * 它是不显现的
     */
    get isLayout(): boolean {
        if (this.isRow || this.isCol || this.isView) return true;
        else return false;
    }
    get isLine(): boolean {
        return this.display == BlockDisplay.inline;
    }
    get isLineSolid(): boolean {
        if (this.isLine) {
            if (this.appearAnchors.exists(g => g.appear == BlockAppear.solid)) return true;
        }
        return false;
    }
    get isBlock(): boolean {
        return this.display !== BlockDisplay.inline
    }
    /**
     * 判断是否是用户可以操作，关注的内容块
     * 如表格的单元格就不是用户关注的内容块
     * 如tab里面的page 就不是 用户关注的内容块
     */
    get isContentBlock() {
        return this.isBlock && !this.isPart && !this.isLayout && !this.isCell
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
    get isView(): boolean {
        return false;
    }
    get isPanel() {
        return this.gridMap ? true : false
    }
    get isCell(): boolean {
        return false;
    }
    /**
     * 表示该块接受其它块拖到这里
     */
    get isAllowDrop(): boolean {
        return true;
    }
    /**
     * 表示块是否可以拖动
     */
    get isCanDrag() {
        return true;
    }
    /**
    * 判断该块是否接受dragBlocks拖到这里
    */
    isAllowDrops(dragBlocks: Block[]) {
        if (this.isFreeBlock) return false;
        if (this.isAllowDrop == false) return false;
        return true;
    }
    canDropDirections() {
        return null;
    }
    /**
     * 表示块是否可以拖到当前这个dropBlock这里
     * @param dropBlock 
     * @returns 
     */
    isCanDropHere(dropBlock: Block) {
        return true;
    }

    get isEmptyCell(): boolean {
        if (this.childs.length == 0) return true;
        else if (this.childs.length == 1) {
            if (this.childs.first().isContentEmpty) return true;
        }
        return false;
    }
    partName: string;
    partParentId: string;
    get isPart(): boolean {
        if (typeof this.partName == 'string') return true;
        else return false;
    }
    get partParent(): Block {
        if (this.partParentId) return this.page.find(x => x.id == this.partParentId)
        else return this.closest(x => !x.isPart);
    }
    @prop()
    content: string = '';
    getBlockContent() {
        if (this.childs.length > 0) return this.childs.map(c => c.content).join("");
        else return this.content;
    }
    /**
     * 是否可以自动删除
     */
    get isCanAutomaticallyDeleted() {
        if (this.childs.length == 1) {
            if (this.childs.first().isContentEmpty) return true;
        }
        else if (this.childs.length == 0) {
            if (this.appearAnchors.length == 1) {
                if (this.firstElementAppear.isEmpty) return true;
            }
        }
        return false;
    }
    /**
     * 回车换行时，是否创建新行
     */
    get isEnterCreateNewLine() {
        return true;
    }
    /**
     * 是否允许输入换行符，一般是通过shift+enter键入，
     * 但像标题，可能不允许输入换行
     */
    get isDisabledInputLine() {
        return false;
    }
    /**
     * 回退时，最后一步是否转换成普通文本
     */
    get isBackspaceAutomaticallyTurnText() {
        return false;
    }
    /**
     * 判断当前块是否是可视的
     * 在一些复杂的块内，块有可以被折叠了，如togglelist块，如折叠的大标题
     * 被tab块中page不显示了，那么这个块就不是可视的
     */
    get isVisible() {
        return this.closest(x => x.parent && x.parent.isRelativeVisible(x) == false) ? false : true
    }
    /**
     * 判断子块相对于当前的父块，是否处于显示状态
     * @param sub 
     * @returns 
     */
    isRelativeVisible(sub: Block) {
        return true;
    }
    getVisibleBound() {
        if (!this.el) {
            console.log(this);
            return null;
        }
        return Rect.fromEle(this.el)
    }
    getVisibleHandleCursorPoint() {
        var bound = this.getVisibleContentBound()
        if (bound) {
            var pos = Point.from(bound);
            pos = pos.move(0, 5 + util.remToPx(this.page.lineHeight) / 2);
            return pos;
        }
    }
    isVisiblePlus() {
        return true;
    }
    getVisibleContentBound() {
        var e = this.contentEl;
        if (e) return Rect.fromEle(e);
        return this.getVisibleBound();
    }
    getVisiblePanelBound() {
        return this.getVisibleBound()
    }
    getVisiblePolygon() {
        var { width, height } = this.fixedSize;
        var rect = new Rect(0, 0, width, height);
        var gm = this.globalWindowMatrix;
        var poly = new Polygon(...rect.points.map(p => {
            return gm.transform(p);
        }));
        return poly;
    }
    getGlobalPosition() {
        var gm = this.globalWindowMatrix;
        return gm.transform(new Point(0, 0));
    }
    getTranslation() {
        return this.matrix.getTranslation();
    }
    get isTextContent() {
        return false;
    }
    get isTextSpan() {
        return this.url == BlockUrlConstant.TextSpan
    }
    /**
     * 是否为复合的块
     * 如tab块、table块
     */
    isComposite: Boolean = false;
    get isContentEmpty() {
        if (this.isPart) return false;
        if (this.isLine) {
            if (this.content == '' && !this.appearAnchors.some(s => s.isSolid)) return true;
        }
        else {
            if (this.isTextBlock) {
                if (!(Array.isArray(this.subChilds) && this.subChilds.length > 0)) {
                    if (this.childs.length == 0 && this.content == '') return true;
                    if (this.childs.length > 0 && this.childs.every(c => c.isLine && c.content == '')) return true;
                }
            }
        }
        return false;
    }
    get asTextContent() {
        if (this.isTextContent)
            return (this as any) as TextContent
        else return null;
    }
    get blockUrl() {
        return this.page.pageInfo.url + '#' + this.id;
    }
    get elementUrl() {
        if (this.syncBlockId) return getElementUrl(ElementType.SyncBlock, this.syncBlockId);
        else return getElementUrl(ElementType.Block, this.page.pageInfo?.id, this.id);
    }
    /**
     * 判断当前块是否为文本块
     */
    get isTextBlock() {
        if (this.isPart) return false;
        if (this.isLayout || this.isPanel) return false;
        if (this.appearAnchors.some(s => s.isText)) return true;
        if (this.childs.length > 0 && this.childs.some(s => s.isTextContent || s.isLineSolid)) return true;
        if ([BlockUrlConstant.TextSpan,
        BlockUrlConstant.Head,
        BlockUrlConstant.Todo,
        BlockUrlConstant.Callout,
        BlockUrlConstant.Quote,
        BlockUrlConstant.List
        ].includes(this.url as any)) return true;
        return false;
    }
    __appearAnchors: AppearAnchor[] = [];
    get appearAnchors() {
        return this.__appearAnchors;
    }
    getAppear(prop: string) {
        return this.appearAnchors.find(g => g.prop == prop);
    }
    get firstElementAppear() {
        return this.appearAnchors.first();
    }
    get lastElementAppear() {
        return this.appearAnchors.last();
    }
    get isSupportAnchor() {
        if (this.isLayout) return false;
        if (this.appearAnchors.length > 0) return true;
        return false;
    }
    /**
     * 是否允许通过鼠标点击来创建anchor
     * 比如todo中的checkbox，点击的时候就没有必要创建anchor
     * @param event 
     * @returns 
     */
    isAllowMouseAnchor(event: MouseEvent) {
        return true;
    }
    get isSupportTextStyle() {
        return true;
    }
    /**
     * 标记当前块是否处于已渲染的状态
     * 原isMounted可能与react的isMounted冲突
     */
    isMed: boolean = false;
    /**
     * 标记当前块是否更新，
     * 在block view中决定 shouldComponentUpdate是否更新
     */
    needUpdate: boolean = false;
    /**
     * 这里主要是判断当前的rect,point是否与当前块的视野内相交
     * 注意，如果有子块，那么只表示与子块相交，不是与父块视野相关
     * 一般只是简单的判断即可，对于各别的可继承使用
     * @param rect 
     * @returns 
     */
    isCrossBlockVisibleArea(rect: Rect | Point) {
        if (this.hasSubChilds && !this.isFreeBlock) {
            var bound = this.getVisibleBound();
            var contentEle = this.contentEl;
            var cb = Rect.fromEle(contentEle as HTMLElement);
            if (bound && rect instanceof Rect && bound.isCross(rect)) {
                if (cb.isCross(rect)) return true;
                else return false;
            }
            else if (bound && rect instanceof Point && bound.contain(rect)) {
                if (cb.contain(rect)) return true;
                else return false;
            }
            return false;
        }
        else {
            var bound = this.getVisibleBound();
            if (bound && rect instanceof Rect && bound.isCross(rect)) {
                return true;
            }
            else if (bound && rect instanceof Point && bound.contain(rect)) {
                return true;
            }
            return false;
        }
    }
    async forceManualUpdate(isSub: boolean = false, isSubAll: boolean = false) {
        if (isSubAll)
            this.each(c => {
                c.forceManualUpdate()
            })
        if (isSub) {
            for (let b in this.blocks) {
                for (let bb of this.blocks[b]) {
                    bb.forceManualUpdate();
                }
            }
        }
        return new Promise((resolve, reject) => {
            if (this.view && this.isMed) {
                this.appearAnchors.forEach(aa => {
                    aa.updateViewValue();
                })
                var seq = this.view.state.seq + 1;
                this.needUpdate = true;
                this.view.setState({ seq: seq }, () => {
                    resolve(true);
                })
            }
            else {
                if (this.view && this.isMed == false) {
                    console.warn(' may be is error,block is not mounted', this.id, this.url)
                }
                resolve(true);
            }
        })
    }
    isBefore(block: Block) {
        var pos = this.el.compareDocumentPosition(block.el);
        if (pos == 4 || pos == 20) {
            return true
        }
        return false
    }
    addBlockSelect() {
        this.el.classList.add('shy-block-selected');
        return this.el;
    }
    /**
     * 获取当前块的操作把手的块
     * 例如line text块把手放在外面的textspan块
     */
    get handleBlock() {
        if (this.isPart) {
            return this.closest(x => !x.isPart && !x.isLayout);
        }
        var r = this.closest(x => x.isContentBlock);
        if (r) return r;
        return null;
    }
    get isShowHandleBlock() {
        return true;
    }
    /**
     * 可以拖放block的block
     */
    get dropOverBlock() {
        if (this.isLine) {
            return this.closest(x => x.isContentBlock)
        }
        return this;
    }
    get isPageLastBlock() {
        if (this.parent == this.page.views.last()) {
            if (!this.next) return true;
        }
        return false;
    }
    get isFrame() {
        return this.url == BlockUrlConstant.Frame
    }
    get isMind() {
        return this.url == BlockUrlConstant.Mind;
    }
    get isBoardBlock() {
        return this.url == BlockUrlConstant.Board || this.url == BlockUrlConstant.Frame || (this.url == BlockUrlConstant.CardBox && (this as any).board == true);
    }
    get frameBlock(): Block {
        var r = this.closest(x => x.isBoardBlock);
        if (r) return r;
        else {
            if (this.page.pageLayout.type == PageLayoutType.board) {
                return this.page.getPageFrame();
            }
        }
        return null;
    }
    /***
     * 
     * 判断是否为自由布局的block
     */
    get isFreeBlock() {
        if (this.isPart) return false;
        if (this.isLine) return false;
        if (this.isFrame) return true;
        if (this.isBoardBlock) return false;
        if (this.url == BlockUrlConstant.BoardPageCard) return true;
        if (this.closest(g => g.url == BlockUrlConstant.BoardPageCard)) return false;
        var table = this.closest(x => x.url == BlockUrlConstant.Table);
        if (table && table !== this) return false;
        if (this.page.pageLayout.type == PageLayoutType.board) return true;
        return this.closest(x => x.isBoardBlock) ? true : false;
    }
    /**
     * 坐标系相对的块，
     * 没有就是相对于页面
     */
    get relativeBoardBlock() {
        var rb = this.closest(x => x.isBoardBlock || x.isMind || x.url == BlockUrlConstant.Group, true);
        if (rb) return rb;
    }
    @prop()
    matrix = new Matrix();
    private _childsOffsetMatrix: Matrix;
    get childsOffsetMatrix() {
        if (typeof this._childsOffsetMatrix == 'undefined') this._childsOffsetMatrix = new Matrix();
        return this._childsOffsetMatrix;
    }
    set childsOffsetMatrix(value: Matrix) {
        this._childsOffsetMatrix = value;
    }
    /**
     * 相对窗体的matrix
     */
    get globalWindowMatrix() {
        return this.page.windowMatrix.appended(this.globalMatrix);
    }
    get globalMatrix(): Matrix {
        var rb = this.relativeBoardBlock;
        if (rb) return rb.globalMatrix.appended(this.currentMatrix).appended(this.moveMatrix).appended(this.childsOffsetMatrix)
        else return this.page.matrix.appended(this.currentMatrix).appended(this.moveMatrix).appended(this.childsOffsetMatrix);
    }
    get selfMatrix(): Matrix {
        return new Matrix()
    }
    get contentMatrix() {
        return new Matrix()
    }
    get currentMatrix(): Matrix {
        return this.matrix.appended(this.selfMatrix)
    }
    get transformStyle() {
        if (!(this.matrix instanceof Matrix)) {
            console.log(this);
        }
        if (!this.matrix) return new Matrix().getCss()
        var ma = this.currentMatrix.appended(this.moveMatrix).appended(this.childsOffsetMatrix);
        return ma.getCss();
    }
    /**
     * 
     * @param visiblePx 视觉上的距离值
     * @returns 返回最终渲染的值
     */
    realPx(visiblePx: number) {
        // if (!this.page.viewEl) return visiblePx;
        return visiblePx / this.globalMatrix.getScaling().x;
    }
    visiblePx(realPx: number) {
        // if (!this.page.viewEl) return realPx;
        return realPx * this.globalMatrix.getScaling().x
    }
    /**
     * 运行的move matrix
     */
    moveMatrix = new Matrix();
    @prop()
    fixedWidth: number = 100;
    @prop()
    fixedHeight: number = 100;
    @prop()
    zindex: number = 1000;
    get fixedSize() {
        return {
            width: this.fixedWidth,
            height: this.fixedHeight
        }
    }
    /**
     * 是否同比例缩放
     */
    @prop()
    isScale: boolean = false;
    @prop()
    refLines: string[] = [];
    _lines: Block[];
    get lines() {
        if (Array.isArray(this._lines)) return this._lines;
        this._lines = this.page.findAll(x => this.refLines.includes(x.id)) as Block[];
        return this._lines;
    }
    @prop()
    locker: { lock: boolean, date: number, userid?: string } = { lock: false, date: Date.now() };
    get isGroup() {
        return this.url == BlockUrlConstant.Group;
    }
    get isLock() {
        if (this.locker?.lock) return true;
    }
    /**
     * 标记，主要是标记block用，没有其它什么作用
     */
    mark: string;
    @prop()
    refBlockId: string;
    get refBlock() {
        return this.page.find(g => g.id == this.refBlockId)
    }
    referenceBlockers: Block[] = [];
    registerReferenceBlocker(block: Block) {
        if (!this.referenceBlockers.some(s => s.id == block.id)) {
            this.referenceBlockers.push(block);
        }
    }
    cancelReferenceBlocker(block: Block) {
        this.referenceBlockers.remove(g => g.id == block.id);
    }
    async onNotifyPageReferenceBlocks() {
        var r = this.referenceBlockers.find(g => g.url == '/data-grid/paging');
        if (r) {
            r.onSyncReferenceBlock();
        }
    }
    async onNotifyReferenceBlocks() {
        await this.referenceBlockers.eachAsync(async b => {
            await b.onSyncReferenceBlock()
        })
    }
    async onSyncReferenceBlock() {
    }
    isCanEdit() {
        return this.page.isCanEdit;
    }
    isAllow(...ps: AtomPermission[]) {
        return this.page.isAllow(...ps);
    }
    getBoardRelativePoint(point: Point) {
        if (this.page.isBoard || this.isFreeBlock || this.isBoardBlock)
            return this.globalMatrix.transform(point);
        else if (this.el) return point.relative(Rect.fromEle(this.el).leftTop);
    }
    getBoardRelativeRect(rect: Rect) {
        if (this.page.isBoard || this.isFreeBlock || this.isBoardBlock)
            return new Rect(this.globalMatrix.transform(rect.leftBottom), this.matrix.transform(rect.rightBottom))
        else if (this.el) return rect.relative(Rect.fromEle(this.el).leftTop)
    }
    getInverseRect(rect: Rect): Rect {
        if (this.page.isBoard || this.isFreeBlock || this.isBoardBlock)
            return new Rect(this.globalMatrix.inverseTransform(rect.leftBottom), this.matrix.inverseTransform(rect.rightBottom))
        else if (this.el) { var n = rect.clone(); n.moveTo(Rect.fromEle(this.el).leftTop); return n; }
    }
    get pos(): SnapshootBlockPos {
        return {
            blockId: this.id,
            // pageId: this.page.id,
            parentId: this.parent?.id || undefined,
            childKey: this.parentKey,
            at: this.at
        }
    }
    getPropPos(prop: string) {
        var pr = this.pos as SnapshootBlockPropPos;
        pr.prop = prop;
        return pr;
    }
    getArrayItemPos(arrayProp: string, item?: any) {
        var pr = this.pos as SnapshootBlockPropPos;
        pr.prop = arrayProp;
        var arr = lodash.get(this, arrayProp);
        var at = item ? arr.find(g => g === item) : -1;
        if (at > -1) {
            pr.arrayAt = at;
            pr.arrayNextId = arr[at + 1]?.id;
            pr.arrayPrevId = arr[at - 1]?.id;
        }
        return pr;
    }
    onLazyUpdateProps = lodash.debounce(async (props, options?: {
        range?: BlockRenderRange;
        merge?: boolean;
        syncBlock?: Block;
        cb?: () => Promise<void>
    }) => {
        await this.onUpdateProps(props, {
            range: options?.range,
            merge: options?.merge
        })
        if (typeof options.cb == 'function')
            await options.cb();
    }, 700)
    get isCanEmptyDelete() {
        return true
    }
    /**
     * 引用
     * 双链
     * 标签
     * 评论
     * 时间
     * 提及
     */
    refLinks: RefPageLink[];
    getUrl() {
        return this.url;
    }
    /**
     * 获取当前块的innerPannelBlock
     * 一般是自身
     * 但如tab块，则是当前展示的page块
     * @returns 
     */
    getInnerPanelBlock() {
        return this as Block;
    }
    blockLoadStatus: {
        loading: boolean,
        isSuccessfully: boolean,
        isError: boolean,
        errorData: Error
    } = {
            loading: false,
            isSuccessfully: false,
            isError: false,
            errorData: null
        };
    /**
     * 获取当前块是否处在group中
     */
    get groups() {
        return this.parents(x => x.url == BlockUrlConstant.Group && x !== this)
    }
    get outGroup() {
        return this.groups.last();
    }
}
export interface Block extends Block$Seek { }
export interface Block extends Block$Event { }
export interface Block extends Block$Anchor { }
export interface Block extends Block$LifeCycle { }
export interface Block extends Block$Operator { }
export interface Block extends Block$Board { }
export interface Block extends Mix { }
Mix(Block, Block$Seek, Block$Event, Block$Anchor, Block$Board, Block$LifeCycle, Block$Operator)

