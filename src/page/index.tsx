
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
import { ConfigurationManager } from '../config';
import { PageConfig, WorkspaceConfig } from '../config/type';
import { KeyboardPlate } from '../common/keys';
import { Page$Seek } from './partial/seek';
import { PageView } from './view';
import { Anchor } from '../kit/selection/anchor';
import { UserAction } from '../history/action';
import { TableSchema } from '../../blocks/table-store/schema/meta';
import { DropDirection } from '../kit/handle/direction';
import { FieldType } from '../../blocks/table-store/schema/field.type';
import { Field } from '../../blocks/table-store/schema/field';
import { PageDirective } from './directive';
import { IconArguments } from '../../extensions/icon/declare';
import { Mix } from '../../util/mix';
import { Page$Cycle } from './partial/left.cycle';
import { Page$Operator } from './partial/operator';
import { Kit } from '../kit';
import { messageChannel } from '../../util/bus/event.bus';
import { Directive } from '../../util/bus/directive';
import { getBoardTool } from '../../extensions/board.tool';
import { PageLayoutType } from '../layout/declare';
import { Point } from '../common/point';

export class Page extends Events<PageDirective> {
    root: HTMLElement;
    contentEl: HTMLElement;
    id: string;
    date: number;
    readonly: boolean = false;
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
    get creater() {
        return messageChannel.fire(Directive.getCurrentUser)
    }
    kit: Kit = new Kit(this);
    snapshoot = new HistorySnapshoot(this)
    cfm: ConfigurationManager;
    loadConfig(pageConfig: PageConfig, workspaceConfig: WorkspaceConfig) {
        if (pageConfig) this.cfm.loadPageConfig(pageConfig);
        if (workspaceConfig) this.cfm.loadPageConfig(workspaceConfig);
    }
    pageLayout: PageLayout;
    views: View[] = [];
    view: PageView;
    keyboardPlate: KeyboardPlate = new KeyboardPlate();
    isFocus: boolean = false;
    pageVisibleWidth: number;
    pageVisibleHeight: number;
    firstCreated: boolean = true;
    render(el: HTMLElement, options?: { width?: number, height?: number }) {
        this.root = el;
        if (options?.width) this.pageVisibleWidth = options?.width;
        if (options?.height) this.pageVisibleHeight = options?.height;
        ReactDOM.render(<PageView page={this}></PageView>, this.root);
    }
    fragment: DocumentFragment;
    isOff: boolean = false;
    cacheFragment() {
        this.kit.picker.onCancel();
        getBoardTool().then(r => {
            r.close()
        })
        if (!this.fragment) this.fragment = document.createDocumentFragment();
        this.fragment.appendChild(this.root);
        this.isOff = true;
    }
    renderFragment(panel: HTMLElement) {
        if (this.fragment) {
            panel.appendChild(this.root);
            this.isOff = true;
            if (this.pageLayout.type == PageLayoutType.board) {
                getBoardTool().then(r => {
                    r.open(Point.from(this.view.el.getBoundingClientRect()));
                })
            }
        }
    }
    getPageFrame() {
        return this.views[0];
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
    on(name: PageDirective.loadPageInfo, fn: () => Promise<{ id: string, text: string, icon?: IconArguments, description?: string }>);
    emitAsync(name: PageDirective.loadPageInfo): Promise<{ id: string, text: string, icon?: IconArguments, description?: string }>;
    on(name: PageDirective.getPageInfo, fn: (pageId: string) => Promise<{ id: string, text: string, icon?: IconArguments, description?: string }>);
    emitAsync(name: PageDirective.getPageInfo, pageId: string): Promise<{ id: string, text: string, icon?: IconArguments, description?: string }>;
    on(name: PageDirective.save, fn: () => void);
    emit(name: PageDirective.save);

    on(name: PageDirective.schemaLoad, fn: (schemaId: string) => Promise<Partial<TableSchema>>);
    emitAsync(name: PageDirective.schemaLoad, schemaId: string): Promise<Partial<TableSchema>>;
    on(name: PageDirective.schemaCreate, fn: (data: { text: string, workspaceId?: string, templateId?: string }) => Promise<Partial<TableSchema>>);
    emitAsync(name: PageDirective.schemaCreate, data: { text: string, workspaceId?: string, templateId?: string }): Promise<Partial<TableSchema>>;

    on(name: PageDirective.schemaCreateField, fn: (schemaId: string, options: { type: FieldType, text: string }) => Promise<Partial<Field>>);
    emitAsync(name: PageDirective.schemaCreateField, schemaId: string, options: { type: FieldType, text: string }): Promise<Partial<Field>>
    on(name: PageDirective.schemaRemoveField, fn: (schemaId: string, fieldId: string) => Promise<{ ok: boolean, warn?: string }>)
    emitAsync(name: PageDirective.schemaRemoveField, schemaId: string, fieldId: string): Promise<{ ok: boolean, warn?: string }>;
    on(name: PageDirective.schemaTurnTypeField, fn: (schemaId: string, fieldId: string, type: FieldType) => Promise<{ ok: boolean, warn?: string }>);
    emitAsync(name: PageDirective.schemaTurnTypeField, schemaId: string, fieldId: string, type: FieldType): Promise<{ ok: boolean, warn?: string }>
    on(name: PageDirective.schemaUpdateField, fn: (schemaId: string, fieldId: string, data: Record<string, any>) => Promise<{ ok: boolean, warn?: string }>);
    emitAsync(name: PageDirective.schemaUpdateField, schemaId: string, fieldId: string, data: Record<string, any>): Promise<{ ok: boolean, warn?: string }>

    on(name: PageDirective.schemaTableLoad, fn: (schemaId: string, options: { size?: number, index?: number, filter?: Record<string, any> }) => Promise<{ index?: number, size?: number, list: any[], total: number }>)
    emitAsync(name: PageDirective.schemaTableLoad, schemaId: string, options: { size?: number, index?: number, filter?: Record<string, any> }): Promise<{ index?: number, size?: number, list: any[], total: number }>
    on(name: PageDirective.schemaTableLoadAll, fn: (schemaId: string, options: { filter?: Record<string, any> }) => Promise<{ list: any[], total: number }>)
    emitAsync(name: PageDirective.schemaTableLoadAll, schemaId: string, options: { filter?: Record<string, any> }): Promise<{ list: any[], total: number }>
    on(name: PageDirective.schemaInsertRow, fn: (schemaId: string, data: Record<string, any>, pos: { id: string, pos: 'down' | 'up' }) => Promise<{ ok: boolean, warn?: string, data?: Record<string, any> }>);
    emitAsync(name: PageDirective.schemaInsertRow, schemaId: string, data: Record<string, any>, pos: { id: string, pos: 'down' | 'up' }): Promise<{ ok: boolean, warn?: string, data?: Record<string, any> }>;
    on(name: PageDirective.schemaUpdateRow, fn: (schemaId: string, rowId: string, data: Record<string, any>) => Promise<{ ok: boolean, warn?: string }>);
    emitAsync(name: PageDirective.schemaUpdateRow, schemaId, rowId: string, data: Record<string, any>): Promise<{ ok: boolean, warn?: string }>
    on(name: PageDirective.schemaDeleteRow, fn: (schemaId: string, rowId: string) => Promise<{ ok: boolean, warn?: string }>);
    emitAsync(name: PageDirective.schemaDeleteRow, schemaId: string, rowId: string): Promise<{ ok: boolean, warn?: string }>




}
export interface Page extends PageEvent { }
export interface Page extends Page$Seek { }

export interface Page extends Page$Cycle { }
export interface Page extends Page$Operator { }
export interface Page extends Mix { }
Mix(Page, PageEvent, Page$Seek, Page$Cycle, Page$Operator);