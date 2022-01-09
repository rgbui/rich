
import { Kit } from "..";
import { Point, Rect } from "../../common/vector/point";
import { SelectorView } from "./view";

export class Selector {
    kit: Kit;
    view: SelectorView;
    constructor(kit: Kit) {
        this.kit = kit;
    }
    public visible: boolean = false;
    private start: Point;
    private current: Point;
    getStart() {
        return this.start;
    }
    setStart(point: Point) {
        this.start = point;
    }
    setMove(point: Point) {
        this.current = point;
        this.visible = true;
        this.view.forceUpdate();
    }
    close() {
        this.visible = false;
        this.view.forceUpdate();
    }
    get rect() {
        return new Rect(this.start, this.current)
    }
}
