
import { Page } from "..";
import { ActionDirective } from "../../history/declare";
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
        if (this.readonly == false)
            this.kit.mouse.onMousedown(event);
    }
    onMousemove(this: Page, event: MouseEvent) {
        if (this.readonly == false)
            this.kit.mouse.onMousemove(event);
    }
    onMouseup(this: Page, event: MouseEvent) {
        if (this.readonly == false)
            this.kit.mouse.onMouseup(event);
    }
    onFocusCapture(this: Page, event: FocusEvent) {
        if (this.readonly) return;
        this.onFocus(event);
    }
    onBlurCapture(this: Page, event: FocusEvent) {
        if (this.readonly) return;
        if (this.kit && this.kit.mouse.isDown) {
            /*** 说明鼠标是处于down下，这个不可能失焦
            * 如果当前的元素中有一些节点发生了改变，那么此时event.relatedTarget是空的，这很蛋疼
             * 这里通过鼠标状态的来纠正一下
             */
            return
        }
        var el = event.relatedTarget as Node;
        /**
         * 例如textTool操作时，页面是不能失焦的
         */
        if (el && (el as HTMLElement).getAttribute('data-shy-page-unselect')) return;
        if (!el || el && (!this.root.contains(el) || el === this.root)) {
            this.onBlur(event);
        }
    }
    onWheel(this: Page, event: React.WheelEvent) {
        if (this.readonly) return;
        this.kit.handle.onCloseBlockHandle();
    }
    /**
     * 主要是捕获取当前页面用户的按键情况
     * @param this 
     * @param event 
     */
    onKeydown(this: Page, event: KeyboardEvent) {
        if (this.readonly) return;
        this.keyboardPlate.keydown(event);
    }
    onKeyup(this: Page, event: KeyboardEvent) {
        if (this.readonly) return;
        this.keyboardPlate.keyup(event);
    }
    onGlobalMousedown(this: Page, event: MouseEvent) {

    }
    async onUndo(this: Page) {
        await this.onAction(ActionDirective.onUndo, async () => {
            await this.snapshoot.undo();
        })
    }
    async onRedo(this: Page) {
        await this.onAction(ActionDirective.onRedo, async () => {
            await this.snapshoot.redo();
        })
    }
}

