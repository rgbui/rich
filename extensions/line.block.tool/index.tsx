import React, { CSSProperties } from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { Singleton } from "../../component/lib/Singleton";
import { Block } from "../../src/block";
import { FixedViewScroll } from "../../src/common/scroll";
import { Point, Rect, RectUtility } from "../../src/common/vector/point";
import { PopoverPosition } from "../../component/popover/position";
import "./style.less";
export class LineBlockTool extends EventsComponent {
    constructor(props) {
        super(props);
        this.fvs.on('change', (offset: Point) => {
            if (this.visible == true && this.boxEl)
                this.boxEl.style.transform = `translate(${offset.x}px,${offset.y}px)`
        })
    }
    boxEl: HTMLElement;
    private fvs: FixedViewScroll = new FixedViewScroll();
    visible: boolean = false;
    block: Block;
    open(pos: PopoverPosition, options: { block?: Block }) {
        var rs = pos.roundArea;
        if (!rs && Array.isArray(pos.roundAreas)) rs = pos.roundAreas[0];
        if (pos.relativeEleAutoScroll) this.fvs.bind(pos.relativeEleAutoScroll);
        this.point = rs.leftTop;
        this.visible = true;
        this.forceUpdate(() => {
            this.point = RectUtility.cacPopoverPosition({
                roundArea: new Rect(this.point.x, this.point.y, 20, 30),
                elementArea: Rect.fromEle(this.boxEl),
                direction: "top",
                dist: 10
            });
            this.forceUpdate();
        });
    }
    private point: Point = new Point(0, 0);
    render() {
        if (this.visible == false) return <></>
        var style: CSSProperties = {
            top: this.point.y,
            left: this.point.x
        };
        return <div className="shy-line-block-tool" style={style} ref={e => this.boxEl = e}>

        </div>
    }
    close() {
        if (this.visible == true) {
            this.fvs.unbind();
            this.visible = false;
            this.forceUpdate();
            this.emit('close');
        }
    }
}
export type LineBlockToolResult = { command: "setProp", props: Record<string, any> } | false;
var lineBlockTool: LineBlockTool;
export async function useTextTool(point: PopoverPosition, options: { block?: Block }) {
    lineBlockTool = await Singleton(LineBlockTool);
    lineBlockTool.open(point, options);
    return new Promise((resolve: (result: LineBlockToolResult) => void, reject) => {
        lineBlockTool.only('setProp', (props) => {
            resolve({ command: 'setProp', props })
        })
        lineBlockTool.only("close", () => {
            resolve(false);
        })
    })
}