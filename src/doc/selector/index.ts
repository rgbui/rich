import { Page } from "../page";


export class Selector {
    selections: Selection[] = [];
    page: Page;
    el: HTMLElement;
    constructor(el: HTMLElement, page: Page) {
        this.el = el;
        this.page = page;
    }
    /***
     * 选择器，用户点击，有拖动选择器的意图,这和用户直接点在page上还是有区别的
     * 这个拖动有可能是拖动选区的文字，拖动到别一个block中，
     * 也有可能是直接拖动block
     */
    mousedown(event: MouseEvent) {
        function mousemove(ev: MouseEvent) {

        }
        function mouseup(ev: MouseEvent) {

            document.removeEventListener('mousemove', mousemove);
            document.removeEventListener('mouseup', mouseup);
        }
        document.addEventListener('mousemove', mousemove);
        document.addEventListener('mouseup', mouseup);
    }
}