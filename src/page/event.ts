import ReactDOM from "react-dom";
import { Page } from ".";
import { Block } from "../block";
import { KeyboardCode } from "../common/keys";
import { BlockMenuAction } from "../extensions/menu/out.declare";
import { ActionDirective } from "../history/declare";
import { DropDirection } from "../kit/handle/direction";
import { Anchor } from "../kit/selection/anchor";
import { util } from "../util/util";
import { TemporaryPurpose } from "./declare";
export class PageEvent {
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
        this.kit.acceptMousedown(event);
        // if (!this.mouseScope) this.mouseScope = {} as any;
        // this.blockSelector.close();
        // this.textTool.close();
        // this.mouseScope.isDown = true;
        // this.mouseScope.point = Point.from(event);
        // var toEle = event.target as HTMLElement;
        // var blockEle = dom(toEle).closest(x => (x as any).block ? true : false);
        // if (blockEle) {
        //     var block = (blockEle as any).block as Block;
        //     var anchor = block.visibleAnchor(Point.from(event));
        //     if (anchor) {
        //         if (anchor.block.isLayout) {
        //             throw 'not anchor layout block'
        //         }
        //         this.selector.explorer.onReplaceSelection(anchor);
        //     }
        // }
        // var block = this.getEleBlock(event.target as HTMLElement);
        // if (block && !block.isLayout) {
        //     var anchor = block.visibleAnchor(Point.from(event));
        //     if (anchor) {
        //         this.selector.explorer.onReplaceSelection(anchor);
        //     }
        // }
    }
    onMousemove(this: Page, event: MouseEvent) {
        this.kit.acceptMousemove(event);
        // if (this.mouseScope && this.mouseScope.isDown == true) {
        //     if (this.mouseScope.isMove) {
        //         var toEle = event.target as HTMLElement;
        //         var blockEle = dom(toEle).closest(x => (x as any).block ? true : false);
        //         if (blockEle) {
        //             var block = (blockEle as any).block as Block;
        //             var anchor = block.visibleAnchor(Point.from(event));
        //             if (anchor) {
        //                 this.selector.explorer.onJoinSelection(anchor);
        //             }
        //         }
        //     }
        //     else if (this.mouseScope.point.remoteBy(Point.from(event), 10)) {
        //         this.mouseScope.isMove = true;
        //     }
        // }
        // var target = event.target as HTMLElement;
        // if (this.pageLayout.contains(target)) {
        //     var block = this.findBlockByMouse(event);
        //     if (block) {
        //         /***一般肯定会有block的 */
        //     }
        // }
        // else {

        // }
        // var toEle = event.target as HTMLElement;
        // var blockEle = dom(toEle).closest(x => (x as any).block && (x as any).block.page === this ? true : false);
        // if (blockEle) {
        //     var block = (blockEle as any).block as Block;
        //     return this.selector.setOverBlock(block, event);
        // }
        // else {
        //     if (this.selector.isDrag == true) {
        //         var dis = 100;
        //         var el = document.elementFromPoint(event.x - dis, event.y);
        //         var blockEl: Node;
        //         if (el) {
        //             blockEl = dom(el as HTMLElement).closest(x => (x as any).block && (x as any).block.page === this ? true : false)
        //             if (!blockEl) el = null;
        //         }
        //         if (!el) {
        //             el = document.elementFromPoint(event.x + dis, event.y);
        //             if (el) blockEl = dom(el as HTMLElement).closest(x => (x as any).block && (x as any).block.page === this ? true : false)
        //         }
        //         if (blockEl) {
        //             var bl: Block = (blockEl as any).block;
        //             if (bl.isCol || bl.isRow) bl = bl.visiblePitFirstContent;
        //             // console.log('block...', blockEl);
        //             return this.selector.setOverBlock(bl, event);
        //         }
        //     }
        // }
        // this.selector.setOverBlock(null, event);
    }
    onMouseup(this: Page, event: MouseEvent) {
        this.kit.acceptMouseup(event);
        // if (this.mouseScope && this.mouseScope.isDown) {
        //     if (this.mouseScope.isMove && this.selector.explorer.selections.exists(g => g.hasRange)) {
        //         if (this.textTool.isVisible != true)
        //             this.textTool.open(event);
        //     }
        //     this.mouseScope.isMove = false;
        //     this.mouseScope.isDown = false;
        //     delete this.mouseScope.point;
        //     this.selector.onTextInputCaptureFocus()
        // }
    }
    onFocusCapture(this: Page, event: FocusEvent) {
        this.onFocus(event);
        // this.selector.onTextInputCaptureFocus();
    }
    onBlurCapture(this: Page, event: FocusEvent) {
        if (this.kit && this.kit.isMousedown) {
            /*** 说明鼠标是处于down下，这个不可能失焦
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
            this.kit.explorer.blur();
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
            this.kit.explorer.onDeleteSelection();
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
    onBlurAnchor(this: Page, anchor: Anchor) {
        if (anchor.block) {
            anchor.block.blurAnchor(anchor);
        }
        this.emit('blurAnchor', anchor);
    }
    onFocusAnchor(this: Page, anchor: Anchor) {
        if (anchor.block) {
            anchor.block.focusAnchor(anchor);
        }
        this.emit('focusAnchor', anchor);
    }
    /**
     * 批量将block拖到另一个block
     * @param this 
     * @param blocks 
     * @param to 
     * @param arrow 
     */
    onBatchDragBlocks(this: Page, blocks: Block[], to: Block, arrow: DropDirection) {

    }
    /**
     * 对block打开右键菜单
     * @param this 
     * @param blocks 
     * @param event 
     */
    onOpenMenu(this: Page, blocks: Block[], event: MouseEvent) {
        this.blockMenu.only('select', (item, ev) => {
            switch (item.name) {
                case BlockMenuAction.delete:
                    this.onBatchDelete(blocks);
                    break;
                case BlockMenuAction.copy:
                    break;
                case BlockMenuAction.link:
                    break;
                case BlockMenuAction.trun:
                    this.onBatchTurn(blocks, item.value);
                    break;
            }
        })
        this.blockMenu.open(event);
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

