
import React from 'react';
import ReactDOM from 'react-dom';
import "./style.less";
import { Events } from "../../util/events";
import { util } from "../../util/util";
import { View } from "../block/element/view";
import { PageLayout } from "../layout/index";
import { PageEvent } from "./partial/event";
import { HistorySnapshoot } from '../history/snapshoot';
import { Block } from '../block';
import { ConfigViewer } from '../config';
import { KeyboardPlate } from '../common/keys';
import { Page$Seek } from './partial/seek';
import { PageView } from './view';
import { Anchor } from '../kit/selection/anchor';
import { UserAction } from '../history/action';
import { DropDirection } from '../kit/handle/direction';
import { PageDirective } from './directive';
import { Mix } from '../../util/mix';
import { Page$Cycle } from './partial/left.cycle';
import { Page$Operator } from './partial/operator';

import { getBoardTool } from '../../extensions/board.tool';
import { PageLayoutType } from '../layout/declare';
import { Point, Rect } from '../common/vector/point';
import { PageGrid } from './grid';
import { Matrix } from '../common/matrix';
import { PageContextmenu } from './partial/contextmenu';
import { Kit } from '../kit';
import { channel } from '../../net/channel';
import { TableSchema } from '../../blocks/data-grid/schema/meta';
import { OriginFormField } from '../../blocks/data-grid/element/form/origin.field';

export class Page extends Events<PageDirective> {
    root: HTMLElement;
    contentEl: HTMLElement;
    id: string;
    date: number;
    readonly: boolean = false;
    pageItemId: string;
    constructor(options?: {
        id?: string,
        readonly?: boolean

    }) {
        super();
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
    configViewer: ConfigViewer;
    pageLayout: PageLayout;
    views: View[] = [];
    view: PageView;
    keyboardPlate: KeyboardPlate = new KeyboardPlate();
    isFocus: boolean = false;
    pageVisibleWidth: number;
    pageVisibleHeight: number;
    requireSelectLayout: boolean;
    grid: PageGrid;
    matrix: Matrix = new Matrix();
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
    renderFragment(panel: HTMLElement) {
        try {
            panel.appendChild(this.root);
            this.isOff = true;
            if (this.pageLayout.type == PageLayoutType.board) {
                getBoardTool().then(r => {
                    r.on('selector',function(event){ });
                    r.open(Point.from(this.view.el.getBoundingClientRect()));
                })
            }
        }
        catch (ex) {
            console.error(ex);
        }
    }
    getPageFrame() {
        return this.views[0];
    }
    getRelativePoint(point: Point) {
        var eb = this.root.getBoundingClientRect();
        return point.relative(Point.from(eb))
    }
    getRelativeRect(rect: Rect) {
        var eb = this.root.getBoundingClientRect();
        return rect.relative(Point.from(eb))
    }
    get isBoard() {
        return this.pageLayout.type == PageLayoutType.board;
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
    get isLock() {
        return this.configViewer.pageConfig.locker?.lock ? true : false;
    }
}
export interface Page {
    on(name: PageDirective.init, fn: () => void);
    emit(name: PageDirective.init);
    on(name: PageDirective.blur, fn: (ev: FocusEvent) => void);
    emit(name: PageDirective.blur, ev: FocusEvent): void;
    on(name: PageDirective.focus, fn: (ev: FocusEvent) => void);
    emit(name: PageDirective.focus, ev: FocusEvent): void;
    on(name: PageDirective.focusAnchor, fn: (anchor: Anchor) => void);
    emit(name: PageDirective.focusAnchor, anchor: Anchor): void;
    on(name: PageDirective.blurAnchor, fn: (anchor: Anchor) => void);
    emit(name: PageDirective.blurAnchor, anchor: Anchor): void;
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
}
export interface Page extends PageEvent { }
export interface Page extends Page$Seek { }

export interface Page extends Page$Cycle { }
export interface Page extends Page$Operator { }
export interface Page extends Mix { }
export interface Page extends PageContextmenu { }
Mix(Page, PageEvent, Page$Seek, Page$Cycle, Page$Operator, PageContextmenu);