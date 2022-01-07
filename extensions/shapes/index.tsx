import React from "react";
import { ReactNode } from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { Singleton } from "../../component/lib/Singleton";
import { Point } from "../../src/common/point";
import { ShapesList, ShapeType } from "./shapes";
import "./style.less";

class ShapeSelector extends EventsComponent {
    onMousedown(ct: ShapeType, event: React.MouseEvent) {
        this.emit('selector', ct);
        this.visible = false;
        this.forceUpdate();
    }
    render(): ReactNode {
        return <div className="shy-shapes-selector">
            {ShapesList.map((s, index) => {
                return <a onMouseDown={e => { this.onMousedown(s, e) }} key={index} dangerouslySetInnerHTML={{ __html: s.shape }}></a>
            })}
        </div>
    }
    private point: Point;
    visible: boolean = false;
    open(point: Point) {
        this.point = point;
        this.visible = true;
        this.forceUpdate()
    }
    close(): void {
        this.visible=false;
        this.forceUpdate();
    }
}
interface ShapeSelector {
    emit(name: 'selector', data: ShapeType);
    only(name: 'selector', fn: (data: ShapeType) => void)
}
export async function getShapeSelector() {
    return await Singleton(ShapeSelector);
}