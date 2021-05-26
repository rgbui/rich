import { FontCss } from "../block/pattern/css";
import { Page } from "../page";
import { PageConfig, WorkspaceConfig } from "./workspace";
export declare class ConfigurationManager {
    private page;
    constructor(page: Page);
    pageConfig: PageConfig;
    workspaceConfig: WorkspaceConfig;
    loadPageConfig(config: Partial<PageConfig>): void;
    loadWorkspaceConfig(config: Partial<WorkspaceConfig>): void;
    get fontCss(): FontCss;
}
