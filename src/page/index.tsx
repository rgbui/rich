
import React, { CSSProperties } from 'react';
import ReactDOM from 'react-dom';
import { Events } from "../../util/events";
import { util } from "../../util/util";
import { View } from "../block/element/view";
import { Page$ViewEvent } from "./partial/view.event";
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
import { Page$Operator } from './partial/op/op1';
import { LinkPageItem, LinkWs, PageLayoutType, PageThemeStyle, PageVersion } from './declare';
import { Point, Rect } from '../common/vector/point';
import { GridMap } from './grid';
import { Matrix } from '../common/matrix';
import { Page$ContextMenu } from './partial/contextmenu';
import { Kit } from '../kit';
import { channel } from '../../net/channel';
import { Title } from '../../blocks/interaction/title';
import { AppearAnchor } from '../block/appear';

import { ElementType, parseElementUrl } from '../../net/element.type';
import { BlockUrlConstant } from '../block/constant';
import lodash from 'lodash';
import { ActionDirective } from '../history/declare';
import { isMobileOnly } from "react-device-detect";
import { dom } from '../common/dom';
import { DataGridView } from '../../blocks/data-grid/view/base';
import { Link } from '../../blocks/navigation/link';
import { AtomPermission, PageSourcePermission } from './permission';
import { closeBoardEditTool } from '../../extensions/board.edit.tool';
import "./style.less";
import { PageOnEvent } from './partial/on.event';
import { Page$Operator2 } from './partial/op/op2';
import { Page$Schema } from './partial/schema';
import { TableSchema } from '../../blocks/data-grid/schema/meta';
import { closeMaterialView } from '../../extensions/board/material';

export class Page extends Events<PageDirective> {
    root: HTMLElement;
    viewEl: HTMLElement;
    contentEl: HTMLElement;
    id: string;
    date: number;
    readonly: boolean = false;
    sourceItemId: string;
    version: PageVersion;

