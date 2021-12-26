import { Page } from "../page";
import { PageLayoutType } from "./declare";
import { PageLayoutView } from './view';
import "./style.less";
export class PageLayout {
    type: PageLayoutType;
    screen: 'web' | 'mobile';
    screenWidth: number;
    screenHeight: number;
    page: Page;
    view: PageLayoutView;
    constructor(page: Page, options?: Record<string, any>) {
        this.page = page;
        if (typeof options != 'undefined') {
            for (var op in options) {
                this[op] = options[op];
            }
        }
        if (typeof this.type == 'undefined') this.type = PageLayoutType.doc;
    }
    async get() {
        var json: Record<string, any> = {
            type: this.type,
            screen: this.screen,
            screenWidth: this.screenWidth,
            screenHeight: this.screenHeight
        };
        return json;
    }
    get el() {
        return this.view.el;
    }
    contains(el: HTMLElement) {
        return this.el.contains(el);
    }
}



