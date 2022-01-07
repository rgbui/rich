import React from "react";
import { ReactNode } from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { Singleton } from "../../component/lib/Singleton";
import { Point } from "../../src/common/point";
import { ShapeType } from "../shapes/shapes";
import "./style.less";
class ShapeSelector extends EventsComponent {
    onMousedown(ct: any, event: React.MouseEvent) {
        this.emit('selector', ct);
        this.visible = false;
        this.forceUpdate();
    }
    render(): ReactNode {
        return <div className="shy-line-selector">
            {lines.map((line, index) => {
                return <a dangerouslySetInnerHTML={{ __html: line.shape }}></a>
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
        this.visible = false;
        this.forceUpdate();
    }
}
interface ShapeSelector {
    emit(name: 'selector', data: any);
    only(name: 'selector', fn: (data: any) => void)
}
export async function getShapeSelector() {
    return await Singleton(ShapeSelector);
}
var lines: ShapeType[] = [
    {
        shape: `<svg viewBox="0 0 24 24"  xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" d="M4.707 20.707l16-16a1 1 0 10-1.414-1.414l-16 16a1 1 0 001.414 1.414z"></path>
</svg>`
    },
    {
        shape: `<svg viewBox="0 0 24 24"  xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" d="M14.293 8.293l-11 11a1 1 0 001.414 1.414l11-11L18 12l3-9-9 3 2.293 2.293z"></path>
    </svg>`},
    {
        shape: `<svg viewBox="0 0 24 24"  xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor"
            d="M15.192 13.606L4.84 21.12a1.4 1.4 0 01-1.96-1.96l7.514-10.352-2.101-2.1a1 1 0 01.528-1.692l12.421-2.258-2.258 12.42a1 1 0 01-1.691.53l-2.101-2.102zm.188-2.64l1.978 1.977 1.4-7.7-7.701 1.4 1.978 1.977L7 17l8.38-6.035z">
        </path>
    </svg>`}
]