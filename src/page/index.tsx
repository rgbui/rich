
import React from 'react';
import ReactDOM from 'react-dom';
import "./style.less";
import { Events } from "../../util/events";
import { util } from "../../util/util";
import { View } from "../block/element/view";
import { PageLayout } from "../layout/index";
import { PageEvent } from "./partial/event";

import { User } from '../types/user';
import { HistorySnapshoot } from '../history/snapshoot';
import { Block } from '../block';
import { ConfigurationManager } from '../config';
import { PageConfig, WorkspaceConfig } from '../config/type';
import { KeyboardPlate } from '../common/keys';
import { Page$Seek } from './partial/seek';
import { PageView } from './view';
import { Exception, ExceptionType } from '../error/exception';
import { Anchor } from '../kit/selection/anchor';
import { UserAction } from '../history/action';
import { TableSchema } from '../../blocks/data-present/schema/meta';
import { DropDirection } from '../kit/handle/direction';
import { FieldType } from '../../blocks/data-present/schema/field.type';
import { Field } from '../../blocks/data-present/schema/field';
import { PageDirective } from './directive';
import { IconArguments } from '../../extensions/icon/declare';
import { Mix } from '../../util/mix';
import { Page$Cycle } from './partial/left.cycle';
import { Page$Operator } from './partial/operator';
import { Kit } from '../kit';

export class Page extends Events<PageDirective> {
    el: HTMLElement;
    contentEl: HTMLElement;
    root: HTMLElement;
    id: string;
    date: number;
    readonly: boolean = false;
    private user: User;
    constructor(el: HTMLElement, options?: {
        id?: string,
        readonly?: boolean,
        user?: User
    }) {
        super();
        this.__init_mixs();
        this.el = el;
        if (typeof options == 'object') Object.assign(this, util.clone(options));
        if (typeof this.id == 'undefined') this.id = util.guid();
        if (typeof this.date == 'undefined') this.date = new Date().getTime();
        this.init();
    }
    get creater() {
        if (!this.user) throw new Exception(ExceptionType.notUser, 'the user is not null');
        return this.user;
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
    render() {
        // ReactDOM.render(<PageView page={this}></PageView>, (this.root = this.el.appendChild(document.createElement('div'))));
        this.root = this.el;
        ReactDOM.render(<PageView page={this}></PageView>, this.el);
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
    on(name: PageDirective.loadTableSchema, fn: (schemaId: string) => Promise<Partial<TableSchema>>);
    emitAsync(name: PageDirective.loadTableSchema, schemaId: string): Promise<Partial<TableSchema>>;
    on(name: PageDirective.createDefaultTableSchema, fn: (data?: { text?: string, templateId?: string }) => Promise<Partial<TableSchema>>);
    emitAsync(name: PageDirective.createDefaultTableSchema, data?: { text?: string, templateId?: string }): Promise<Partial<TableSchema>>;
    on(name: PageDirective.loadTableSchemaData, fn: (schemaId: string, options: { size?: number, index?: number, filter?: Record<string, any> }) => Promise<{ index?: number, size?: number, list: any[], total: number }>)
    emitAsync(name: PageDirective.loadTableSchemaData, schemaId: string, options: { size?: number, index?: number, filter?: Record<string, any> }): Promise<{ index?: number, size?: number, list: any[], total: number }>
    on(name: PageDirective.createTableSchemaField, fn: (options: { type: FieldType, text: string }) => Promise<Partial<Field>>);
    emitAsync(name: PageDirective.createTableSchemaField, options: { type: FieldType, text: string }): Promise<Partial<Field>>
    on(name: PageDirective.removeTableSchemaField, fn: (schemaId: string, name: string) => Promise<{ ok: boolean, warn?: string }>)
    emitAsync(name: PageDirective.removeTableSchemaField, schemaId: string, na: string): Promise<{ ok: boolean, warn?: string }>;
    on(name: PageDirective.turnTypeTableSchemaField, fn: (schemaId: string, fieldName: string, type: FieldType) => Promise<{ ok: boolean, warn?: string }>);
    emitAsync(name: PageDirective.turnTypeTableSchemaField, schemaId: string, fieldName: string, type: FieldType): Promise<{ ok: boolean, warn?: string }>
    on(name: PageDirective.updateTableSchemaField, fn: (schemaId: string, fieldName: string, type: FieldType) => Promise<{ ok: boolean, warn?: string }>);
    emitAsync(name: PageDirective.updateTableSchemaField, schemaId: string, fieldName: string, type: FieldType): Promise<{ ok: boolean, warn?: string }>
    on(name: PageDirective.insertRow, fn: (schemaId: string, rowId: string, arrow: 'append' | 'prev') => Promise<Record<string, any>>);
    emitAsync(name: PageDirective.insertRow, schemaId: string, rowId: string, arrow: 'append' | 'prev'): Promise<Record<string, any>>
    on(name: PageDirective.updateRow, fn: (schemaId: string, rowId: string, data: Record<string, any>) => Promise<{ ok: boolean, warn?: string }>);
    emitAsync(name: PageDirective.updateRow, schemaId, rowId: string, data: Record<string, any>): Promise<{ ok: boolean, warn?: string }>
    on(name: PageDirective.deleteRow, fn: (schemaId: string, rowId: string) => Promise<{ ok: boolean, warn?: string }>);
    emitAsync(name: PageDirective.deleteRow, schemaId, rowId: string): Promise<{ ok: boolean, warn?: string }>
    on(name: PageDirective.loadPageInfo, fn: () => Promise<{ id: string, text: string, icon?: IconArguments, description?: string }>);
    emitAsync(name: PageDirective.loadPageInfo): Promise<{ id: string, text: string, icon?: IconArguments, description?: string }>;
    on(name: PageDirective.save, fn: () => void);
    emit(name: PageDirective.save);
}
export interface Page extends PageEvent { }
export interface Page extends Page$Seek { }

export interface Page extends Page$Cycle { }
export interface Page extends Page$Operator { }
export interface Page extends Mix { }
Mix(Page, PageEvent, Page$Seek, Page$Cycle, Page$Operator);