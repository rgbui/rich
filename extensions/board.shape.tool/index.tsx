import React from "react";
import { ReactNode } from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { Block } from "../../src/block";
import { Point } from "../../src/common/point";
import "./style.less";

export class BoardShapeTool extends EventsComponent {
    render(): ReactNode {
        return <div className="shy-board-shape-tool"></div>
    }
    point: Point;
    visible: boolean = false;
    blocks: Block[] = [];
    open(options: { point: Point, blocks: Block[] }) {
        this.point = options.point;
        this.visible = true;
        this.blocks = options.blocks;
        this.forceUpdate()
    }
}