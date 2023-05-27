
import React, { CSSProperties } from 'react';
import ReactDOM from 'react-dom';
import "./style.less";
import { Events } from "../../util/events";
import { util } from "../../util/util";
import { View } from "../block/element/view";
import { PageEvent } from "./partial/event";
import { HistorySnapshoot } from '../history/snapshoot';
import { Block } from '../block';
import { KeyboardPlate } from '../common/keys';
import { Page$Seek } from './partial/seek';
import { PageView } from './view';
import { UserAction } from '../history/action';
import { DropDirection } from '../kit/handle/direction';
import { PageDirective } from './directive';
import { Mix } from '../../util/mix';
import { Page$Cycle } from './partial/life.cycle';
import { Page$Operator } from './partial/operator';
import { LinkPageItem, PageLayoutType, PageVersion } from './declare';
import { Point, Rect } from '../common/vector/point';
import { GridMap } from './grid';
import { Matrix } from '../common/matrix';
import { PageContextmenu } from './partial/contextmenu';
import { Kit } from '../kit';
import { channel } from '../../net/channel';
import { TableSchema } from '../../blocks/data-grid/schema/meta';
import { Title } from '../../blocks/page/title';
import { AppearAnchor } from '../block/appear';

import { ElementType, parseElementUrl } from '../../net/element.type';
import { BlockUrlConstant } from '../block/constant';
import lodash from 'lodash';
import { ActionDirective } from '../history/declare';
import { PageLayout } from '../../extensions/layout';
import { isMobileOnly } from "react-device-detect";
import { BoxFillType, BoxStyle } from '../../extensions/doc.card/declare';
import { dom } from '../common/dom';
import { DataGridView } from '../../blocks/data-grid/view/base';

