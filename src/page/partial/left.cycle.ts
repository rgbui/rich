import ReactDOM from "react-dom";
import { Page } from "..";
import { langProvider } from "../../../i18n/provider";
import { util } from "../../../util/util";
import { Block } from "../../block";
import { View } from "../../block/element/view";
import { BlockFactory } from "../../block/factory/block.factory";
import { ConfigurationManager } from "../../config";
import { UserAction } from "../../history/action";
import { ActionDirective } from "../../history/declare";
import { PageLayout } from "../../layout";
import { PageDirective } from "../directive";
import { PageHistory } from "../interaction/history";
import { PageKeys } from "../interaction/keys";
import { TemporaryPurpose } from "./declare";
import JSZip from 'jszip';

export class Page$Cycle {
    async init(this: Page) {
        this.cfm = new ConfigurationManager(this);
        this.cfm.loadPageConfig({
            fontCss: {
                lineHeight: 24,
                letterSpacing: 0,
                fontSize: 16,
                fontStyle: 'normail'
            } as any
        });
        this.cfm.loadWorkspaceConfig({
            fontCss: {

            } as any
        });
        PageHistory(this, this.snapshoot);
        PageKeys(this, this.keyboardPlate);
        this.emit(PageDirective.init);
        await langProvider.import();
    }
    async load(this: Page, data?: Record<string, any>) {
        if (!data || typeof data == 'object' && Object.keys(data).length == 0) {
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
        await this.onRepair();
        await this.emit(PageDirective.loaded);
    }
    async loadUserActions(this: Page, actions: UserAction[]) {
        for (let i = 0; i < actions.length; i++) {
            let action = actions[i];
            await this.snapshoot.redoUserAction(action);
        }
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
    async getFile(this: Page) {
        var zip = new JSZip();
        zip.file("page.shy", JSON.stringify(await this.get()));
        var zipFile = await zip.generateAsync({
            type: 'blob',
            compression: "DEFLATE" // <-- here 
        });
        return zipFile;
    }
    async loadFile(this: Page, blob: Blob) {
        if (blob) {
            var zip = new JSZip();
            var rj = await zip.loadAsync(blob);
            var str = await rj.file('page.shy').async("string");
            var content = JSON.parse(str);
            await this.load(content);
        }
        else await this.load()
    }
    async getDefaultData() {
        var r = await import("../default.page");
        return r.data;
    }
    onSave(this: Page) {
        this.emit(PageDirective.save);
    }
    private willUpdateBlocks: Block[];
    private willLayoutBlocks: Block[];
    private updatedFns: (() => Promise<void>)[] = [];
    addBlockUpdate(block: Block) {
        var pa = this.willUpdateBlocks.find(g => g.contains(block));
        if (!pa) this.willUpdateBlocks.push(block);
    }
    addBlockClearLayout(block: Block) {
        if (!this.willLayoutBlocks.exists(block))
            this.willLayoutBlocks.push(block);
    }
    /**
     * 绑定更新后触发的事件
     * @param fn 
     */
    addUpdateEvent(fn: () => Promise<void>) {
        this.updatedFns.push(fn);
    }
    /**
     * 触发需要更新的view,
     * 这个可以手动触发多次
     */
    private onNotifyUpdateBlock(this: Page,) {
        var ups = this.willUpdateBlocks.map(c => c);
        var fns = this.updatedFns.map(f => f);
        this.willUpdateBlocks = [];
        this.updatedFns = [];
        (async function () {
            try {
                await ups.eachAsync(async (up) => {
                    await up.forceUpdate();
                })
            }
            catch (ex) {
                this.onError(ex);
            }
            await fns.eachAsync(async g => await g());
        })()
    }
    async onAction(this: Page, directive: ActionDirective | string, fn: () => Promise<void>) {
        await this.snapshoot.sync(directive, async () => {
            this.willUpdateBlocks = [];
            this.willLayoutBlocks = [];
            this.updatedFns = [];
            try {
                if (typeof fn == 'function') await fn();
            } catch (ex) {
                this.onError(ex);
            }
            finally {
                try {
                    if (Array.isArray(this.willLayoutBlocks) && this.willLayoutBlocks.length > 0) {
                        var bs = this.willLayoutBlocks;
                        await bs.eachAsync(async (block) => {
                            await block.layoutCollapse();
                        });
                        this.willLayoutBlocks = [];
                    }
                }
                catch (ex) {
                    this.onError(ex);
                }
                this.onNotifyUpdateBlock();
            }
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
            this.kit.explorer.blur();
            this.emit(PageDirective.blur, event);
        }
    }
    public hoverBlock: Block;
    onHoverBlock(this: Page, block: Block) {
        var isChange = this.hoverBlock != block;
        if (isChange && this.hoverBlock) {
            this.onOutHoverBlock(this.hoverBlock);
        }
        if (isChange) {
            this.hoverBlock = block;
            if (this.hoverBlock?.el) {
                this.hoverBlock.el.classList.add('shy-block-hover');
            }
            this.emit(PageDirective.hoverBlock, this.hoverBlock);
        }
        if (this.hoverBlock) this.kit.handle.onShowBlockHandle(this.hoverBlock);
        else this.kit.handle.onCloseBlockHandle();
    }
    onOutHoverBlock(this: Page, block: Block) {
        if (block?.el) {
            block.el.classList.remove('shy-block-hover');
        }
        this.emit(PageDirective.hoverOutBlock, block);
        this.kit.handle.onCloseBlockHandle();
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
    /**
     * 修复一些不正常的block
     */
    async onRepair(this: Page) {
        await this.views.eachAsync(async (view) => {
            view.eachReverse(b => {
                /**
                 * 如果是空文本块，则删除掉空文本块
                 */
                if (b.isTextContent && !b.content) {
                    b.parentBlocks.remove(b);
                }
                /**
                 * 如果当前的block是row,col，但没有子元素块,
                 * 那么block应该需要删除
                 */
                else if ((b.isRow || b.isCol) && !b.isPart && !b.hasChilds) {
                    b.parentBlocks.remove(b);
                }
            })
            return
        })
    }
}