import React from "react";
import { BoardEditTool } from "..";

export function AlignNineGridView(props: { tool: BoardEditTool, change?(name: string, value: string): void }) {

    return <div className="shy-board-edit-algns" >
        <span onMouseDown={e => props.change('grid-align', 'left')}></span>
        <span onMouseDown={e => props.change('grid-align', 'center')}></span>
        <span onMouseDown={e => props.change('grid-align', 'right')}></span>
        <span onMouseDown={e => props.change('grid-valign', 'top')}></span>
        <span onMouseDown={e => props.change('grid-valign', 'middle')}></span>
        <span onMouseDown={e => props.change('grid-valign', 'bottom')}></span>
        <span onMouseDown={e => props.change('grid-distribute', 'x')}></span>
        <span onMouseDown={e => props.change('grid-distribute', 'y')}></span>
    </div>
}