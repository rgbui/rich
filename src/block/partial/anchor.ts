import { Block } from "..";
import { BlockAppear, AppearAnchor } from "../appear";
import { BlockUrlConstant } from "../constant";

/**
 * 主要是用来确定光标的上下左右移动
 */
export class Block$Anchor {
    

    async visibleDownCreateBlock(this: Block, url: string, data: Record<string, any> = {}) {
        var row = this.closest(x => x.isBlock);
        return await this.page.createBlock(url, { ...data }, row.parent, row.at + 1, row.parent.childKey);
    }
    async visibleUpCreateBlock(this: Block, url: string, data: Record<string, any>) {
        var row = this.closest(x => x.isBlock);
        return await this.page.createBlock(url, { ...data }, row.parent, row.at, row.parent.childKey);
    }

    async visibleRightCreateBlock(this: Block, at: number, url: string, data: Record<string, any>) {
        if (this.isTextContent) {
            var frontConent = this.content.slice(0, at);
            var latterContent = this.content.slice(at);
            var index = this.at;
            var newBlock: Block;
            if (frontConent) {
                await this.updateProps({ content: frontConent });
                newBlock = await this.page.createBlock(url, data, this.parent, index + 1);
                if (latterContent) {
                    var cd = await this.cloneData(); cd.content = latterContent;
                    await this.page.createBlock(this.url, cd, this.parent, index + 2);
                }
            }
            else if (latterContent) {
                newBlock = await this.page.createBlock(url, data, this.parent, index);
                await this.updateProps({ content: latterContent });
            }
            else {
                newBlock = await this.page.createBlock(url, data, this.parent, index);
                await this.delete()
            }
            return newBlock;
        }
        else if (this.isLineSolid) {
            return await this.page.createBlock(url, data, this.parent, this.at + 1);
        }
        else {
            var frontConent = this.content.slice(0, at);
            var latterContent = this.content.slice(at);
            await this.updateProps({ content: '' });
            var index = 0;
            if (frontConent) await this.page.createBlock(BlockUrlConstant.Text, { content: frontConent }, this, index++);
            var newBlock = await this.page.createBlock(url, data, this, index++);
            if (latterContent) await this.page.createBlock(BlockUrlConstant.Text, { content: latterContent }, this, index++);
            return newBlock;
        }
    }


    focusAnchor(this: Block, anchor: AppearAnchor) {

    }
    blurAnchor(this: Block, anchor: AppearAnchor) {

    }
    elementAppear(this: Block, elementAppear: Partial<AppearAnchor>) {
        if (!elementAppear.el) return;
        var el = elementAppear.el;
        if (!el.classList.contains('shy-appear-text') && !el.classList.contains('shy-appear-solid')) {
            var fe: HTMLElement;
            var childEl = el.querySelector('.shy-appear-text');
            if (childEl) fe = childEl as HTMLElement;
            else {
                var c = el.querySelector('.shy-appear-solid');
                if (c) fe = c as HTMLElement;
            }
            if (fe) el = fe;
            else throw 'not found element appear text or solid ';
        }
        elementAppear.el = el;
        if (typeof elementAppear.appear == 'undefined') {
            if (elementAppear.el.classList.contains('shy-appear-text')) elementAppear.appear = BlockAppear.text;
            else if (elementAppear.el.classList.contains('shy-appear-solid')) elementAppear.appear = BlockAppear.solid;
        }
        if (elementAppear.appear == BlockAppear.text
            &&
            typeof elementAppear.prop == 'undefined'
        ) elementAppear.prop = 'content';
        if (!this.__appearAnchors.exists(x => x.prop == elementAppear.prop))
            this.__appearAnchors.push(new AppearAnchor(this, elementAppear.el, elementAppear.appear, elementAppear.prop, elementAppear.plain || false,elementAppear.defaultValue))
        else {
            var ep = this.__appearAnchors.find(g => g.prop == elementAppear.prop);
            if (ep) {
                ep.el = elementAppear.el;
            }
        }
    }
    elementAppearEvent(this: Block, prop: string, eventName: string, event: any) {
        var aa = this.appearAnchors.find(g => g.prop == prop);
        if (aa) {
            if (typeof this.page.kit.writer[eventName] == 'function')
                this.page.kit.writer[eventName](aa, event);
        }
    }
}