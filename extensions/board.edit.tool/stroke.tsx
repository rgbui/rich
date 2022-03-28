import React from "react";
import { MeasureView } from "../../component/view/progress"
import { ColorType } from "../note"
var colors: ColorType[] = [
    { color: 'transparent' },
    { color: 'rgb(254, 244, 69)' },
    { color: 'rgb(250, 199, 16)' },
    { color: 'rgb(242, 71, 38)' },
    { color: 'rgb(230, 230, 230)' },
    { color: 'rgb(206, 231, 65)' },
    { color: 'rgb(143, 209, 79)' },
    { color: 'rgb(218, 0, 99)' },

    { color: 'rgb(128, 128, 128)' },
    { color: 'rgb(18, 205, 212)' },
    { color: 'rgb(12, 167, 137)' },
    { color: 'rgb(149, 16, 172)' },

    { color: 'rgb(26, 26, 26)' },
    { color: 'rgb(45, 155, 240)' },
    { color: 'rgb(101, 44, 179)' },
    { color: 'rgb(255, 249, 177)' }
]
export function ShapeStroke(props: {
    stroke: string;
    strokeWidth: number;
    strokeOpacity: number;
    strokeDasharray: 'none' | 'dash' | 'dash-circle';
    change: (name: string, value: any) => void
}) {
    var [visible, setDropVisible] = React.useState(false);
    return <div className="shy-shape-stroke">
        <div className="shy-shape-stroke-current" style={{ borderColor: props.stroke }} onMouseDown={e => setDropVisible(e => e ? false : true)}></div>
        {visible && <div className="shy-shape-stroke-drops">
            <div className="shy-shape-stroke-opacity">
                <MeasureView ratio={0.1} min={0} max={10} showValue={false} value={props.strokeOpacity} onChange={e => { props.change('strokeOpacity', e) }}></MeasureView>
            </div>
            <div className="shy-shape-stroke-width">
                <MeasureView min={1} max={30} showValue={false} value={props.strokeWidth} onChange={e => { props.change('strokeWidth', e) }}></MeasureView>
            </div>
            <div className="shy-shape-stroke-colors">{colors.map(c => {
                return <a key={c.color} className={props.stroke == c.color ? "selected" : ""} onMouseDown={e => { props.change('stroke', c.color) }} style={{ backgroundColor: c.color }}></a>
            })}</div>
        </div>}
    </div>
}
