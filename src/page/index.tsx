
import React from 'react';
import ReactDOM from 'react-dom';
import "./style.less";
import { Events } from "../util/events";
import { util } from "../util/util";
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
import { InputDetector } from '../extensions/input.detector/detector';
import { PageInputDetector } from './interaction/detector';

export class Page extends Events {
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
        this.emit('init');
    }
    cfm: ConfigurationManager;
    async load(data: Record<string, any>) {
        if (!data) {
            //这里加载默认的页面数据
            data = await this.getDefaultData();
        }
        await this.emit('loading');
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
        await this.emit('loaded');
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
        this.emit('error', error);
    }
    onWarn(error: string | Error) {
        this.emit('warn', error);
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
        this.onAddUpdate(parent);
        return block;
    }
    async getDefaultData() {
        var r = await import("./default.page");
        return r.data;
    }
}
export interface Page extends PageEvent { }
util.inherit(Page, PageEvent)

export interface Page extends Page$Seek { }
util.inherit(Page, Page$Seek);

export interface Page extends Page$Extensions { }
util.inherit(Page, Page$Extensions);