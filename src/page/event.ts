import ReactDOM from "react-dom";
import { Page } from ".";
import { Block } from "../block";
import { BlockFactory } from "../block/factory/block.factory";
import { dom } from "../common/dom";
import { KeyboardCode } from "../common/keys";
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
        this.textTool.close();
        this.mouseScope.isDown = true;
        this.mouseScope.point = Point.from(event);
        var toEle = event.target as HTMLElement;
        var blockEle = dom(toEle).closest(x => (x as any).block ? true : false);
        if (blockEle) {
            var block = (blockEle as any).block as Block;
            var anchor = block.visibleAnchor(Point.from(event));
            if (anchor) {
                if (anchor.block.isLayout) {
                    throw 'not anchor layout block'
                }
                this.selector.explorer.onReplaceSelection(anchor);
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
                        this.selector.explorer.onJoinSelection(anchor);
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
            if (this.mouseScope.isMove && this.selector.explorer.selections.exists(g => g.hasRange)) {
                if (this.textTool.isVisible != true)
                    this.textTool.open(event);
            }
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
        /**
         * 如果当前的texttool打开且焦点在texttool，那么此时不是失焦
         */
        if (this.textTool.isVisible == true && this.textTool.isDown) { return; }
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
            this.textTool.close();
            this.emit('blur', event);
        }
    }
    /**
     * 主要是捕获取当前页面用户的按键情况
     * @param this 
     * @param event 
     */
    onKeydown(this: Page, event: KeyboardEvent) {
        this.keyboardPlate.keydown(event);
        if (this.keyboardPlate.is(KeyboardCode.Backspace, KeyboardCode.Delete)) {
            if (this.selector.explorer.hasSelectionRange) {
                this.selector.onDeleteSelection();
            }
        }
    }
    onKeyup(this: Page, event: KeyboardEvent) {
        this.keyboardPlate.keyup(event);
    }
    private willUpdateBlocks: Block[];
    onRememberUpdate() {
        this.willUpdateBlocks = [];
    }
    onAddUpdate(block: Block) {
        var pa = this.willUpdateBlocks.find(g => g.contains(block));
        if (!pa) this.willUpdateBlocks.push(block);
    }
    onExcuteUpdate(finishCompleted?: () => void) {
        var ups = this.willUpdateBlocks.map(c => c);
        this.willUpdateBlocks = [];
        var len = ups.length;
        var count = 0;
        ups.each(up => {
            up.view.forceUpdate(() => {
                count += 1;
                if (count === len && typeof finishCompleted == 'function') {
                    finishCompleted()
                }
            });
        });
    }
    async onObserveUpdate(fn: () => Promise<void>, finishedCompletedUpdate?: () => void) {
        this.onRememberUpdate();
        if (typeof fn == 'function') {
            await fn();
        }
        this.onExcuteUpdate(finishedCompletedUpdate);
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
    onUnmount(this: Page) {
        ReactDOM.unmountComponentAtNode(this.root);
        // this.viewRender.componentWillUnmount()
    }
    onBatchDelete(this: Page, blocks: Block[]) {
        this.snapshoot.declare(ActionDirective.onBatchDeleteBlocks);
        this.onRememberUpdate();
        blocks.each(bl => {
            bl.remove()
        });
        this.onExcuteUpdate();
        this.snapshoot.store();
    }
    async onBatchTurn(this: Page, blocks: Block[], url: string) {
        await this.onObserveUpdate(async () => {
            this.snapshoot.declare(ActionDirective.onBatchTurn)
            for (let i = 0; i < blocks.length; i++) {
                var bl = blocks[i];
                var data = await bl.get();
                await this.createBlock(url, data, bl.parent, bl.at);
                bl.remove();
            }
            this.snapshoot.store();
        })
    }
}