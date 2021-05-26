

import { Page } from "..";
import { PageLayoutView } from './render';
/**
 * 版面，尽量设计上要统一
 * 海报、ppt(是否支持像ppt那样，一页一页的可以演示,每一页都是view),主要是用来支持单页面营销的
 * 网页（网页宽屏、窄屏，正常的站点开发，主要支持手机模式，ipad模式等）
 * 海报与网页的区别在于海报可能会有多个(view block),而网页只有一个，且高度没有任何限制，长度过长可以产生滚动条呗
 */
export enum PageLayoutType {
    web = 1,
    ppt = 2,
}
export class PageLayout {
    type: PageLayoutType;
    screen: 'web' | 'mobile';
    screenWidth: number;
    screenHeight: number;
    page: Page;
    render: PageLayoutView;
    constructor(page: Page, options?: Record<string, any>) {
        this.page = page;
        if (typeof options != 'undefined') {
            for (var op in options) {
                this[op] = options[op];
            }
        }
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
}



