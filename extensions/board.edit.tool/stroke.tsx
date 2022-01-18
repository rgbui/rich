import React, { ReactNode } from "react"
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
export function ShapeStroke(props) {
    var [visible, setDropVisible] = React.useState(false);
    return <div className="shy-shape-stroke">
        <div className="shy-shape-stroke-current" onMouseDown={e => setDropVisible(e => e ? false : true)}></div>
        {visible && <div className="shy-shape-stroke-drops">
            <div className="shy-shape-stroke-types">
                <a>
                    <svg viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
                        <g fill="none" fillRule="evenodd">
                            <path d="M-18-5h60v40h-60z"></path>
                            <path fill="currentColor" d="M0 14h24v2H0z"></path>
                        </g>
                    </svg>
                </a>
                <a>
                    <svg viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 14h6v2H0zm9 0h6v2H9zm9 0h6v2h-6z" fill="currentColor" fillRule="evenodd"></path>
                    </svg>
                </a>
                <a>
                    <svg viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
                        <g fill="currentColor" transform="translate(0 14)" fillRule="evenodd">
                            <rect width="2" height="2" rx="1"></rect>
                            <rect width="2" height="2" x="4" rx="1"></rect>
                            <rect width="2" height="2" x="8" rx="1"></rect>
                            <rect width="2" height="2" x="12" rx="1"></rect>
                            <rect width="2" height="2" x="16" rx="1"></rect>
                            <rect width="2" height="2" x="20" rx="1"></rect>
                        </g>
                    </svg>
                </a>
            </div>
            <div className="shy-shape-stroke-opacity">
                <MeasureView showValue={false} value={10} onChange={e => { }}></MeasureView>
            </div>
            <div className="shy-shape-stroke-width">
                <MeasureView showValue={false} value={10} onChange={e => { }}></MeasureView>
            </div>
            <div className="shy-shape-stroke-colors">{colors.map(c => {
                return <a key={c.color} style={{ backgroundColor: c.color }}></a>
            })}</div>
        </div>}
    </div>
}