export class Page extends Events<PageDirective>{
    root: HTMLElement;
    viewEl: HTMLElement;
    contentEl: HTMLElement;
    id: string;
    date: number;
    readonly: boolean = false;
    sourceItemId: string;
    version: PageVersion;
    constructor(options?: {
        id?: string,
        readonly?: boolean

    }) {
        super();
        this.version = PageVersion.v1;
        this.__init_mixs();
        if (typeof options == 'object') Object.assign(this, util.clone(options));
        if (typeof this.id == 'undefined') this.id = util.guid();
        if (typeof this.date == 'undefined') this.date = new Date().getTime();
        this.init();
    }
    get user() {
        return channel.query('/query/current/user');
    }
    kit: Kit = new Kit(this);
    snapshoot = new HistorySnapshoot(this)
    pageLayout: { layout?: PageLayout, type: PageLayoutType };
    views: View[] = [];
    view: PageView;
    keyboardPlate: KeyboardPlate = new KeyboardPlate();
    isFocus: boolean = false;
    pageVisibleWidth: number;
    pageVisibleHeight: number;
    requireSelectLayout: boolean = true;
    gridMap: GridMap;
    matrix: Matrix = new Matrix();
    isFullWidth: boolean = true;
    smallFont: boolean = false;
    nav: boolean = false;
    autoRefPages: boolean = false;
    autoRefSubPages: boolean = true;
    addedSubPages: string[] = [];
    showMembers: boolean = false;
    /**
     * 页面格式 
     * 仅文档、数据表格起作用
     */
    onlyDisplayContent: boolean = false;
    isPageContent: boolean = false;
    get windowMatrix() {
        var rect = Rect.fromEle(this.viewEl);
        var matrix = new Matrix();
        matrix.translate(rect.left, rect.top);
        return matrix;
    }
    get globalMatrix() {
        return this.windowMatrix.appended(this.matrix);
    }
    render(panel: HTMLElement, options?: { width?: number, height?: number }) {
        var el = panel.appendChild(document.createElement('div'));
        this.root = el;
        if (options?.width) this.pageVisibleWidth = options?.width;
        if (options?.height) this.pageVisibleHeight = options?.height;
        ReactDOM.render(<PageView page={this}></PageView>, this.root);
    }
    layout(options: { width?: number, height?: number }) {
        this.pageVisibleWidth = options?.width;
        this.pageVisibleHeight = options?.height;
        this.view.forceUpdate()
    }
    fragment: DocumentFragment;
    isOff: boolean = false;
    cacheFragment() {
        try {
            if (!this.fragment) this.fragment = document.createDocumentFragment();
            if (!this.fragment.contains(this.root))
                this.fragment.appendChild(this.root);
            this.isOff = true;
            this.kit.picker.onCancel();
        }
        catch (ex) {
            console.error(ex);
        }
    }
    destory() {
        this.kit.picker.onCancel();
        ReactDOM.unmountComponentAtNode(this.root);
        this.root.remove();
    }
    renderFragment(panel: HTMLElement, options?: { width?: number, height?: number }) {
        try {
            if (!this.root) {
                this.render(panel, options);
                return;
            }
            panel.appendChild(this.root);
            this.view.observeScroll();
            this.view.AutomaticHandle();
            var nextAction = () => {
                if (this.pageInfo) {
                    if (!this.pageInfo.text) {
                        var title = this.find(g => g.url == BlockUrlConstant.Title) as Title;
                        if (title) {
                            if (this.isCanEdit)
                                title.onEmptyTitleFocusAnchor();
                        }
                    }
                }
                this.isOff = true;
                var rs = this.findAll(g => [
                    BlockUrlConstant.DataGridBoard,
                    BlockUrlConstant.DataGridCalendar,
                    BlockUrlConstant.DataGridGallery,
                    BlockUrlConstant.DataGridList,
                    BlockUrlConstant.DataGridTable
                ].includes(g.url as any));
                for (let i = 0; i < rs.length; i++) {
                    (rs[i] as DataGridView).onReloadData();
                }
            }
            if (options && (options?.width !== this.pageVisibleWidth || options?.height !== this.pageVisibleHeight)) {
                this.pageVisibleWidth = options?.width;
                this.pageVisibleHeight = options?.height;
                this.view.forceUpdate(() => nextAction())
            } else nextAction();
        }
        catch (ex) {
            console.log(panel, this.root);
            console.error(ex);
        }
    }
    getPageFrame() {
        return this.views[0];
    }
    getRelativePoint(point: Point) {
        return this.globalMatrix.transform(point);
    }
    getRelativeRect(rect: Rect) {
        return new Rect(this.globalMatrix.transform(rect.leftTop), this.globalMatrix.transform(rect.rightBottom))
    }
    get isBoard() {
        return this.pageLayout?.type == PageLayoutType.board;
    }
    get scale() {
        return this.matrix.getScaling().x;
    }
    schema: TableSchema;
    openSource: 'page' | 'slide' | 'dialog' | 'snap' | 'popup' = 'page';
    getScreenStyle() {
        var style: CSSProperties = {};
        if (isMobileOnly) {
            style.paddingLeft = 20
            style.paddingRight = 20
        }
        else {
            if (this.isSupportScreen) {
                var isFull: boolean = this.isFullWidth;
                if (isFull) {
                    style.paddingLeft = 80;
                    style.paddingRight = 80;
                }
                else {
                    style.width = 800;
                    style.margin = '0 auto';
                }
            }
        }
        return style;
    }
    get pageInfo() {
        return this._pageItem;
    }
    onceStopRenderByPageInfo: boolean = false;
    _pageItem: LinkPageItem;
    set pageInfo(pageInfo: LinkPageItem) {
        this._pageItem = pageInfo;
    }
    canEdit: boolean = false;
    get isCanEdit() {
        if (this.readonly) return false;
        if (this.pageLayout?.type == PageLayoutType.dbPickRecord) return false;
        return this.canEdit;
    }
    /**
     * 是否支持宽屏及窄屏的切换
     */
    get isSupportScreen() {
        return [
            PageLayoutType.db,
            PageLayoutType.formView,
            PageLayoutType.recordView,
            PageLayoutType.docCard,
            PageLayoutType.doc

        ].includes(this.pageLayout?.type || PageLayoutType.doc)
    }
    /**
     * 是否支持用户自定义封面
     */
    get isSupportCover() {
        return [PageLayoutType.db, PageLayoutType.formView, PageLayoutType.doc].includes(this.pageLayout?.type || PageLayoutType.doc)
    }
    async forceUpdate() {
        return new Promise((resolve, reject) => {
            if (this.view)
                return this.view.forceUpdate(() => {
                    resolve(true);
                })
            else resolve(false)
        })
    }
    get fontSize() {
        if (this.pageLayout?.type == PageLayoutType.docCard) return this.smallFont ? 16 : 18
        return this.smallFont ? 14 : 16
    }
    get lineHeight() {
        if (this.pageLayout?.type == PageLayoutType.docCard) return this.smallFont ? 26 : 30
        return this.smallFont ? 23 : 26
    }
    private _pe: {
        type: ElementType;
        id: string;
        id1: string;
        id2: string;
    }
    get pe() {
        if (typeof this._pe == 'undefined')
            this._pe = parseElementUrl(this.elementUrl) as any;
        return this._pe;
    }
    customElementUrl: string;
    get elementUrl() {
        if (this.customElementUrl) return this.customElementUrl;
    }
    onLazyAction = lodash.debounce(
        async (directive: ActionDirective | string,
            fn: () => Promise<void>,
            options?: { block?: Block, disabledStore?: boolean }
        ) => {
            return this.onAction(directive, fn, options);
        }, 700)
    getScrollDiv(el?: HTMLElement) {
        if (!el) el = this.root.querySelector('.shy-page-view-box') as HTMLElement
        return dom(el).getOverflowPanel()
    }
    pageFill: BoxFillType = { mode: 'none', color: '' }
    pageStyle: BoxStyle = { color: 'light', transparency: 'noborder' }
    onLazyUpdateProps = lodash.debounce(async (props: Record<string, any>, isUpdate?: boolean) => {
        this.onUpdateProps(props, isUpdate);
    }, 1000)
    public isSchemaRecordViewTemplate: boolean
}
export interface Page {
    on(name: PageDirective.init, fn: () => void);
    emit(name: PageDirective.init);
    on(name: PageDirective.blur, fn: (ev: FocusEvent) => void);
    emit(name: PageDirective.blur, ev: FocusEvent): void;
    on(name: PageDirective.focus, fn: (ev: FocusEvent) => void);
    emit(name: PageDirective.focus, ev: FocusEvent): void;
    on(name: PageDirective.focusAnchor, fn: (anchor: AppearAnchor) => void);
    emit(name: PageDirective.focusAnchor, anchor: AppearAnchor): void;
    on(name: PageDirective.blurAnchor, fn: (anchor: AppearAnchor) => void);
    emit(name: PageDirective.blurAnchor, anchor: AppearAnchor): void;
    on(name: PageDirective.history, fn: (ev: UserAction) => void);
    emit(name: PageDirective.history, ev: UserAction): void;

