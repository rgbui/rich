import { Kit } from "..";
import { Block } from "../../block";
import { Matrix } from "../../common/matrix";
import { Point } from "../../common/point";
export class PageBoard {
    constructor(public kit: Kit) { }
    get page() {
        return this.kit.page;
    }
    isDown: boolean = false;
    isMove: boolean = false;
    downEvent: MouseEvent;
    matrix: Matrix;
    mousedown(block: Block, event: MouseEvent) {
        this.isDown = true;
        this.downEvent = event;
        this.kit.picker.onPicker([block]);
    }
    mousemove(event: MouseEvent) {
        if (!this.isMove && Point.from(event).nearBy(Point.from(this.downEvent), 5)) {
            this.isMove = true;
        }
        if (this.isMove == true) {
            this.matrix = new Matrix();
            this.matrix.translate(event.clientX - this.downEvent.clientX, event.clientY - this.downEvent.clientY);
            this.kit.picker.onMove(this.matrix);
        }
    }
    mouseup(event: MouseEvent) {
        if (this.isMove) {
            this.matrix = new Matrix();
            this.matrix.translate(event.clientX - this.downEvent.clientX, event.clientY - this.downEvent.clientY);
            this.kit.picker.onMoveEnd(this.matrix);
        }
        this.isDown = false;
        this.isMove = false;
    }
}