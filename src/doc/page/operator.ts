import { Page } from ".";

export class PageOperator {
    /**
     * 鼠标点击页面,
     * 点的过程中有可能有按下不松开选择一个较大的区域情况
     * @param this 
     * @param event 
     */
    mousedown(this: Page, event: MouseEvent) {

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