    syncs: Record<string, any> = {};
    get schema(): TableSchema {
        return TableSchema.getTableSchema(this.pe.id)
    }
    get schemaView() {
        if (this.schema && [
            ElementType.SchemaRecordView,
            ElementType.SchemaRecordViewData
        ].includes(this.pe.type))
            return this.schema?.views.find(v => v.id == this.pe.id1)
    }
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
    ws: LinkWs;
    get isSign() {
        return this.user?.id ? true : false
    }
    kit: Kit = new Kit(this);
    snapshoot = new HistorySnapshoot(this)
    pageLayout: { type: PageLayoutType };
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
    parentItems: LinkPageItem[] = [];
    /**
     * 是否显示大纲
     */
    nav: boolean = false;
    get isCanOutline() {
        if (this.nav) {
            if (!isMobileOnly) return true;
        }
        return false;
    }
    autoRefSubPages: boolean = true;
    addedSubPages: string[] = [];
    showMembers: boolean = false;
    /**
     * 页面格式 
     * 仅文档、数据表格、宣传页起作用
     */
    hideDocTitle: boolean = false;
    /**
     * 是否显示页面头部
     */
    bar = true;
    get windowMatrix() {
        var matrix = new Matrix();
        if (this.isBoard) {
            var rect = Rect.fromEle(this.viewEl);
            matrix.translate(rect.left, rect.top);
        }
        else {
            var sd = this.getScrollDiv();
            var rect = Rect.fromEle(sd);
            matrix.translate(rect.left - sd.scrollLeft, rect.top - sd.scrollTop);
        }
        return matrix;
    }
    get bound() {
        var rect = Rect.fromEle(this.viewEl);
        return rect;
    }
    get globalMatrix() {
        return this.windowMatrix.appended(this.matrix);
    }
    /**
     * 页面打开初始化，认为是不变的
     * 用于判断页面是否有没有编辑修改，光标的操作不算修改
     */
    pageModifiedOrNot: boolean = false;
    /**
     * 判断页面是否被外部修改
     * 页面在多人协作的状态，是否接收到了其他人的修改
     */
    pageModifiedExternally: boolean = false;
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
        if (this.view)
            this.view.forceManualUpdate()
    }
    fragment: DocumentFragment;
    /**
     * 判断是否页面处于失活状态
     */
    isPageOff: boolean = false;
    cacheFragment() {
        try {
            if (this.root) {
                if (!this.fragment)
                    this.fragment = document.createDocumentFragment();
                if (!this.fragment.contains(this.root))
                    this.fragment.appendChild(this.root);
            }
            this.isPageOff = true;
            this.kit.picker.onCancel();
            closeBoardEditTool();
            closeMaterialView();
        }
        catch (ex) {
            console.error(ex);
        }
    }
    destory() {
        try {
            for (let se in this.syncs) {
                channel.off(se as any, this.syncs[se]);
            }
            this.kit.picker.onCancel();
            closeBoardEditTool();
            closeMaterialView();
            if (this.root instanceof HTMLElement) {
                ReactDOM.unmountComponentAtNode(this.root);
                this.root.remove();
            }
            if (this.isPageOff) {
                if (this.fragment) {
                    this.fragment = null;
                }
            }
        }
        catch (ex) {
            console.error(ex);
        }
    }
    async renderFragment(panel: HTMLElement, options?: { width?: number, height?: number }) {
        try {
            if (!this.root) {
                this.render(panel, options);
                return;
            }
            closeBoardEditTool();
            closeMaterialView();
            panel.appendChild(this.root);
            this.view.observeScroll();
            await this.AutomaticHandle();
            if ([ElementType.SchemaRecordView, ElementType.SchemaRecordViewData, ElementType.SchemaData].includes(this.pe.type)) {
                await this.loadPageSchema();
            }
            var isForceUpdate = false;
            var pageBarIsChange = false;
            var os = lodash.cloneDeep(this.parentItems);
            await this.loadPageParents();
            var ns = lodash.cloneDeep(this.parentItems);
            if (!lodash.isEqual(os, ns)) {
                pageBarIsChange = true;
            }

            var nextAction = () => {
                if (this.pageInfo?.text) {
                    var title = this.find(g => g.url == BlockUrlConstant.Title) as Title;
                    if (title) {
                        if (this.isCanEdit) title.onFocusPageTitle();
                    }
                }
                this.isPageOff = false;
                this.each(c => {
                    if ([
                        BlockUrlConstant.DataGridBoard,
                        BlockUrlConstant.DataGridCalendar,
                        BlockUrlConstant.DataGridGallery,
                        BlockUrlConstant.DataGridList,
                        BlockUrlConstant.DataGridTable].includes(c.url as any)) {
                        (c as DataGridView).onReloadData()
                    }
                    if ([BlockUrlConstant.Link].includes(c.url as any)) {
                        (c as Link).loadPageInfo()
                    }
                });
                if (isForceUpdate == false && this.pageModifiedExternally) {
                    this.forceUpdate();
                    this.views.forEach(v => {
                        v.forceManualUpdate()
                    })
                }
                this.pageModifiedExternally = false;
                if (this.viewEl) {
                    this.viewEl.focus();
                }
            }
            if (pageBarIsChange) {
                this.view.pageBar.forceUpdate()
            }
            if (options && (options?.width !== this.pageVisibleWidth || options?.height !== this.pageVisibleHeight)) {
                this.pageVisibleWidth = options?.width;
                this.pageVisibleHeight = options?.height;
                this.view.forceManualUpdate(() => {
                    isForceUpdate = true;
                    nextAction()
                })
            } else nextAction();
        }
        catch (ex) {
            console.log(panel, this.root);
            console.error(ex);
        }
    }
    setPaddingBottom(paddingBottom?: number) {
        if (this.pageLayout?.type == PageLayoutType.doc || this.pageLayout?.type == PageLayoutType.ppt) {
            if (this.contentEl) {
                if (typeof paddingBottom == 'number') this.contentEl.style.paddingBottom = paddingBottom + 'px';
                else this.contentEl.style.paddingBottom = '';
            }
        }
    }
    getPageFrame() {
        return this.views[0];
    }
    getBoardRelativePoint(point: Point) {
        return this.globalMatrix.transform(point);
    }
    getDocRelativePoint(block: Block, point?: Point) {
        var ps: (Block | Page)[] = block.parents(c => (c.isPanel && !c.isBoardBlock ? true : false));
        ps = ps.reverse();
        lodash.remove(ps, g => (g as any).url == BlockUrlConstant.CardBox && (g as any).board == false)
        ps.splice(0, 0, this);
        var p = point ? point : block.getVisibleBound().leftTop;
        var x = 0;
        var y = 0;
        for (let i = 0; i < ps.length; i++) {
            var d = ps[i].getScrollDiv();
            var rect = Rect.fromEle(d);
            x += p.x - rect.left + d.scrollLeft;
            y += p.y - rect.top + d.scrollTop;
            p = rect.leftTop;
        }
        return new Point(x, y);
    }
    getBoardRelativeRect(rect: Rect) {
        return new Rect(this.globalMatrix.transform(rect.leftTop), this.globalMatrix.transform(rect.rightBottom))
    }
    get isBoard() {
        return this.pageLayout?.type == PageLayoutType.board;
    }
    get scale() {
        return this.matrix.getScaling().x;
    }
    /**
     * page : 以页面的方式打开
     * slide : 以侧边栏的方式打开
     * dialog : 以对话框的方式打开
     * snap : 以快照的方式打开
     * popup : 以弹出框的方式打开
     * itemCover : 以数据卡片内容的方式打开
     */
    openSource: 'page' | 'slide' | 'dialog' | 'snap' | 'popup' | 'itemCover' = 'page';
    getScreenStyle() {
        var style: CSSProperties = {};
        if (this.openSource == 'popup') {
            style.marginLeft = 10;
            style.marginRight = 10;
            return style;
        }
        if (isMobileOnly) {
            style.marginLeft = 20
            style.marginRight = 20
        }
        else {
            if (this.isSupportScreen) {
                var isFull: boolean = this.isFullWidth;
                if (this.ws?.isPubSite) isFull = this.ws?.publishConfig.isFullWidth;
                if (isFull) {
                    if (this.pageLayout?.type == PageLayoutType.ppt) {
                        style.marginLeft = 80;
                        style.marginRight = 80;
                    }
                    else {
                        style.marginLeft = 96;
                        style.marginRight = 96;
                    }

                    if (this.pageLayout?.type == PageLayoutType.textChannel) {
                        style.marginLeft = 0;
                        style.marginRight = 0;
                    }
                }
                else {
                    if (window.innerWidth < 1800) style.width = 800;
                    else style.width = 1000;
                    if (this.pageLayout?.type == PageLayoutType.textChannel) style.width += 200;
                    style.margin = '0 auto';
                }
            }
        }
        return style;
    }
    get pageInfo() {
        return this._pageItem;
    }
    get textIndent() {
        return 24
    }
    _pageItem: LinkPageItem;
    set pageInfo(pageInfo: LinkPageItem) {
        this._pageItem = pageInfo;
    }
    /**
     * 标记当前页面是否是需要编辑，还是不能编辑
     * 如数所表格，打开一条记录，该记录页面是可以编辑的
     */
    get isCanEdit() {
        if (this.locker?.lock) return false;
        if (!this.isSign) return false;
        if (this.readonly) return false;
        if (this.ws?.isPubSite) return false;
        if (isMobileOnly) return false;
        if (this.currentPermissions?.source == 'wsOwner') return true;
        return this.isAllow(...[
            AtomPermission.dbEdit,
            AtomPermission.dbFull,
            AtomPermission.pageFull,
            AtomPermission.pageEdit,
        ])
    }
    /**
     * 只有当页面为 ElementType.SchemaRecordView&& !this.isSchemaRecordViewTemplate 相当于添加数据
     * ElementType.SchemaData || ElementType.SchemaRecordViewData
     * 时， isCanEditRow 才会生效
     */
    get isCanEditRow() {
        var r = this.isCanEdit;
        if (r) return r;
        if (this.pe.type == ElementType.SchemaRecordView && !this.isSchemaRecordViewTemplate) {
            return this.isAllow(AtomPermission.dbAddRow, AtomPermission.dbEditRow)
        }
        if (this.pe.type == ElementType.SchemaData || this.pe.type == ElementType.SchemaRecordViewData) {
            var c = this.isAllow(AtomPermission.dbEditRow);
            if (c) return c;
            if (this.isAllow(AtomPermission.dbAddRow)) {
                if (this.formRowData.creater == this.user.id) return true;
            }
        }
        return false;
    }
    /**
     * 这里主要是计算是否能编辑
     * 原因是因为什么，
     * 不能编辑有可能是页面locker
     * 或者是权限不够等等
     * @param options 
     * @returns 
     */
    canEdit(options: { ignoreLocker?: boolean, ignoreReadonly?: boolean }) {
        if (options.ignoreLocker !== true)
            if (this.locker?.lock) return false;
        if (!this.isSign) return false;
        if (options.ignoreReadonly !== true)
            if (this.readonly) return false;
        if (this.ws?.isPubSite) return false;
        if (isMobileOnly) return false;
        if (this.currentPermissions?.source == 'wsOwner') return true;
        return this.isAllow(...[
            AtomPermission.pageFull,
            AtomPermission.pageEdit,
            AtomPermission.dbEdit,
            AtomPermission.dbFull,
        ])
    }
    get isCanManage() {
        if (!this.isSign) return false;
        if (this.ws?.isPubSite) return false;
        if (this.currentPermissions?.source == 'wsOwner') return true;
        return this.isAllow(...[AtomPermission.pageFull, AtomPermission.dbFull])
    }
    currentPermissions: PageSourcePermission
    async cacCurrentPermissions() {
        this.currentPermissions = await channel.get('/page/allow', { elementUrl: this.elementUrl });
        console.log(this.currentPermissions, 'currentPermissions')
    }
    isAllow(...ps: AtomPermission[]) {
        var g = this.currentPermissions;
        if (!g) return false;
        if (Array.isArray(g.permissions)) return g.permissions.some(s => ps.includes(s));
    }
    get isDeny() {
        var url = location.href;
        var path = url.split('?')[0];
        if (path.endsWith('/pc')) return false;
        return this.isAllow(AtomPermission.dbDeny, AtomPermission.pageDeny);
    }
    /**
     * 是否支持宽屏及窄屏的切换
     */
    get isSupportScreen() {
        return [
            PageLayoutType.db,
            PageLayoutType.ppt,
            PageLayoutType.doc,
            PageLayoutType.textChannel
        ].includes(this.pageLayout?.type || PageLayoutType.doc)
    }
    /**
     * 是否支持用户自定义封面
     */
    get isSupportCover() {
        return [PageLayoutType.db, PageLayoutType.doc].includes(this.pageLayout?.type || PageLayoutType.doc)
    }
    async forceUpdate() {
        return new Promise((resolve, reject) => {
            if (this.view)
                return this.view.forceManualUpdate(() => {
                    resolve(true);
                })
            else resolve(false)
        })
    }
    get fontSize() {
        var sf = this.smallFont;
        if (this.ws?.isPubSite) {
            sf = this.ws.publishConfig.smallFont;
        }
        if (this.pageLayout?.type == PageLayoutType.ppt) return sf ? '1.6rem' : '1.8rem'
        if (this.pageLayout?.type == PageLayoutType.textChannel) return '1.4rem'
        return sf ? '1.4rem' : '1.6rem'
    }
    /**
     * 如果sf为小字体，那么需要重新计算，否则返回页面的字体大小
     * 示例：如文本为小字号，那么先计算文本的小字号，在计算页面的字体大小
     * @param sf 是否为小字体
     * @returns 
     */
    cacSmallFont(sf: boolean) {
        if (sf == true) {
            if (this.pageLayout?.type == PageLayoutType.ppt)
                return this.smallFont ? '1.4rem' : '1.6rem';
            return this.smallFont ? '1.2rem' : '1.4rem';
        }
        else return this.fontSize;
    }
    get lineHeight() {
        return util.remScale(this.fontSize, this.fontLineRatio);
    }
    /**
     * 文字大小与行高的比例系数
     */
    get fontLineRatio() {
        return 1.5;
    }
    private _pe: {
        type: ElementType;
        id: string;
        id1: string;
        id2: string;
    }
    get pe() {
        if (lodash.isUndefined(this.elementUrl) || lodash.isNull(this.elementUrl)) return null;
        if (typeof this._pe == 'undefined')
            this._pe = parseElementUrl(this.elementUrl) as any;
        return this._pe;
    }
    customElementUrl: string;
    get elementUrl() {
        if (this.customElementUrl) return this.customElementUrl;
    }
    onLazyAction = lodash.debounce(async (directive: ActionDirective | string,
        fn: () => Promise<void>,
        options?: { block?: Block, disabledStore?: boolean }
    ) => {
        return this.onAction(directive, fn, options);
    }, 700)
    getScrollDiv(el?: HTMLElement): HTMLElement {
        if (this.pageLayout?.type == PageLayoutType.textChannel) {
            var tc = this.find(g => g.url == BlockUrlConstant.TextChannel);
            if (tc && (tc.view as any)) {
                return (tc.view as any).contentEl;
            }
        }
        if (!el) el = this.root.querySelector('.shy-page-view-box') as HTMLElement
        if (el)
            return dom(el).getOverflowPanel()
    }
    pageTheme: PageThemeStyle = {
        bgStyle: {
            mode: 'color',
            color: '#fff',
        },
        contentStyle: {
            color: 'light',
            transparency: "noborder"
        },
        coverStyle: {
            display: 'outside'
        }
    }
    onLazyUpdateProps = lodash.debounce(async (props: Record<string, any>, isUpdate?: boolean) => {
        this.onUpdateProps(props, isUpdate);
    }, 1000)
    onLazyHistory = lodash.debounce(async (u) => {
        this.emit(PageDirective.history, u)
    }, 700);
    public openPageData?: {
        pre?: {
            id: any;
            text: any;
            icon: any;
            cover: any;
            description: any;
            openSource: Page['openSource'],
            elementUrl: string
        },
        formData?: Record<string, any>
    }
    get pageUrl() {
        if (this._pageItem) return this._pageItem.url;
        else {
            var ws = this.ws;
            return ws.url + '/r?url=' + window.decodeURIComponent(this.elementUrl);
        }
    }
    locker: {
        lock: boolean,
        date: number,
        userid: string
    }
    snapLoadLocker: { date: number, url: string, count: number }[] = [];

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

    on(name: PageDirective.syncPage, fn: (data: { seq: number, force?: boolean, creater?: string }) => void);
    emit(name: PageDirective.syncPage, data: { seq: number, force?: boolean, creater?: string });

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

    on(name: PageDirective.syncItems, fn: () => void);
    emit(name: PageDirective.syncItems);
}

export interface Page extends Page$ViewEvent { }
export interface Page extends PageOnEvent { }
export interface Page extends Page$Seek { }
export interface Page extends Page$Cycle { }
export interface Page extends Page$Operator { }
export interface Page extends Page$Operator2 { }
export interface Page extends Page$ContextMenu { }
export interface Page extends Page$Schema { }
export interface Page extends Mix { }
Mix(Page, Page$ViewEvent, PageOnEvent, Page$Seek, Page$Schema, Page$Cycle, Page$Operator, Page$Operator2, Page$ContextMenu);