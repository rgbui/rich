
import { Block } from "../block/block";
import { Events } from "../util/events";
import { getEleFontStyle, TextFontStyle } from "../util/measure";
import { Selector } from "./selector";

export class Cursor extends Events {
    private selector: Selector;
    /**
    * block组件
    */
    block: Block;
    /**
     * 插槽名
     */
    slotName?: string;
    /**
     * 这是光标聚焦的目标ele无素
     */
    target: HTMLElement;
    /**
     * 当前元素内的值
     */
    value: string;
    /**
     * 光标在元素中的位置
     */
    pos: number;
    x: number;
    col: number;
    /**
     * 行号
     */
    row: number;
    get y() {
        return this.row * this.lineHeight;
    }
    /**
    * 当前元素所处的文字样式
    */
    fontStyle: TextFontStyle
    get lineHeight() {
        return parseFloat(this.fontStyle.lineHeight.replace(/px/g, ''))
    }
    get letterSpacing() {
        return parseFloat(this.fontStyle.letterSpacing.replace(/px/g, ''))
    }
    rect: { x: number, y: number, width: number, height: number }
    constructor(selector: Selector) {
        super();
        this.selector = selector;
        this.block = this.selector.element.block;
        this.target = this.selector.element.ele;
        this.slotName = this.selector.element.slotName;
        this.value = this.target.textContent;
        this.fontStyle = getEleFontStyle(this.target);
        var rect = this.target.getBoundingClientRect();
        this.rect = {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height
        };
    }
    inputValue: string;
    get finallyValue() {
        return this.value.slice(0, this.pos) + (this.inputValue || '')
            + this.value.slice(this.pos)
    }
    /**
     * 1.输入时光标向前移动
     * 2.输入文字时，当前行满了，光标移到下一位
     */
    input(text: string) {
        this.inputValue = text;
        this.target.textContent = this.finallyValue;
        this.selector.emit('cursorInput');
    }
    back() {

    }
    move(arrow: string) {

    }
    mousedown(event: MouseEvent) {

    }
}