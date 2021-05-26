import { Page } from ".";
import { Block } from "../block";
import { ActionDirective } from "../history/declare";
export declare class PageEvent {
    private mouseScope;
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
    onMousedown(this: Page, event: MouseEvent): void;
    onMousemove(this: Page, event: MouseEvent): void;
    onMouseup(this: Page, event: MouseEvent): void;
    onFocusCapture(this: Page, event: FocusEvent): void;
    onBlurCapture(this: Page, event: FocusEvent): void;
    onFocus(this: Page, event: FocusEvent): void;
    onBlur(this: Page, event: FocusEvent): void;
    /**
     * 主要是捕获取当前页面用户的按键情况
     * @param this
     * @param event
     */
    onKeydown(this: Page, event: KeyboardEvent): void;
    onKeyup(this: Page, event: KeyboardEvent): void;
    /**
     * 判断用户是否按了什么之类的
     * @param key 可以是函数，可以是key
     * @param keys  如果存在布尔的值，默认是全匹配
     */
    isKeys(this: Page, key: string | ((key: string) => boolean), ...keys: (string | boolean)[]): boolean;
    private updateBlocks;
    onRememberUpdate(): void;
    onAddUpdate(block: Block): void;
    onExcuteUpdate(finishCompleted?: () => void): void;
    onObserveUpdate(fn: () => Promise<void>, finishedCompletedUpdate?: () => void): Promise<void>;
    onAction(this: Page, directive: ActionDirective | string, fn: () => Promise<void>): Promise<void>;
    onUnmount(this: Page): void;
}
