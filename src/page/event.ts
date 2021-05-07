import { Page } from ".";
import { Block } from "../block";
import { dom } from "../common/dom";
import { Point } from "../common/point";
import { ActionDirective } from "../history/declare";
export class PageEvent {
    private mouseScope: {
        isDown: boolean,
        point?: Point,
        isMove: boolean
    }
    /**
     * 鼠标点击页面,
     * 点的过程中有可能有按下不松开选择一个较大的区域情况，
     * 这个区域可以触发文字的选中效果，
     * 也可以按一定的条件触发矩形选择范围，例如图像或文本
     * 是否选择文字还是仅仅选择block对象取决于block本身
     * 点在空白处，在鼠标up时，可以检测，看有没有必要创建一个空白输入文本框
     * @param this 
     * @param event 
     * 
     */
    onMousedown(this: Page, event: MouseEvent) {
        if (!this.mouseScope) this.mouseScope = {} as any;
        this.blockSelector.close();
        this.mouseScope.isDown = true;
        this.mouseScope.point = Point.from(event);
        var toEle = event.target as HTMLElement;
        console.log(this.mouseScope);
        var blockEle = dom(toEle).closest(x => (x as any).block ? true : false);
        if (blockEle) {
            var block = (blockEle as any).block as Block;
            var anchor = block.visibleAnchor(Point.from(event));
            if (anchor) {
                if (anchor.block.isLayout) {
                    throw 'not anchor layout block'
                }
                this.selector.replaceSelection(anchor);
                this.selector.setActiveAnchor(anchor);
                this.selector.renderSelection();
            }
        }
    }
    onMousemove(this: Page, event: MouseEvent) {
        if (this.mouseScope && this.mouseScope.isDown == true) {
            if (this.mouseScope.isMove) {
                var toEle = event.target as HTMLElement;
                var blockEle = dom(toEle).closest(x => (x as any).block ? true : false);
                if (blockEle) {
                    var block = (blockEle as any).block as Block;
                    var anchor = block.visibleAnchor(Point.from(event));
                    if (anchor) {
                        this.selector.joinSelection(anchor);
                        this.selector.setActiveAnchor(anchor);
                        this.selector.renderSelection();
                        if (this.textTool.isVisible != true)
                            this.selector.openToolText(event);
                    }
                }
            }
            else if (this.mouseScope.point.remoteBy(Point.from(event), 10)) {
                this.mouseScope.isMove = true;
            }
        }
        var toEle = event.target as HTMLElement;
        var blockEle = dom(toEle).closest(x => (x as any).block && (x as any).block.page === this ? true : false);
        if (blockEle) {
            var block = (blockEle as any).block as Block;
            // if (this.selector.isDrag == true) {
            //     console.log('over ', blockEle);
            // }
            return this.selector.setOverBlock(block, event);
        }
        else {
            if (this.selector.isDrag == true) {
                var dis = 100;
                var el = document.elementFromPoint(event.x - dis, event.y);
                var blockEl: Node;
                if (el) {
                    blockEl = dom(el as HTMLElement).closest(x => (x as any).block && (x as any).block.page === this ? true : false)
                    if (!blockEl) el = null;
                }
                if (!el) {
                    el = document.elementFromPoint(event.x + dis, event.y);
                    if (el) blockEl = dom(el as HTMLElement).closest(x => (x as any).block && (x as any).block.page === this ? true : false)
                }
                if (blockEl) {
                    var bl: Block = (blockEl as any).block;
                    if (bl.isCol || bl.isRow) bl = bl.visiblePitFirstContent;
                    // console.log('block...', blockEl);
                    return this.selector.setOverBlock(bl, event);
                }
            }
        }
        this.selector.setOverBlock(null, event);
    }
    onMouseup(this: Page, event: MouseEvent) {
        if (this.mouseScope && this.mouseScope.isDown) {
            this.mouseScope.isMove = false;
            this.mouseScope.isDown = false;
            delete this.mouseScope.point;
            this.selector.onTextInputCaptureFocus()
        }
    }
    onFocusCapture(this: Page, event: FocusEvent) {
        this.onFocus(event);
        this.selector.onTextInputCaptureFocus();
    }
    onBlurCapture(this: Page, event: FocusEvent) {
        if (this.mouseScope && this.mouseScope.isDown) {
            /**
             * 说明鼠标是处于down下，这个不可能失焦
             * 如果当前的元素中有一些节点发生了改变，那么此时event.relatedTarget是空的，这很蛋疼
             * 这里通过鼠标状态的来纠正一下
             */
            return
        }
        var el = event.relatedTarget as Node;
        if (!el || el && (!this.el.contains(el) || el === this.el)) {
            this.onBlur(event);
        }
    }
    onFocus(this: Page, event: FocusEvent) {
        if (this.isFocus == false) {
            this.isFocus = true;
            this.emit('focus', event);
        }
    }
    onBlur(this: Page, event: FocusEvent) {
        if (this.isFocus == true) {
            this.isFocus = false;
            this.blockSelector.close();
            this.emit('blur', event);
        }
    }
    /**
     * 主要是捕获取当前页面用户的按键情况
     * @param this 
     * @param event 
     */
    onKeydown(this: Page, event: KeyboardEvent) {
        this.keys.push(event.key);
    }
    onKeyup(this: Page, event: KeyboardEvent) {
        this.keys.remove(event.key);
    }
    /**
     * 判断用户是否按了什么之类的
     * @param key 可以是函数，可以是key
     * @param keys  如果存在布尔的值，默认是全匹配
     */
    isKeys(this: Page, key: string | ((key: string) => boolean), ...keys: (string | boolean)[]) {
        if (typeof key == 'function') return this.keys.exists(key)
        else if (keys.exists(z => typeof z == 'boolean')) {
            var args = Array.from(arguments); args.remove(z => typeof z == 'boolean');
            return args.length == this.keys.length && args.trueForAll(z => this.keys.exists(z));
        }
        else return Array.from(arguments).trueForAll(z => this.keys.exists(z));
    }
    private updateBlocks: Block[];
    onRememberUpdate() {
        this.updateBlocks = [];
    }
    onAddUpdate(block: Block) {
        var pa = this.updateBlocks.find(g => g.contains(block));
        if (!pa) this.updateBlocks.push(block);
    }
    onExcuteUpdate() {
        var ups = this.updateBlocks.map(c => c);
        this.updateBlocks = [];
        ups.each(up => {
            up.view.forceUpdate();
        });
    }
    async onObserveUpdate(fn: () => Promise<void>) {
        this.onRememberUpdate();
        if (typeof fn == 'function') {
            await fn();
        }
        this.onExcuteUpdate();
    }
    async onAction(this: Page, directive: ActionDirective | string, fn: () => Promise<void>) {
        await this.onObserveUpdate(async () => {
            this.snapshoot.declare(directive);
            if (typeof fn == 'function') {
                try {
                    await fn();
                }
                catch (ex) {
                    this.onError(ex);
                }
            }
            this.snapshoot.store();
        })
    }
}