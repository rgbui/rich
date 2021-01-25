
import { Component } from "react";
import { Events } from "../../../util/events";
import { util } from "../../../util/util";
import { Page } from "../../page";
import { BlockFactory } from "../block.factory";
import { BlockClass } from "../common.enum";
import { Style } from "../style";
import { BaseComponent } from "./component";

export class BaseBlock extends Events {
    childs: BaseBlock[] = [];
    parent: BaseBlock;
    name: BlockClass;
    page: Page;
    id: string;
    date: number;
    styles: Style[] = [];
    styleId: string;
    get style() {
        return this.styles.find(x => x.id == this.styleId);
    }
    constructor(page: Page) {
        super();
        this.id = util.guid();
        this.date = new Date().getTime();
        this.page = page;
    }
    find(predict: (block: BaseBlock) => boolean, considerSelf?: boolean): BaseBlock {
        if (considerSelf == true && predict(this)) return this;
        return this.childs.arrayJsonFind('childs', predict);
    }
    findAll(predict: (block: BaseBlock) => boolean, considerSelf?: boolean): BaseBlock[] {
        var blocks: BaseBlock[] = [];
        if (considerSelf == true && predict(this)) { blocks.push(this) }
        let childBlocks = this.childs.arrayJsonFindAll('childs', predict);
        return blocks.concat(childBlocks);
    }
    closest(predict: (block: BaseBlock) => boolean, ignoreSelf?: boolean) {
        if (ignoreSelf !== true && predict(this)) return this;
        var pa = this.parent;
        while (true) {
            if (pa && predict(pa) == true) return pa;
            else {
                if (!pa) break;
                pa = pa.parent;
            }
        }
    }
    parents(predict: (block: BaseBlock) => boolean, ignoreSelf?: boolean) {
        var blocks: BaseBlock[] = [];
        if (ignoreSelf !== true && predict(this)) blocks.push(this);
        var pa = this.parent;
        while (true) {
            if (!pa) break;
            else if (predict(pa)) blocks.push(pa);
            pa = pa.parent;
        }
        return blocks;
    }
    get at() {
        if (this.parent)
            return this.parent.childs.findIndex(x => x === this);
    }
    get prev(): BaseBlock {
        var at = this.at;
        if (at > 0 && this.parent) return this.parent.childs[at - 1];
    }
    get next(): BaseBlock {
        var at = this.at;
        if (this.parent && at < this.parent.childs.length - 1) return this.parent.childs[at + 1];
    }
    isLoad = false;
    async load(data) {
        try {
            for (var n in data) {
                if (n == 'childs') continue;
                else if (n == 'styles') continue;
                this[n] = data[n];
            }
            if (Array.isArray(data.styles)) {
                this.styles = [];
                await data.styles.each(async (style) => {
                    var st = new Style(this);
                    await st.load(style);
                    this.styles.push(st)
                })
            }
            if (Array.isArray(data.childs)) {
                await data.childs.each(async (dc) => {
                    var block = BlockFactory.createBlock(dc.name, this.page);
                    await block.load(dc);
                    this.childs.push(block);
                })
            }
            this.isLoad = true;
        }
        catch (err) {
            this.page.onError(err);
        }
    }
    async get() {
        var json: Record<string, any> = { id: this.id, name: this.name };
        json.styles = await this.styles.asyncMap(async x => await x.get());
        json.childs = await this.childs.asyncMap(async x => await x.get());
        return json;
    }
    viewComponent: typeof BaseComponent | ((props: any) => JSX.Element)
    view: BaseComponent<this>;
    watch(key: string, newValue, oldValue) {
        if (this.isLoad == true) {
            // console.log(key, newValue, oldValue, this, this.view);
            if (this.view && typeof this.view.forceUpdate == 'function') {
                this.view.forceUpdate();
            }
        }
    }
    el: HTMLElement;
    /***
     * 判断鼠标点击是否处于文字区域
     */
    mousedownIsInTextArea(event: MouseEvent): boolean {
        return false;
    }
}