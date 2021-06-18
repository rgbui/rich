


import { FontCss } from "../block/pattern/css";
import { Page } from "../page";
import { PageConfig, WorkspaceConfig } from "./type";
export class ConfigurationManager {
    private page: Page;
    constructor(page: Page) {
        this.page = page;
    }
    pageConfig: PageConfig;
    workspaceConfig: WorkspaceConfig;
    loadPageConfig(config: Partial<PageConfig>) {
        if (config) {
            this.pageConfig = {
                fontCss: new FontCss()
            } as any;
            for (var n in config) {
                if (n == 'fontCss') {
                    this.pageConfig.fontCss = new FontCss(config[n]);
                }
            }
        }
    }
    loadWorkspaceConfig(config: Partial<WorkspaceConfig>) {
        if (config) {
            this.workspaceConfig = { fontCss: new FontCss() } as any;
            for (var n in config) {
                if (n == 'fontCss') {
                    this.workspaceConfig.fontCss = new FontCss(config[n]);
                }
            }
        }
    }
    get fontCss() {
        return this.workspaceConfig.fontCss.overlay(this.pageConfig.fontCss as FontCss);
    }
}