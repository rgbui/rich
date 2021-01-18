
import { Events } from "../../util/events";
import { util } from "../../util/util";
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

        await this.emit('loaded');
    }
    async get() {

    }
    pageLayout: PageLayout;
    views: View[] = [];
}

export interface Page extends PageOperator { }
util.inherit(Page, PageOperator)