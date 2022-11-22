import React from "react";
import { BoardEditTool } from ".";
import { NoneSvg, TransparentSvg } from "../../component/svgs";
import { MeasureView } from "../../component/view/progress";
import { ColorType } from "../note";
var colors: ColorType[] = [

    { color: 'transparent' },
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

];
export function ShapeFill(props: { tool: BoardEditTool, fillColor: string, fillOpacity: number, change: (name: string, value: any) => void }) {
    function renderSvg() {
        if (props.fillColor == 'transparent') return <TransparentSvg></TransparentSvg>
        else return <a style={{ display: 'inline-block', borderRadius: '50%', opacity: props.fillOpacity, backgroundColor: props.fillColor }}></a>
    }
    return <div className="shy-shape-fill">
        <div className="shy-shape-fill-current" onMouseDown={e => props.tool.showDrop('fill')}>{renderSvg()}</div>
        {props.tool.isShowDrop('fill') && <div className="shy-shape-fill-drops">
            <div className="shy-shape-fill-opacity">
                <MeasureView min={1} ratio={0.1} max={10} showValue={false} value={props.fillOpacity} onChange={e => { props.change('fillOpacity', e) }}></MeasureView>
                <div className="shy-measure-view-label"><label>透明度</label><span style={{ float: 'right' }}>{Math.round(props.fillOpacity * 10)}</span></div>
            </div>
            <div className="shy-shape-fill-colors">{colors.map(c => {
                if (c.color == 'transparent') return <a className={'transparent ' + (c.color == props.fillColor ? "selected" : "")}
                    onMouseDown={e => props.change('fillColor', c.color)} key={c.color}
                    style={{ borderColor: 'transparent', backgroundColor: c.color }}>
                    <NoneSvg></NoneSvg>
                </a>
                return <a key={c.color} onMouseDown={e => props.change('fillColor', c.color)} className={c.color == props.fillColor ? "selected" : ""} style={{ backgroundColor: c.color }}></a>
            })}</div>
        </div>}
    </div>
}