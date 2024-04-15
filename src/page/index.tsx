
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
import { TableSchema } from '../../blocks/data-grid/schema/meta';
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
import { AtomPermission } from './permission';
import { forceCloseBoardEditTool } from '../../extensions/board.edit.tool';
import "./style.less";
import { PageOnEvent } from './partial/on.event';
import { Page$Operator2 } from './partial/op/op2';
import { Page$Schema } from './partial/schema';

export class Page extends Events<PageDirective> {
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
        var rect = Rect.fromEle(this.viewEl);
        var matrix = new Matrix();
        matrix.translate(rect.left, rect.top);
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
            this.view.forceUpdate()
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
            forceCloseBoardEditTool();
        }
        catch (ex) {
            console.error(ex);
        }
    }
    destory() {
        this.kit.picker.onCancel();
        forceCloseBoardEditTool();
        ReactDOM.unmountComponentAtNode(this.root);
        this.root.remove();
    }
    async renderFragment(panel: HTMLElement, options?: { width?: number, height?: number }) {
        try {
            if (!this.root) {
                this.render(panel, options);
                return;
            }
            panel.appendChild(this.root);
            this.view.observeScroll();
            await this.view.AutomaticHandle();
            if ([ElementType.SchemaRecordView, ElementType.SchemaRecordViewData, ElementType.SchemaData].includes(this.pe.type)) {
                await this.loadPageSchema();
            }
            var isForceUpdate = false;
            var nextAction = () => {
                if (this.pageInfo?.text) {
                    var title = this.find(g => g.url == BlockUrlConstant.Title) as Title;
                    if (title) {
                        if (this.isCanEdit) title.onEmptyTitleFocusAnchor();
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
                }
                this.pageModifiedExternally = false;
            }
            if (options && (options?.width !== this.pageVisibleWidth || options?.height !== this.pageVisibleHeight)) {
                this.pageVisibleWidth = options?.width;
                this.pageVisibleHeight = options?.height;
                this.view.forceUpdate(() => { isForceUpdate = true; nextAction() })
            } else nextAction();
        }
        catch (ex) {
            console.log(panel, this.root);
            console.error(ex);
        }
    }
    setPaddingBottom(paddingBottom: number = 200) {
        if (this.contentEl) {
            this.contentEl.style.paddingBottom = paddingBottom + 'px';
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
    getInverseRect(rect: Rect) {
        return new Rect(this.globalMatrix.inverseTransform(rect.leftTop), this.globalMatrix.inverseTransform(rect.rightBottom))
    }
    get isBoard() {
        return this.pageLayout?.type == PageLayoutType.board;
    }
    get scale() {
        return this.matrix.getScaling().x;
    }
    
    openSource: 'page' | 'slide' | 'dialog' | 'snap' | 'popup' = 'page';
    getScreenStyle() {
        var style: CSSProperties = {};
        if (isMobileOnly) {
            style.marginLeft = 20
            style.marginRight = 20
        }
        else {
            if (this.isSupportScreen) {
                var isFull: boolean = this.isFullWidth;
                if (this.ws?.isPubSite) isFull = this.ws?.publishConfig.isFullWidth;
                if (isFull) {
                    style.marginLeft = 80;
                    style.marginRight = 80;
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
    onceStopRenderByPageInfo: boolean = false;
    _pageItem: LinkPageItem;
    set pageInfo(pageInfo: LinkPageItem) {
        this._pageItem = pageInfo;
    }
    /**
     * 标记当前页面是否是需要编辑，还是不能编辑
     * 如数所表格，打开一条记录，该记录页面是可以编辑的
     */
    edit: boolean = false;
    get isCanEdit() {
        if (this.locker?.lock) return false;
        if (!this.isSign) return false;
        if (this.readonly) return false;
        if (this.ws?.isPubSite) return false;
        if (this.edit) return true;
        if (isMobileOnly) return false;
        return this.isAllow(...[
            AtomPermission.all,
            AtomPermission.docEdit,
            AtomPermission.channelEdit,
            AtomPermission.dbEdit,
            AtomPermission.wsEdit
        ])
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
        if (this.edit) return true;
        if (isMobileOnly) return false;
        return this.isAllow(...[
            AtomPermission.all,
            AtomPermission.docEdit,
            AtomPermission.channelEdit,
            AtomPermission.dbEdit,
            AtomPermission.wsEdit
        ])
    }
    get isCanManage() {
        if (!this.isSign) return false;
        if (this.ws?.isPubSite) return false;
        if (this.currentPermissions?.isOwner) return true;
        return this.isAllow(...[AtomPermission.all])
    }
    currentPermissions: {
        item?: LinkPageItem,
        isOwner?: boolean;
        isWs?: boolean;
        netPermissions?: AtomPermission[];
        permissions?: AtomPermission[];
        memberPermissions?: { userid?: string, roleId?: string, permissions?: AtomPermission[] }[];
    }
    async cachCurrentPermissions() {
        this.currentPermissions = await channel.get('/page/allow', { elementUrl: this.elementUrl });
    }
    isAllow(...ps: AtomPermission[]) {
        var g = this.currentPermissions;
        if (!g) return false;
        if (g.isOwner) return true;
        var atoms = ps;
        if (g.isWs) {
            if (Array.isArray(g.permissions)) return g.permissions.some(s => atoms.includes(s))
        }
        else if (Array.isArray(g.memberPermissions)) {
            for (let i = g.memberPermissions.length - 1; i >= 0; i--) {
                var mp = g.memberPermissions[i];
                if (mp.permissions.some(s => atoms.includes(s))) return true;
            }
        }
        else if (Array.isArray(g.netPermissions)) {
            return g.netPermissions.some(s => atoms.includes(s))
        }
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
                return this.view.forceUpdate(() => {
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
        else if (this.pageLayout?.type == PageLayoutType.textChannel) return sf ? '1.2rem' : '1.4rem'
        return sf ? '1.4rem' : '1.6rem'
    }
    get lineHeight() {
        var sf = this.smallFont;
        if (this.ws?.isPubSite) {
            sf = this.ws.publishConfig.smallFont;
        }
        if (this.pageLayout?.type == PageLayoutType.ppt) return sf ? '2.6rem' : '3.0rem'
        else if (this.pageLayout?.type == PageLayoutType.textChannel) return sf ? '1.8rem' : '2.2rem'
        return sf ? '2.2rem' : '2.6rem'
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
    getScrollDiv(el?: HTMLElement) {
        if (this.pageLayout?.type == PageLayoutType.textChannel) {
            var tc = this.find(g => g.url == BlockUrlConstant.TextChannel);
            if (tc) {
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

    on(name: PageDirective.syncItems, fn: () => void);
    emit(name: PageDirective.syncItems);
}

export interface Page extends Page$ViewEvent { }
export interface Page extends PageOnEvent { }
export interface Page extends Page$Seek { }
export interface Page extends Page$Cycle { }
export interface Page extends Page$Operator { }
export interface Page extends Page$Operator2{ }
export interface Page extends Page$ContextMenu { }
export interface Page extends Page$Schema{ }
export interface Page extends Mix { }
Mix(Page, Page$ViewEvent, PageOnEvent, Page$Seek,Page$Schema, Page$Cycle, Page$Operator,Page$Operator2, Page$ContextMenu);