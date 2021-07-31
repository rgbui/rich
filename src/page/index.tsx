
import React from 'react';
import ReactDOM from 'react-dom';
import "./style.less";
import { Events } from "../../util/events";
import { util } from "../../util/util";
import { BlockFactory } from "../block/factory/block.factory";
import { View } from "../block/element/view";
import { PageLayout } from "../layout/index";
import { PageEvent } from "./partial/event";

import { User } from '../types/user';
import { HistorySnapshoot } from '../history/snapshoot';
import { Block } from '../block';
import { OperatorDirective } from '../history/declare';
import { ConfigurationManager } from '../config';
import { PageConfig, WorkspaceConfig } from '../config/type';
import { KeyboardPlate } from '../common/keys';
import { Page$Seek } from './partial/seek';
import { Kit } from '../kit';
import { Page$Extensions } from './partial/extensions';
import { PageView } from './view';
import { PageKit } from './interaction/kit';
import { PageHistory } from './interaction/history';
import { PageKeys } from './interaction/keys';
import { Exception, ExceptionType } from '../error/exception';
import { InputDetector } from '../../extensions/input.detector/detector';
import { PageInputDetector } from './interaction/detector';
import { Anchor } from '../kit/selection/anchor';
import { UserAction } from '../history/action';
import { TableSchema } from '../../blocks/data-present/schema/meta';
import { DropDirection } from '../kit/handle/direction';
import { FieldType } from '../../blocks/data-present/schema/field.type';
import { Field } from '../../blocks/data-present/schema/field';
import { PageDirective } from './directive';

export class Page extends Events<PageDirective> {
    el: HTMLElement;
    contentEl: HTMLElement;
    root: HTMLElement;
    id: string;
    date: number;
    private user: User;
    get creater() {
        if (!this.user) throw new Exception(ExceptionType.notUser, 'the user is not null');
        return this.user;
    }
    snapshoot: HistorySnapshoot;
    constructor(el: HTMLElement, options?: Record<string, any>) {
        super();
        this.el = el;
        if (typeof options == 'object') Object.assign(this, util.clone(options));
        if (typeof this.id == 'undefined') this.id = util.guid();
        if (typeof this.date == 'undefined') this.date = new Date().getTime();
        this.init();
    }
    private async init() {
        this.cfm = new ConfigurationManager(this);
        this.cfm.loadPageConfig({
            fontCss: {
                lineHeight: 20,
                letterSpacing: 0,
                fontSize: 14,
                fontStyle: 'normail'
            } as any
        });
        this.cfm.loadWorkspaceConfig({
            fontCss: {

            } as any
        });
        this.kit = new Kit(this);
        PageKit(this.kit);
        this.snapshoot = new HistorySnapshoot(this);
        PageHistory(this, this.snapshoot);
        PageKeys(this, this.keyboardPlate);
        this.inputDetector = new InputDetector();
        PageInputDetector(this, this.inputDetector);
        this.emit(PageDirective.init);
    }
    cfm: ConfigurationManager;
    async load(data: Record<string, any>) {
        if (!data) {
            //这里加载默认的页面数据
            data = await this.getDefaultData();
        }
        await this.emit(PageDirective.loading);
        for (var n in data) {
            if (n == 'views') continue;
            else if (n == 'pageLayout') {
                this.pageLayout = new PageLayout(this, data[n]); continue;
            }
            this[n] = data[n];
        }
        if (Array.isArray(data.views)) {
            for (var i = 0; i < data.views.length; i++) {
                var dv = data.views[i];
                var dc = await BlockFactory.createBlock(dv.url, this, dv, null);
                this.views.push(dc as View);
            }
        }
        if (typeof this.pageLayout == 'undefined') this.pageLayout = new PageLayout(this);
        await this.emit(PageDirective.loaded);
    }
    async get() {
        var json: Record<string, any> = {
            id: this.id,
            date: this.date
        };
        json.pageLayout = await this.pageLayout.get();
        json.views = await this.views.asyncMap(async x => {
            return await x.get()
        })
        return json;
    }
    loadConfig(pageConfig: PageConfig, workspaceConfig: WorkspaceConfig) {
        if (pageConfig) this.cfm.loadPageConfig(pageConfig);
        if (workspaceConfig) this.cfm.loadPageConfig(workspaceConfig);
    }
    pageLayout: PageLayout;
    views: View[] = [];
    view: PageView;
    keyboardPlate: KeyboardPlate = new KeyboardPlate();
    isFocus: boolean = false;
    onError(error: Error) {
        this.emit(PageDirective.error, error);
    }
    onWarn(error: string | Error) {
        this.emit(PageDirective.warn, error);
    }
    render() {
        ReactDOM.render(<PageView page={this}></PageView>, (this.root = this.el.appendChild(document.createElement('div'))));
    }
    /**
     * 创建一个block
     * @param url 
     * @param data 
     * @param parent 
     * @param at 
     */
    async createBlock(url: string, data: Record<string, any>, parent: Block, at?: number, childKey?: string) {
        var block = await BlockFactory.createBlock(url, this, data, parent);
        if (typeof childKey == 'undefined') childKey = 'childs';
        var bs = parent.blocks[childKey];
        if (!Array.isArray(bs)) parent.blocks[childKey] = bs = [];
        if (typeof at == 'undefined') at = bs.length;
        bs.insertAt(at, block);
        this.snapshoot.record(OperatorDirective.create, {
            parentId: parent.id, childKey, at, preBlockId: block.prev ? block.prev.id : undefined, data: block.get()
        });
        await block.onCreated()
        this.onAddUpdate(parent);
        return block;
    }
    async getDefaultData() {
        var r = await import("./default.page");
        return r.data;
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
    on(name: PageDirective.dropOutBlock, fn: (block: Block) => void): void;
    emit(name: PageDirective.dropOutBlock, block: Block)
    on(name: PageDirective.dropOverBlock, fn: (block: Block, direction: DropDirection) => void): void;
    emit(name: PageDirective.dropOverBlock, block: Block, direction: DropDirection)
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
    on(name: PageDirective.createRowDefault, fn: (schemaId: string, rowId: string) => Promise<Record<string, any>>);
    emitAsync(name: PageDirective.createRowDefault, schemaId: string, rowId: string): Promise<Record<string, any>>
    on(name: PageDirective.updateRowField, fn: (schemaId: string, rowId: string, data: Record<string, any>) => Promise<{ ok: boolean, warn?: string }>);
    emitAsync(name: PageDirective.updateRowField, schemaId, rowId: string, data: Record<string, any>): Promise<{ ok: boolean, warn?: string }>
}

export interface Page extends PageEvent { }
util.inherit(Page, PageEvent)

export interface Page extends Page$Seek { }
util.inherit(Page, Page$Seek);

export interface Page extends Page$Extensions { }
util.inherit(Page, Page$Extensions);