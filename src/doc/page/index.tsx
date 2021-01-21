
import React from 'react';
import ReactDOM from 'react-dom';
import { Events } from "../../util/events";
import { util } from "../../util/util";
import { BlockFactory } from "../block/block.factory";
import { View } from "../block/view";
import { PageLayout } from "./layout/index";
import { PageOperator } from "./operator";
export class Page extends Events {
    private el: HTMLElement;
    id: string;
    date: number;
    constructor(el: HTMLElement, options?: Record<string, any>) {
        super();
        this.el = el;
        if (typeof options == 'object') Object.assign(this, util.clone(options));
        if (typeof this.id == 'undefined') this.id = util.guid();
        if (typeof this.date == 'undefined') this.date = new Date().getTime();
        this.init();
    }
    private async init() {
        await this.emit('init');
    }
    async load(data: Record<string, any>) {
        await this.emit('loading');
        for (var n in data) {
            if (n == 'views') continue;
            else if (n == 'pageLayout') {
                this.pageLayout = new PageLayout(this, data[n]);
            }
            this[n] = data[n];
        }
        if (Array.isArray(data.views)) {
            for (var i = 0; i < data.views.length; i++) {
                var dv = data.views[i];
                var dc = BlockFactory.createBlock(dv.name, this);
                await dc.load(dv);
                this.views.push(dc as View);
            }
        }
        if (typeof this.pageLayout == 'undefined') this.pageLayout = new PageLayout(this);
        await this.emit('loaded');
    }
    async get() {
        var json: Record<string, any> = { id: this.id, date: this.date };
        json.pageLayout = this.pageLayout.get();
        json.views = await this.views.asyncMap(async x => {
            return await x.get()
        })
        return json;
    }
    pageLayout: PageLayout;
    views: View[] = [];
    onError(error: Error) {

    }
    render() {
        ReactDOM.render(
            <div className='kanhai'>
                <PageLayout.view pageLayout={this.pageLayout}>
                    {this.views.map(x => {
                        return <x.viewComponent key={x.id} model={x} />
                    })}
                </PageLayout.view>
            </div>,
            this.el
        );
    }
}
export interface Page extends PageOperator { }
util.inherit(Page, PageOperator)