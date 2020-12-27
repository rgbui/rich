
import { Block } from "../block/block";
import { Events } from "../util/events";
import { getEleFontStyle, MeaureWord, TextFontStyle } from "../util/measure";
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
    fontStyle: TextFontStyle;
    measure: MeaureWord;
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
        this.measure = new MeaureWord(this.fontStyle, rect.width);
        this.measure.text = this.value;
    }
    inputValue: string;
    get finallyValue() {
        return this.value.slice(0, this.pos) + (this.inputValue || '')
            + this.value.slice(this.pos)
    }
    get finallyCursor() {
        this.measure.text = this.finallyValue;
        var rows = this.measure.walk(this.pos, this.inputValue.length);
        this.measure.text = this.value;
        if (Array.isArray(rows)) {
            return {
                x: rows.last().width,
                y: rows.length * this.lineHeight,
                pos: rows.last().end
            }
        }
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
        if (this.pos == 0) {
            this.selector.emit('cursorBackPrev');
            return;
        } this.inputValue = '';
        this.value = this.value.slice(0, this.pos - 1) + this.value.slice(this.pos);
        this.target.textContent = this.value;
        var rows = this.measure.walk(this.pos, -1);
        if (Array.isArray(rows)) {
            this.x = rows.last().width;
            this.pos = rows.last().end;
            this.row = rows.length;
        }
    }
    move(arrow: string) {
        var rows;
        if (arrow == 'ArrowLeft') {
            rows = this.measure.walk(this.pos, -1);
            if (rows == -1) {
                return this.selector.emit('cursorMovePrev');
            }
        }
        else if (arrow == 'ArrowRight') {
            rows = this.measure.walk(this.pos, 1);
            if (rows == 1) {
                return this.selector.emit('cursorMoveNext');
            }
        }
        else if (arrow == 'ArrowDown') {
            rows = this.measure.walk(this.pos, 1);
            if (rows == 1) return this.selector.emit('cursorMovedownNext');
        }
        else if (arrow == 'ArrowUp') {
            rows = this.measure.walk(this.pos, -1);
            if (rows == -1) return this.selector.emit('cursorMoveupPrev');
        }
        if (Array.isArray(rows)) {
            this.x = rows.last().width;
            this.pos = rows.last().end;
            this.row = rows.length;
        }
    }
    mousedown(event: MouseEvent) {
        var dx = event.pageX - this.rect.x;
        var dy = event.pageY - this.rect.y;
        var rows = this.measure.textRowsOffset({ x: dx, y: dy });
        this.x = rows.last().width;
        this.pos = rows.last().end;
        this.row = rows.length;
    }
}