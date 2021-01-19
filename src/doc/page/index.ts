
import { Events } from "../../util/events";
import { util } from "../../util/util";
import { BlockFactory } from "../block/block.factory";
import { View } from "../block/view";
import { PageLayout } from "../layout";
import { PageOperator } from "./operator";
export class Page extends Events {
    private el: HTMLElement;
    constructor(el: HTMLElement) {
        super();
        this.el = el;
        this.init();
    }
    private async init() {
        await this.emit('init');
    }
    async load(data: Record<string, any>) {
        await this.emit('loading');
        for (var n in data) {
            if (n == 'views') continue;
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
        await this.emit('loaded');
    }
    async get() {

    }
    pageLayout: PageLayout;
    views: View[] = [];
}
export interface Page extends PageOperator { }
util.inherit(Page, PageOperator)