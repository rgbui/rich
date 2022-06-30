
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

import { getBoardTool } from '../../extensions/board.tool';
import { PageLayoutType, PageVersion } from './declare';
import { Point, Rect } from '../common/vector/point';
import { GridMap } from './grid';
import { Matrix } from '../common/matrix';
import { PageContextmenu } from './partial/contextmenu';
import { Kit } from '../kit';
import { channel } from '../../net/channel';
import { TableSchema } from '../../blocks/data-grid/schema/meta';
import { OriginFormField } from '../../blocks/data-grid/element/form/origin.field';
import { LinkPageItem } from '../../extensions/at/declare';
import { Title } from '../../blocks/page/title';
import { AppearAnchor } from '../block/appear';
import { AtomPermission } from './permission';

export class Page extends Events<PageDirective> {
    root: HTMLElement;
    contentEl: HTMLElement;
    id: string;
    date: number;
    readonly: boolean = false;
    pageItemId: string;
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
    get permissions() {
        var ps = channel.query('/page/query/permissions', { pageId: this.pageItemId });
        if (Array.isArray(ps)) return ps;
        else return [];
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
    cover: { abled: boolean, url: string, thumb: string, top: number } = null;
    isFullWidth: boolean = true;
    smallFont: boolean = false;
    get windowMatrix() {
        var rect = Rect.fromEle(this.root);
        var matrix = new Matrix();
        matrix.translate(rect.left, rect.top);
        return matrix;
    }
    get globalMatrix() {
        return this.windowMatrix.appended(this.matrix);
    }
    render(el: HTMLElement, options?: { width?: number, height?: number }) {
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
            this.fragment.appendChild(this.root);
            this.isOff = true;
            this.kit.picker.onCancel();
            getBoardTool().then(r => {
                r.off('selector')
                r.close();
            })
        }
        catch (ex) {
            console.error(ex);
        }
    }
    renderFragment(panel: HTMLElement, options?: { width?: number, height?: number }) {
        try {
            panel.appendChild(this.root);
            var nextAction = () => {
                if (this.pageInfo) {
                    if (!this.pageInfo.text) {
                        var title = this.find(g => g.url == '/title') as Title;
                        if (title) {
                            title.onEmptyTitleFocusAnchor();
                        }
                    }
                }
                this.isOff = true;
                if (this.isBoard) this.view.openPageToolBoard();
            }
            if (options && (options?.width !== this.pageVisibleWidth || options?.height !== this.pageVisibleHeight)) {
                this.pageVisibleWidth = options?.width;
                this.pageVisibleHeight = options?.height;
                this.view.forceUpdate(() => nextAction())
            } else nextAction();
        }
        catch (ex) {
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
    loadSchemaRecord(row: Record<string, any>) {
        this.each(g => {
            if (g instanceof OriginFormField) {
                var f = g.field;
                if (f) {
                    g.value = row[f.name];
                }
            }
        })
    }
    getSchemaRow() {
        var row: Record<string, any> = {};
        this.each(g => {
            if (g instanceof OriginFormField) {
                var f = g.field;
                if (f) {
                    row[f.name] = g.value;
                }
            }
        })
        return row;
    }
    getScreenStyle() {
        var style: CSSProperties = {};
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
        return style;
    }
    loadPageInfo(pageInfo: LinkPageItem) {
        this.pageInfo = util.clone(pageInfo);
    }
    pageInfo: LinkPageItem = null;
    get isCanEdit() {
        if (this.readonly) return false;
        if (this.kit.page.pageInfo?.locker?.userid) return false;
        if (!this.kit.page.permissions.includes(AtomPermission.editDoc)) return false;
        return true;
    }
    /**
     * 是否支持宽屏及窄屏的切换
     */
    get isSupportScreen() {
        return [PageLayoutType.db, PageLayoutType.doc].includes(this.pageLayout?.type || PageLayoutType.doc)
    }
    /**
     * 是否支持用户自定义封面
     */
    get isSupportCover() {
        return [PageLayoutType.db, PageLayoutType.doc].includes(this.pageLayout?.type || PageLayoutType.doc)
    }
    async forceUpdate() {
        return new Promise((resolve, reject) => {
            return this.view.forceUpdate(() => {
                resolve(true);
            })
        })
    }
    get fontSize() {
        return this.smallFont ? 14 : 16
    }
    get lineHeight() {
        return this.fontSize * 1.2;
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
    on(name: PageDirective.viewCursor, fn: (d: { blockId: string, prop: string, offset: number }) => void);
    emit(name: PageDirective.viewCursor, data: { blockId: string, prop: string, offset: number });
    on(name: PageDirective.rollup, fn: (id: string) => void);
    emit(name: PageDirective.rollup, id: string);
}
export interface Page extends PageEvent { }
export interface Page extends Page$Seek { }

export interface Page extends Page$Cycle { }
export interface Page extends Page$Operator { }
export interface Page extends Mix { }
export interface Page extends PageContextmenu { }
Mix(Page, PageEvent, Page$Seek, Page$Cycle, Page$Operator, PageContextmenu);