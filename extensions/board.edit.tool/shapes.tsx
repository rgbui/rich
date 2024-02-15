import React from "react";
import { BoardEditTool } from ".";
import { ShapesList } from "../shapes/shapes";
export function TurnShapes(props: {
    tool: BoardEditTool,
    change?(value: string): void,
    turnShapes?: string
}) {
    var sh = ShapesList.find(s => s.name == props.turnShapes);
    return <div className="shy-board-trun-shapes">
        <div className="shy-board-trun-shapes-current flex-center" onMouseDown={e => props.tool.showDrop('turnShapes')}>
            {sh && <span className="size-16 flex-center" dangerouslySetInnerHTML={{ __html: sh.shape }}></span>}
        </div>
        {props.tool.isShowDrop('turnShapes') && <div className="shy-board-trun-shapes-drops">
            {ShapesList.filter(g => g.svg ? true : false).map(s => {
                return <span className={s.name == props.turnShapes ? "selected" : ""} key={s.name} onMouseDown={e => props.change(s.name)} dangerouslySetInnerHTML={{ __html: s.shape }}></span>
            })}
        </div>}
    </div>
}