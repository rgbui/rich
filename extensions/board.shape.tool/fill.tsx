import React from "react";
import { ReactNode } from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { ColorType } from "../note";

var colors: ColorType[] = []

export class ShapeFill extends EventsComponent {
    render(): ReactNode {
        return <div className="shy-shape-fill">
            <div className="shy-shape-fill-opacity"></div>
            <div className="shy-shape-fill-colors">{colors.map(c => {
                return <a><span style={{ backgroundColor: c.color }}></span></a>
            })}</div>
        </div>
    }
}