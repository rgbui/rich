import ReactDOM from "react-dom";
import { Page } from "..";
import { langProvider } from "../../../i18n/provider";
import { Block } from "../../block";
import { View } from "../../block/element/view";
import { BlockFactory } from "../../block/factory/block.factory";
import { ConfigViewer } from "../../config";
import { UserAction } from "../../history/action";
import { ActionDirective, OperatorDirective } from "../../history/declare";
import { PageDirective } from "../directive";
import { PageHistory } from "../interaction/history";
import { PageKeys } from "../interaction/keys";
import JSZip from 'jszip';
import { BlockUrlConstant } from "../../block/constant";
import { PageLayoutType } from "../declare";
import { GridMap } from "../grid";
import { Matrix } from "../../common/matrix";
import { util } from "echarts";
import lodash from "lodash";

export class Page$Cycle {
    async init(this: Page) {
        this.gridMap = new GridMap(this);
        this.configViewer = new ConfigViewer(this);
        this.configViewer.loadPageConfig({
            fontCss: {
                lineHeight: 24,
                letterSpacing: 0,
                fontSize: 16,
                fontStyle: 'normail'
            } as any
        });
        this.configViewer.loadWorkspaceConfig({
            fontCss: {

            } as any
        });
        PageHistory(this, this.snapshoot);
        PageKeys(this, this.keyboardPlate);
        this.emit(PageDirective.init);
        await langProvider.import();
    }
    async load(this: Page, data?: Record<string, any>) {
        try {
            if (!data || typeof data == 'object' && Object.keys(data).length == 0) {
                //这里加载默认的页面数据
                data = await this.getDefaultData();
            }
            else this.requireSelectLayout = false;
            await this.emit(PageDirective.loading);
            for (var n in data) {
                if (n == 'views') continue;
                else if (n == 'matrix') {
                    this.matrix = new Matrix(...data[n]);
                }
                else this[n] = util.clone(data[n]);
            }
            if (Array.isArray(data.views)) {
                for (var i = 0; i < data.views.length; i++) {
                    var dv = data.views[i];
                    var dc = await BlockFactory.createBlock(dv.url, this, dv, null);
                    this.views.push(dc as View);
                }
            }
            if (typeof this.pageLayout == 'undefined') this.pageLayout = { type: PageLayoutType.doc };

            if ([
                PageLayoutType.dbForm,
                PageLayoutType.dbPickRecord,
                PageLayoutType.dbSubPage
            ].some(s => s == this.pageLayout.type)) {
                this.requireSelectLayout = false;
            }
            await this.onRepair();
            await this.emit(PageDirective.loaded);
        }
        catch (ex) {
            this.onError(ex);
            console.error(ex);
            console.log(JSON.stringify(data));
        }
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
            date: this.date,
            cover: util.clone(this.cover),
            isFullWidth: this.isFullWidth,
            smallFont: this.smallFont,
            version: this.version
        };
        json.requireSelectLayout = this.requireSelectLayout;
        json.pageLayout = util.clone(this.pageLayout);
        json.matrix = this.matrix.getValues();
        json.views = await this.views.asyncMap(async x => {
            return await x.get()
        })
        return json;
    }
    async getString(this: Page) {
        return JSON.stringify(await this.get());
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
    private willUpdateAll: boolean = false;
    private willUpdateBlocks: Block[];
    private willLayoutBlocks: Block[];
    private updatedFns: (() => Promise<void>)[] = [];
    addPageUpdate() {
        this.willUpdateAll = true;
    }
    addBlockUpdate(block: Block) {
        if (this.willUpdateBlocks) {
            var pa = this.willUpdateBlocks.find(g => g.contains(block));
            if (!pa) this.willUpdateBlocks.push(block);
        }
    }
    addBlockClearLayout(block: Block) {
        if (this.willLayoutBlocks && !this.willLayoutBlocks.exists(block))
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
    private notifyUpdateBlock(this: Page) {
        var ups = this.willUpdateBlocks.map(c => c);
        var fns = this.updatedFns.map(f => f);
        this.willUpdateBlocks = [];
        this.updatedFns = [];
        var self = this;
        var fn = async function () {
            try {
                if (self.willUpdateAll) await self.forceUpdate();
                else await ups.eachAsync(async (up) => {
                    await up.forceUpdate();
                })
            }
            catch (ex) {
                this.onError(ex);
            }
            await fns.eachAsync(async g => await g());
        }
        fn()
    }
    private async notifyUpdateBlockAsync(this: Page) {
        var ups = this.willUpdateBlocks.map(c => c);
        var fns = this.updatedFns.map(f => f);
        this.willUpdateBlocks = [];
        this.updatedFns = [];
        var self = this;
        var fn = async function () {
            try {
                if (self.willUpdateAll) await self.forceUpdate();
                else
                    await ups.eachAsync(async (up) => {
                        await up.forceUpdate();
                    })
            }
            catch (ex) {
                this.onError(ex);
            }
            await fns.eachAsync(async g => await g());
        }
        await fn()
    }
    async onAction(this: Page, directive: ActionDirective | string, fn: () => Promise<void>) {
        await this.snapshoot.sync(directive, async () => {
            this.willUpdateBlocks = [];
            this.willLayoutBlocks = [];
            this.willUpdateAll = false;
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
                this.notifyUpdateBlock();
            }
        })
    }
    async onActionAsync(this: Page, directive: ActionDirective | string, fn: () => Promise<void>) {
        await this.snapshoot.sync(directive, async () => {
            this.willUpdateBlocks = [];
            this.willLayoutBlocks = [];
            this.willUpdateAll = false;
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
                await this.notifyUpdateBlockAsync();
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
        if (this.isFocus == false) {
            this.isFocus = true;
            this.emit(PageDirective.focus, event);
        }
    }
    onBlur(this: Page, event: FocusEvent) {
        if (this.isFocus == true) {
            this.isFocus = false;
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
     * 修复一些不正常的block
     */
    async onRepair(this: Page) {
        var rs: Block[] = [];
        await this.views.eachAsync(async (view) => {
            view.eachReverse(b => {
                /**
                 * 如果是空文本块，则删除掉空文本块
                 */
                if (b.isTextContent && !b.content) {

                    rs.push(b);
                }
                /**
                 * 如果当前的block是row,col，但没有子元素块,
                 * 那么block应该需要删除
                 */
                else if ((b.isRow || b.isCol) && !b.isPart && !b.hasChilds) {
                    rs.push(b);
                }
            });
            return
        });

        await rs.eachAsync(async r => {
            r.parentBlocks.remove(r);
        })
    }
    async getOutLines(this: Page) {
        var outlines: { id: string, head: string, text: string }[] = [];
        var bs = this.findAll(x => x.url == BlockUrlConstant.Head);
        outlines = bs.map(b => {
            return {
                id: b.id,
                head: (b as any).level,
                text: b.childs.length > 0 ? b.childs.map(c => c.content).join("") : b.content
            }
        })
        return outlines;
    }

    async updateProps(this: Page, props: Record<string, any>) {
        var oldValue: Record<string, any> = {};
        var newValue: Record<string, any> = {};
        for (let prop in props) {
            if (!lodash.isEqual(lodash.get(this, prop), lodash.get(props, prop))) {
                oldValue[prop] = util.clone(lodash.get(this, prop));
                newValue[prop] = util.clone(lodash.get(props, prop));
                lodash.set(this, prop, util.clone(lodash.get(props, prop)));
            }
        }
        if (Object.keys(oldValue).length > 0 || Object.keys(newValue).length > 0) {
            this.snapshoot.record(OperatorDirective.pageUpdateProp, {
                old: oldValue,
                new: newValue
            }, this);
        }
    }
    async onUpdateProps(this: Page, props: Record<string, any>, isUpdate?: boolean) {
        await this.onAction(ActionDirective.onPageUpdateProps, async () => {
            await this.updateProps(props);
        });
        if (isUpdate) { this.view.forceUpdate(); console.log('ggg'); }
    }
}