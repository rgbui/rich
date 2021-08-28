import ReactDOM from "react-dom";
import { Page } from "..";
import { InputDetector } from "../../../extensions/input.detector/detector";
import { util } from "../../../util/util";
import { Block } from "../../block";
import { View } from "../../block/element/view";
import { BlockFactory } from "../../block/factory/block.factory";
import { ConfigurationManager } from "../../config";
import { ActionDirective, OperatorDirective } from "../../history/declare";
import { HistorySnapshoot } from "../../history/snapshoot";
import { Kit } from "../../kit";
import { PageLayout } from "../../layout";
import { PageDirective } from "../directive";
import { PageInputDetector } from "../interaction/detector";
import { PageHistory } from "../interaction/history";
import { PageKeys } from "../interaction/keys";
import { PageKit } from "../interaction/kit";
import { TemporaryPurpose } from "./declare";



export class Page$Cycle {
    async init(this: Page) {
        this.cfm = new ConfigurationManager(this);
        this.cfm.loadPageConfig({
            fontCss: {
                lineHeight: 20,
                letterSpacing: 0,
                fontSize: 14,
                fontStyle: 'normail'
            } as any
        });
        this.cfm.loadWorkspaceConfig({
            fontCss: {

            } as any
        });
        this.kit = new Kit(this);
        PageKit(this.kit);
        this.snapshoot = new HistorySnapshoot(this);
        PageHistory(this, this.snapshoot);
        PageKeys(this, this.keyboardPlate);
        this.inputDetector = new InputDetector();
        PageInputDetector(this, this.inputDetector);
        this.emit(PageDirective.init);
    }

    async load(this: Page, data: Record<string, any>) {
        if (!data) {
            //这里加载默认的页面数据
            data = await this.getDefaultData();
        }
        await this.emit(PageDirective.loading);
        for (var n in data) {
            if (n == 'views') continue;
            else if (n == 'pageLayout') {
                this.pageLayout = new PageLayout(this, data[n]); continue;
            }
            this[n] = data[n];
        }
        if (Array.isArray(data.views)) {
            for (var i = 0; i < data.views.length; i++) {
                var dv = data.views[i];
                var dc = await BlockFactory.createBlock(dv.url, this, dv, null);
                this.views.push(dc as View);
            }
        }
        if (typeof this.pageLayout == 'undefined') this.pageLayout = new PageLayout(this);
        await this.emit(PageDirective.loaded);
    }
    async get(this: Page) {
        var json: Record<string, any> = {
            id: this.id,
            date: this.date
        };
        json.pageLayout = await this.pageLayout.get();
        json.views = await this.views.asyncMap(async x => {
            return await x.get()
        })
        return json;
    }
 
    async getDefaultData() {
        var r = await import("../default.page");
        return r.data;
    }
    private willUpdateBlocks: Block[];
    private updatedFns: (() => Promise<void>)[] = [];
    onReadyUpdate() {
        this.willUpdateBlocks = [];
        this.updatedFns = [];
    }
    onAddUpdate(block: Block) {
        var pa = this.willUpdateBlocks.find(g => g.contains(block));
        if (!pa) this.willUpdateBlocks.push(block);
    }
    /**
     * 绑定更新后触发的事件
     * @param fn 
     */
    onUpdated(fn: () => Promise<void>) {
        this.updatedFns.push(fn);
    }
    /**
     * 触发需要更新的view,
     * 这个可以手动触发多次
     */
    onExcuteUpdate() {
        var ups = this.willUpdateBlocks.map(c => c);
        this.willUpdateBlocks = [];
        var len = ups.length;
        var count = 0;
        var self = this;
        var updated = async () => {
            await self.updatedFns.eachAsync(async g => await g());
            self.updatedFns = [];
        }
        ups.each(up => {
            up.view.forceUpdate(() => {
                count += 1;
                if (count === len) updated()
            });
        });
    }
    async onObserveUpdate(fn: () => Promise<void>) {
        this.onReadyUpdate();
        if (typeof fn == 'function') {
            await fn();
        }
        this.onExcuteUpdate();
    }
    async onAction(this: Page, directive: ActionDirective | string, fn: () => Promise<void>) {
        await this.snapshoot.sync(directive, async () => {
            await this.onObserveUpdate(async () => {
                if (typeof fn == 'function') {
                    try {
                        await fn();
                    }
                    catch (ex) {
                        this.onError(ex);
                    }
                }
            })
        })
    }
    onUnmount(this: Page) {
        ReactDOM.unmountComponentAtNode(this.root);
    }
    onError(this: Page, error: Error) {
        this.emit(PageDirective.error, error);
    }
    onWarn(this: Page, error: string | Error) {
        this.emit(PageDirective.warn, error);
    }
    onFocus(this: Page, event: FocusEvent) {
        this.kit.textInput.onFocus();
        if (this.isFocus == false) {
            this.isFocus = true;
            this.emit(PageDirective.focus, event);
        }
    }
    onBlur(this: Page, event: FocusEvent) {
        if (this.isFocus == true) {
            this.isFocus = false;
            this.blockSelector.close();
            this.textTool.close();
            this.kit.explorer.blur();
            this.emit(PageDirective.blur, event);
        }
    }

      /**
     * 申明一个临时的缓存标记，当前的数据均以这个标记做为标记，
     * 如果该标记发生变化，那么数据会重新获取
     * TemporaryPurpose 表示当前的缓存标记的用途是什么
     * 有一些操作频率是很高的，相关的计算结果，可以暂时性的缓存下来
     */
       private temporarys: { flag: string, purpose: TemporaryPurpose }[];
       onDeclareTemporary(purpose: TemporaryPurpose) {
           if (!Array.isArray(this.temporarys)) this.temporarys = [];
           var tp = this.temporarys.find(g => g.purpose == purpose);
           if (!tp) {
               tp = { purpose, flag: undefined };
               this.temporarys.push(tp);
           }
           tp.flag = util.guid();
       }
       getTemporaryFlag(purpose: TemporaryPurpose) {
           if (!Array.isArray(this.temporarys)) this.temporarys = [];
           var tp = this.temporarys.find(g => g.purpose == purpose);
           if (tp) { return tp.flag }
           else null;
       }
}