import { Events } from "../util/events";
import { View } from "../block/base/common/view";
import { Selector } from '../selector';
import { PageLayout } from "./layout/index";
import { PageEvent } from "./event";
import { PageView } from './view';
import { User } from '../types/user';
import { HistorySnapshoot } from '../history/snapshoot';
import { Block } from '../block';
import { BlockSelector } from '../extensions/block';
import { ReferenceSelector } from '../extensions/reference';
import { BlockMenu } from '../extensions/menu/menu';
import { TextTool } from '../extensions/text.tool/text.tool';
import { ConfigurationManager } from '../config';
import { PageConfig, WorkspaceConfig } from '../config/workspace';
import { SyExtensionsComponent } from '../extensions/sy.component';
export declare class Page extends Events {
    el: HTMLElement;
    root: HTMLElement;
    id: string;
    date: number;
    private user;
    get creater(): User;
    snapshoot: HistorySnapshoot;
    constructor(el: HTMLElement, options?: Record<string, any>);
    private init;
    cfm: ConfigurationManager;
    load(data: Record<string, any>): Promise<void>;
    get(): Promise<Record<string, any>>;
    loadConfig(pageConfig: PageConfig, workspaceConfig: WorkspaceConfig): void;
    pageLayout: PageLayout;
    views: View[];
    selector: Selector;
    viewRender: PageView;
    blockSelector: BlockSelector;
    referenceSelector: ReferenceSelector;
    blockMenu: BlockMenu;
    textTool: TextTool;
    keys: string[];
    isFocus: boolean;
    onError(error: Error): void;
    render(): void;
    /**
     * 创建一个block
     * @param url
     * @param data
     * @param parent
     * @param at
     */
    createBlock(url: string, data: Record<string, any>, parent: Block, at?: number, childKey?: string): Promise<Block>;
    registerExtension(extension: SyExtensionsComponent): void;
}
export interface Page extends PageEvent {
}
