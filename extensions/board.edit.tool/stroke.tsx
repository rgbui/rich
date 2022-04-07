import React from "react";
import { BoardEditTool } from ".";
import { NoneSvg, TransparentSvg } from "../../component/svgs";
import { MeasureView } from "../../component/view/progress"
import { ColorType } from "../note"
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
]
export function ShapeStroke(props: {
    tool: BoardEditTool,
    stroke: string;
    strokeWidth: number;
    strokeOpacity: number;
    strokeDasharray: 'none' | 'dash' | 'dash-circle';
    change: (name: string, value: any) => void
}) {
    console.log('props', props);
    return <div className="shy-shape-stroke">
        <div className="shy-shape-stroke-current" onMouseDown={e => props.tool.showDrop('stroke')}>
            {(props.stroke == 'transparent' || props.strokeOpacity == 0) && <TransparentSvg></TransparentSvg>}
            {props.stroke != 'transparent' && <a style={{ backgroundColor: props.stroke || '#000', opacity: props.strokeOpacity }}></a>}
        </div>
        {props.tool.isShowDrop('stroke') && <div className="shy-shape-stroke-drops">
            <div className="shy-shape-stroke-opacity">
                <MeasureView ratio={0.1} min={1} max={10} showValue={false} value={props.strokeOpacity} onChange={e => { props.change('strokeOpacity', e) }}></MeasureView>
                <div className="shy-measure-view-label"><label>透明度</label><span style={{ float: 'right' }}>{Math.round(props.strokeOpacity * 10)}</span></div>
            </div>
            <div className="shy-shape-stroke-width">
                <MeasureView min={1} max={30} showValue={false} value={props.strokeWidth} onChange={e => { props.change('strokeWidth', e) }}></MeasureView>
                <div className="shy-measure-view-label"><label>边框</label><span >{Math.round(props.strokeWidth)}px</span></div>
            </div>
            <div className="shy-shape-stroke-colors">{colors.map(c => {
                if (c.color == 'transparent') return <a className={'transparent ' + (c.color == props.stroke ? "selected" : "")} onMouseDown={e => props.change('stroke', c.color)} key={c.color} style={{ borderColor: 'transparent', backgroundColor: c.color }}><NoneSvg></NoneSvg></a>
                return <a key={c.color} className={props.stroke == c.color ? "selected" : ""} onMouseDown={e => { props.change('stroke', c.color) }} style={{ backgroundColor: c.color }}></a>
            })}</div>
        </div>}
    </div>
}
