import React, { CSSProperties } from "react";
import { ReactNode } from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { Singleton } from "../../component/lib/Singleton";
import { Point } from "../../src/common/vector/point";
import { PopoverSingleton } from "../popover/popover";
import { PopoverPosition } from "../popover/position";
import { ShapesList, ShapeType } from "./shapes";
import "./style.less";

class ShapeSelector extends EventsComponent {
    onMousedown(ct: ShapeType, event: React.MouseEvent) {
        this.emit('selector', ct);
        this.visible = false;
        this.forceUpdate();
    }
    render(): ReactNode {
        if (this.visible != true) return <></>;
        var style: CSSProperties = {
            top: this.point?.y,
            left: this.point?.x
        };
        return <div style={style} className="shy-shapes-selector">
            <div className="shy-shapes-selector-list">
                {ShapesList.findAll(g => g.svg ? true : false).map((s, index) => {
                    return <span
                        className="shy-shapes-selector-shape"
                        onMouseDown={e => { this.onMousedown(s, e) }}
                        key={index}
                        dangerouslySetInnerHTML={{ __html: s.shape }}></span>
                })}
            </div>
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
        this.visible = false;
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



