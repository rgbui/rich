import { Kit } from "..";
import { Block } from "../../block";
import { Point } from "../../common/point";
import { onAutoScroll, onAutoScrollStop } from "../../common/scroll";
import { TextEle } from "../../common/text.ele";
import { PageLayoutType } from "../../layout/declare";
import { Anchor } from "../selection/anchor";
import { mousedown } from "./md";
export class PageMouse {
    constructor(public kit: Kit) { }
    get page() {
        return this.kit.page;
    }
    get explorer() {
        return this.kit.explorer;
    }
    get selector() {
        return this.kit.selector;
    }
    public isDown: boolean = false;
    public moveEvent: MouseEvent;
    public lastMouseupDate: number;
    public lastMouseupEvent: MouseEvent;
    onMousedown(event: MouseEvent) {
        mousedown(this.kit, event);
    }
    onMousemove(event: MouseEvent) {
        this.moveEvent = event;
        //判断当前的ele是否在bar自已本身内
        var ele = event.target as HTMLElement;
        if (this.kit.handle.containsEl(ele)) return;
        var block: Block;
        if (this.page.root.contains(ele)) {
            block = this.page.getBlockInMouseRegion(event);
        }
        this.page.onHoverBlock(block);
    }
    async onMouseup(event: MouseEvent) {

    }
}