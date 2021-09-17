
import { Events } from "../../util/events";
import { util } from "../../util/util";
import { Point, Rect } from "../common/point";
import { Page } from "../page";
import { BlockDisplay } from "./enum";
import { Pattern } from "./pattern/index";
import { BlockView } from "./view";
import { TextEle } from "../common/text.ele";
import { Block$Seek } from "./partial/seek";
import { prop } from "./factory/observable";
import { TemporaryPurpose } from "../page/partial/declare";
import "./style.less";
import { Block$Event } from "./partial/on.event";
import { Block$Anchor } from "./partial/anchor";
import { Block$LifeCycle } from "./partial/left.cycle";
import { Block$Operator } from "./partial/operate";
import { BlockAppear, AppearAnchor } from "./appear";
import { Mix } from "../../util/mix";
import { TextContent } from "./element/text";
export abstract class Block extends Events {
    constructor(page: Page) {
        super();
        this.__init_mixs();
        this.id = util.guid();
        this.date = new Date().getTime();
        this.page = page;
        this.pattern = new Pattern(this);
        if (typeof this.init == 'function') this.init();
    }
    parent: Block;
    url: string;
    page: Page;
    id: string;
    date: number;
    pattern: Pattern;
    blocks: Record<string, Block[]> = { childs: [] };
    /**
     * 初始化的一些数据，该数据只是初始化的参数
     * 最终的block不会存储它，
     * 比如创建一个表格块（该表格块需要提供一个模板ID,
     * 当创建表格时发现没有当前表格是空表格，
     * 那么如果此时有initialData，则会自动加载
     * ）
     */
    initialData: Record<string, any>;
    __props: string[];
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
    get hasVisibleChilds() {
        return this.hasChilds;
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
    viewComponent: typeof BlockView | ((props: any) => JSX.Element)
    view: BlockView<this>;
    el: HTMLElement;
    childsEl: HTMLElement;
    get visibleStyle() {
        var style: Record<string, any> = {};
        if (this.isBlock) {
            Object.assign(style, {
                width: ((this as any).widthPercent || 100) + '%'
            });
            Object.assign(style, {
                padding: '3px 2px'
            })
        }
        Object.assign(style, this.pattern.style);
        return style;
    }
    get visibleHeadAnchor() {
        return this.page.kit.explorer.createAnchor(this);
    }
    get visibleBackAnchor() {
        return this.page.kit.explorer.createBackAnchor(this, -1);
    }
    protected display: BlockDisplay;
    /**
     * 布局用的block，该block只具有特定的调节布局效果，本身没有任何内容可以设置
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
        return this.display == BlockDisplay.block;
    }
    /**
     * 是否为内容block
     * 
     */
    get isVisibleContentBlock() {
        if (this.isRow || this.isView || this.isCol || this.isLine) return false;
        else return true;
    }
    get visibleContentBlock() {
        if (this.isLine) return this.closest(x => x.isVisibleContentBlock);
        else if (this.isVisibleContentBlock) return this;
        else if (this.isRow || this.isView || this.isCol) {
            var r = this.find(x => x.isVisibleContentBlock);
            if (r) return r;
        }
        return null;
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
    partName: string;
    partParentId: string;
    get isPart(): boolean {
        if (typeof this.partName == 'string') return true;
        else return false;
    }
    get partParent(): Block {
        if (this.partParentId)
            return this.page.find(x => x.id == this.partParentId)
        else return this.closest(x => !x.isPart);
    }
    @prop()
    content: string = '';
    /**
     * 是否可以自动删除
     */
    get isCanAutomaticallyDeleted() {
        return (this.isOnlyElementAppear && this.firstElementAppear.isEmpty && this.firstElementAppear.isText) && !this.isPart && !this.hasChilds;
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
    get isTextContent() {
        return false;
    }
    get asTextContent() {
        if (this.isTextContent)
            return (this as any) as TextContent
        else return null;
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
    __appearAnchors: AppearAnchor[] = [];
    get appearAnchors() {
        return this.__appearAnchors;
    }
    get firstElementAppear() {
        return this.appearAnchors.first();
    }
    get isOnlyElementAppear() {
        return this.appearAnchors.length == 1;
    }
    get isOnlyElementText() {
        return this.isOnlyElementAppear && this.firstElementAppear.isText;
    }
    get isOnlyElementSolid() {
        return this.isOnlyElementAppear && this.firstElementAppear.isSolid;
    }
    get isSupportAnchor() {
        if (this.isLayout) return false;
        if (this.appearAnchors.length > 0)
            return true;
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
    isCrossElementAppear(rect: Rect | Point) {
        var es = this.appearAnchors;
        for (var i = 0; i < es.length; i++) {
            var e = es[i];
            var bound = Rect.fromEle(e.el);
            if (rect instanceof Rect)
                if (bound.isCross(rect)) {
                    return true;
                }
                else if (rect instanceof Point) {
                    if (bound.conatin(rect)) return true;
                }
        }
        return false;
    }
}
export interface Block extends Block$Seek { }
export interface Block extends Block$Event { }
export interface Block extends Block$Anchor { }
export interface Block extends Block$LifeCycle { }
export interface Block extends Block$Operator { }
export interface Block extends Mix { }
Mix(Block, Block$Seek, Block$Event, Block$Anchor, Block$LifeCycle, Block$Operator)

