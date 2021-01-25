import { getEleFontStyle } from "../../../util/measure";




/***
 * 文字域内
 * 主要是计算文字中光标移动
 * 光标点在什么位置上
 * 文字域内的文字会换行，
 * 换行可能是一行文字排不下了，还有可能是换行符
 * 另外形成的多行文字中，首行可能会有一定的距离，
 * 比如一段文字中的某一小片文字(code)，这一小片文字被点击了，
 * 其首行的距离是最外层block的偏离距离，第二行则从block开始计算
 */
export class TextArea {
    el: HTMLDivElement;
    constructor(el: HTMLDivElement) {
        this.el = el;
    }
    get FontStyle() {
        return getEleFontStyle(this.el);
    }
}