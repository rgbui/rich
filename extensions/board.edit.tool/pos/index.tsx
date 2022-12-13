import React from "react"
import { BoardEditTool } from ".."
import { Icon } from "../../../component/view/icon"

export function PosView(props: { tool: BoardEditTool, align?: string, valign?: string, change?(name: string, value: string): void }) {

    return <div className="shy-board-edit-font-color" >
        <div className="shy-board-edit-font-color-current" style={{ marginTop: 2 }} onMouseDown={e => props.tool.showDrop('pos')}>

        </div>
        {props.tool.isShowDrop('pos') && <div className="w-160 shy-board-edit-font-color-drops">
            {props.align && <div className="flex">
                <span onMouseDown={e => props.change('align', 'left')} className={props.align == 'left' ? "hover" : ""}><Icon icon={'none'}></Icon></span>
                <span onMouseDown={e => props.change('align', 'center')} className={props.align == 'center' ? "hover" : ""}><Icon icon={'none'}></Icon></span>
                <span onMouseDown={e => props.change('align', 'right')} className={props.align == 'right' ? "hover" : ""}><Icon icon={'none'}></Icon></span>
            </div>}
            {props.valign && <div className="flex">
                <span onMouseDown={e => props.change('valign', 'top')} className={props.valign == 'top' ? "hover" : ""}><Icon icon={'none'}></Icon></span>
                <span onMouseDown={e => props.change('valign', 'middle')} className={props.valign == 'middle' ? "hover" : ""}><Icon icon={'none'}></Icon></span>
                <span onMouseDown={e => props.change('valign', 'bottom')} className={props.valign == 'bottom' ? "hover" : ""}><Icon icon={'none'}></Icon></span>
            </div>}
        </div>}
    </div>
}