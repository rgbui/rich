
import { Events } from "../../util/events";
import { View } from "../block/view";
import { PageLayout } from "../layout";
export class Page extends Events {
    private el: HTMLElement;
    constructor(el: HTMLElement) {
        super();
        this.el = el;
        this.init();
    }
    private init() {
        this.emit('init');
    }
    async load(data: Record<string, any>) {
        this.emit('loading');
        this.emit('loaded');
    }
    async get() {

    }
    pageLayout: PageLayout;
    views: View[] = [];
}