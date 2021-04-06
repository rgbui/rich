import { Events } from "../util/events";
import { View } from "../block/base/common/view";
import { PageConfig } from '../config';
import { Selector } from '../selector';
import { PageLayout } from "./layout/index";
import { PageEvent } from "./event";
import { PageView } from './view';
export declare class Page extends Events {
    el: HTMLElement;
    id: string;
    date: number;
    url: '/page';
    constructor(el: HTMLElement, options?: Record<string, any>);
    private init;
    config: PageConfig;
    loadPageConfig(config: Partial<PageConfig>): Promise<void>;
    load(data: Record<string, any>): Promise<void>;
    get(): Promise<Record<string, any>>;
    pageLayout: PageLayout;
    views: View[];
    selector: Selector;
    viewRender: PageView;
    keys: string[];
    isFocus: boolean;
    onError(error: Error): void;
    render(): void;
}
export interface Page extends PageEvent {
}
