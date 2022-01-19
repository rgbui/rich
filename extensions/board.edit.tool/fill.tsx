import React from "react";
import { MeasureView } from "../../component/view/progress";
import { ColorType } from "../note";
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
];
export function ShapeFill(props: { fillColor: string, fillOpacity: number, change:(name:string,value:any)=>void }) {
    var [visible, setDropVisible] = React.useState(false);
    function renderSvg() {
        return <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <g fillRule="evenodd" transform="translate(1 1)">
                <circle cx="11" cy="11" r="11" fillOpacity=".04"></circle>
                <path fillOpacity=".12"
                    d="M17 20.221V17h3.221A11.06 11.06 0 0117 20.221zm-12 0A11.06 11.06 0 011.779 17H5v3.221zM20.221 5H17V1.779A11.06 11.06 0 0120.221 5zM9 .181V1H6.411A10.919 10.919 0 019 .181zM15.589 1H13V.181c.907.167 1.775.445 2.589.819zM13 21.819V21h2.589c-.814.374-1.682.652-2.589.819zm-4 0A10.919 10.919 0 016.411 21H9v.819zm-8-6.23A10.919 10.919 0 01.181 13H1v2.589zm0-9.178V9H.181C.348 8.093.626 7.225 1 6.411zM21.819 9H21V6.411c.374.814.652 1.682.819 2.589zM21 15.589V13h.819A10.919 10.919 0 0121 15.589zM5 1.779V5H1.779A11.06 11.06 0 015 1.779zM5 13h4v4H5v-4zm8 0h4v4h-4v-4zM5 5h4v4H5V5zm8 0h4v4h-4V5zm0 12v4H9v-4h4zm8-8v4h-4V9h4zm-8 0v4H9V9h4zM5 9v4H1V9h4zm8-8v4H9V1h4z">
                </path>
            </g>
        </svg>
    }
    return <div className="shy-shape-fill">
        <div className="shy-shape-fill-current" onMouseDown={e => setDropVisible(e => e ? false : true)}>{renderSvg()}</div>
        {visible && <div className="shy-shape-fill-drops">
            <div className="shy-shape-fill-opacity">
                <MeasureView min={0} max={10} showValue={false} value={props.fillOpacity} onChange={e => { props.change('fillOpacity', e) }}></MeasureView>
            </div>
            <div className="shy-shape-fill-colors">{colors.map(c => {
                return <a key={c.color} onMouseDown={e => this.props.change('fillColor', c.color)} className={c.color == props.fillColor ? "selected" : ""} style={{ backgroundColor: c.color }}></a>
            })}</div>
        </div>}
    </div>
}