    on(name: PageDirective.syncHistory, fn: (data: { seq: number, force?: boolean, creater?: string }) => void);
    emit(name: PageDirective.syncHistory, data: { seq: number, force?: boolean, creater?: string });

    on(name: PageDirective.hoverOutBlock, fn: (block: Block) => void): void;
    emit(name: PageDirective.hoverOutBlock, block: Block)
    on(name: PageDirective.hoverBlock, fn: (block: Block) => void): void;
    emit(name: PageDirective.hoverBlock, block: Block)
    on(name: PageDirective.dropLeaveBlock, fn: (dragBlocks: Block[], dropBlock: Block, direction: DropDirection) => void): void;
    emit(name: PageDirective.dropLeaveBlock, dragBlocks: Block[], dropBlock: Block, direction: DropDirection)
    on(name: PageDirective.dropEnterBlock, fn: (dragBlocks: Block[], dropBlock: Block, direction: DropDirection) => void): void;
    emit(name: PageDirective.dropEnterBlock, dragBlocks: Block[], dropBlock: Block, direction: DropDirection)
    on(name: PageDirective.loading, fn: () => void);
    emit(name: PageDirective.loading);
    on(name: PageDirective.loaded, fn: () => void);
    emit(name: PageDirective.loaded): void;
    on(name: PageDirective.change, fn: () => void);
    emit(name: PageDirective.change);
    on(name: PageDirective.error, fn: (error: Error | string) => void);
    emit(name: PageDirective.error, error: Error | string);
    on(name: PageDirective.warn, fn: (error: Error | string) => void);
    emit(name: PageDirective.warn, error: Error | string);
    on(name: PageDirective.selectRows, fn: (block: Block, rows: any[]) => void);
    emit(name: PageDirective.selectRows, block: Block, rows: any[]);
    on(name: PageDirective.save, fn: () => void);
    emit(name: PageDirective.save);

    on(name: PageDirective.mounted, fn: () => void);
    emit(name: PageDirective.mounted);

    on(name: PageDirective.rollup, fn: (id: string) => void);
    emit(name: PageDirective.rollup, id: string);

    on(name: PageDirective.willSave, fn: () => void);
    emit(name: PageDirective.willSave);

    on(name: PageDirective.saved, fn: () => void);
    emit(name: PageDirective.saved);

    on(name: PageDirective.close, fn: () => void);
    emit(name: PageDirective.close);

    on(name: PageDirective.back, fn: () => void);
    emit(name: PageDirective.back);

    on(name: PageDirective.changePageLayout, fn: () => void);
    emit(name: PageDirective.changePageLayout);

    on(name: PageDirective.spreadSln, fn: () => void);
    emit(name: PageDirective.spreadSln);

    on(name: PageDirective.reload, fn: () => void);
    emit(name: PageDirective.reload);
}
export interface Page extends PageEvent { }
export interface Page extends Page$Seek { }

export interface Page extends Page$Cycle { }
export interface Page extends Page$Operator { }
export interface Page extends Mix { }
export interface Page extends PageContextmenu { }
Mix(Page, PageEvent, Page$Seek, Page$Cycle, Page$Operator, PageContextmenu);