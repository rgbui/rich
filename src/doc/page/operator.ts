import { Page } from ".";

import { CreateAnchorByMouseEvent } from "../selector/anchor/anchor";
import { BlockSelection } from "../selector/selection";

export class PageOperator {
    /**
     * 鼠标点击页面,
     * 点的过程中有可能有按下不松开选择一个较大的区域情况，
     * 这个区域可以触发文字的选中效果，
     * 也可以按一定的条件触发矩形选择范围，例如图像或文本
     * 是否选择文字还是仅仅选择block对象取决于block本身
     * 点在空白处，在鼠标up时，可以检测，看有没有必要创建一个空白输入文本框
     * @param this 
     * @param event 
     */
    onMousedown(this: Page, event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        self.onFocus(event.nativeEvent);
        var self: Page = this;
        var selection: BlockSelection;
        if (this.isKeys('Shift')) {
            /**
             * 上次的选区结尾处，连取
             */
            selection = this.selector.selections.last();
            if (!selection) {
                selection = new BlockSelection();
                selection.start = CreateAnchorByMouseEvent(event.nativeEvent);
            }
            else selection.end = CreateAnchorByMouseEvent(event.nativeEvent);
            this.selector.selections = [selection];
        }
        else if (this.isKeys('Command') || this.isKeys('Ctrl')) {
            /***
             * 创建多个选区
             */
            selection = new BlockSelection();
            selection.start = CreateAnchorByMouseEvent(event.nativeEvent);
            this.selector.selections.push(selection)
        }
        else {
            selection = new BlockSelection();
            selection.start = CreateAnchorByMouseEvent(event.nativeEvent);
            this.selector.selections = [selection];
        }
        this.selector.view.forceUpdate();
        function mousemove(ev: MouseEvent) {
            selection.end = CreateAnchorByMouseEvent(ev);
            this.selector.view.forceUpdate();
        }
        function mouseup(ev: MouseEvent) {
            self.selector.onCaptureFocus();
            document.removeEventListener('mousemove', mousemove);
            document.removeEventListener('mouseup', mouseup);
        }
        document.addEventListener('mousemove', mousemove);
        document.addEventListener('mouseup', mouseup);
    }
    onFocus(this: Page, event: MouseEvent) {
        this.emit('focus', event);
    }
    onBlur(this: Page, event: FocusEvent) {
        this.emit('blur', event);
    }
    /**
     * 主要是捕获取当前页面用户的按键情况
     * @param this 
     * @param event 
     */
    onKeydown(this: Page, event: React.KeyboardEvent<HTMLTextAreaElement>) {
        this.keys.push(event.key);
        var self = this;
        function keyup(event: KeyboardEvent) {
            self.keys.remove(event.key);
            document.removeEventListener('keyup', keyup);
        }
        document.addEventListener('keyup', keyup);
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
}