import { Page } from "../page";
import { PageLayoutType } from "./declare";
import { PageLayoutView } from './view';
import "./style.less";
export class PageLayout {
    type: PageLayoutType;
    screenWidth: number;
    screenHeight: number;
    page: Page;
    view: PageLayoutView;
    /**
     * 如果是文档，下面的content,col将起作用
     */
    content: 'content' | 'contentCover' | 'contentHeadFooter' | 'contents' = 'content';
    col: 'col' | 'col2' | 'col3' | 'colLeft' | 'colRight' = 'col';
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



