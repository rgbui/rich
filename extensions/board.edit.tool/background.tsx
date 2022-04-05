import React from "react";
import { BoardEditTool } from ".";
import { NoneSvg, TransparentSvg } from "../../component/svgs";
import { ColorType } from "../note";

var colors: ColorType[] = [
    { color: 'transparent' },
    { color: 'rgb(255,255,255)' },
    { color: 'rgb(254,244,69)' },
    { color: 'rgb(250,199,16)' },
    { color: 'rgb(242,71,38)' },
    { color: 'rgb(230,230,230)' },
    { color: 'rgb(206,231,65)' },
    { color: 'rgb(143,209,79)' },
    { color: 'rgb(218,0,99)' },
    { color: 'rgb(128,128,128)' },
    { color: 'rgb(18,205,212)' },
    { color: 'rgb(12,167,137)' },
    { color: 'rgb(149,16,172)' },
    { color: 'rgb(26,26,26)' },
    { color: 'rgb(45,155,240)' },
    { color: 'rgb(101,44,179)' },
    { color: 'rgb(255,249,177)' }
]
export function BackgroundColor(props: { tool: BoardEditTool, noTransparent?: boolean, value: string, change?(value: string): void }) {
    var cs = props.noTransparent ? colors.filter(g => g.color != 'transparent') : colors;
    return <div className="shy-board-edit-background-color" >
        <div className="shy-board-edit-background-color-current" onMouseDown={e => props.tool.showDrop('fill')}>
            {props.value == 'transparent' && <TransparentSvg></TransparentSvg>}
            {props.value != 'transparent' && <a style={{ backgroundColor: props.value || '#000' }}></a>}
        </div>
        {props.tool.isShowDrop('fill') && <div className="shy-board-edit-background-color-drops">
            {cs.map(c => {
                if (c.color == 'transparent') return <a
                    className={'transparent ' + (c.color == props.value ? "selected" : "")}
                    onMouseDown={e => props.change(c.color)} key={c.color}
                    style={{ borderColor: 'transparent', backgroundColor: c.color }}>
                    <NoneSvg></NoneSvg>
                </a>
                return <a className={c.color == props.value ? "selected" : ""} onMouseDown={e => props.change(c.color)} key={c.color} style={{ backgroundColor: c.color }}></a>
            })}
        </div>}
    </div>
}