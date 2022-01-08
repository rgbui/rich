import React, { ReactNode } from "react"
import { EventsComponent } from "../../component/lib/events.component"
import { ColorType } from "../note"
var colors: ColorType[] = []
export class ShapeStroke extends EventsComponent {
    render(): ReactNode {
        return <div className="shy-shape-stroke">
            <div className="shy-shape-stroke-opacity"></div>
            <div className="shy-shape-stroke-width"></div>
            <div className="shy-shape-stroke-colors">{colors.map(c => {
                return <a><span style={{ backgroundColor: c.color }}></span></a>
            })}</div>
        </div>
    }
}