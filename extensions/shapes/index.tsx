import React, { CSSProperties } from "react";
import { ReactNode } from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { Singleton } from "../../component/lib/Singleton";
import { Point } from "../../src/common/vector/point";
import { ShapesList, ShapeType } from "./shapes";

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
            left: this.point?.x,
            width: 160
        };
        return <div style={style} className="pos  min-h-160 bg-white shadow border  round-4  padding-5 z-10000">
            <div className="w-160 flex flex-wrap r-cursor r-flex-center r-gap-5  r-size-30 r-round-4 r-item-hover">
                {ShapesList.findAll(g => g.svg ? true : false).map((s, index) => {
                    return <span
                        className="r-size-24"
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
var _shapeSelector: ShapeSelector;
export async function getShapeSelector() {
    return _shapeSelector = await Singleton(ShapeSelector);
}

export function closeShapeSelector() {
   if(_shapeSelector) _shapeSelector.close();
}


