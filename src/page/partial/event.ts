import ReactDOM from "react-dom";
import { Page } from "..";
import { Block } from "../../block";
import { KeyboardCode } from "../../common/keys";
import { ActionDirective } from "../../history/declare";
import { DropDirection } from "../../kit/handle/direction";
import { Anchor } from "../../kit/selection/anchor";
import { util } from "../../util/util";
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
    }
    onMousemove(this: Page, event: MouseEvent) {
        this.kit.acceptMousemove(event);
    }
    onMouseup(this: Page, event: MouseEvent) {
        this.kit.acceptMouseup(event);
    }
    onFocusCapture(this: Page, event: FocusEvent) {
        this.onFocus(event);
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
        this.kit.textInput.onFocus();
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
            this.blockMenu.close();
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
    /**
     * 触发需要更新的view,
     * 这个可以手动触发多次
     * @param finishCompleted 
     */
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
        this.snapshoot.sync(directive, async () => {
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
        // this.viewRender.componentWillUnmount()
    }
    async onBatchDelete(this: Page, blocks: Block[]) {
        await this.onAction(ActionDirective.onBatchDeleteBlocks, async () => {
            await blocks.eachAsync(async bl => {
                await bl.delete()
            });
        })
    }
    async onBatchTurn(this: Page, blocks: Block[], url: string) {
        await this.onAction(ActionDirective.onBatchTurn, async () => {
            await blocks.eachAsync(async bl => {
                var data = await bl.get();
                await this.createBlock(url, data, bl.parent, bl.at);
                await bl.delete();
            })
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
    async onBatchDragBlocks(this: Page, blocks: Block[], to: Block, direction: DropDirection) {
        /**
         * 就是将blocks append 到to 下面
         */
        await this.onAction(ActionDirective.onBatchDragBlocks, async () => {
            await blocks.eachAsync(async block => {
                await block.move(to, direction);
            })
        })
    }
    /**
     * 对block打开右键菜单
     * @param this 
     * @param blocks 
     * @param event 
     */
    onOpenMenu(this: Page, blocks: Block[], event: MouseEvent) {
        this.blockMenu.open(blocks, event);
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

