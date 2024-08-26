import React, { CSSProperties } from "react";
import { EventsComponent } from "../../../component/lib/events.component";
import { Singleton } from "../../../component/lib/Singleton";
import { Point } from "../../../src/common/vector/point";
import { ColorType } from "../../color/data";

var colors: ColorType[] = [
    { "color": "rgb(0,0,0)" },
    { "color": "rgb(245,245,245)" },
    { "color": "rgb(255,255,255)" },
    { "color": "rgb(255,229,234)" },
    { "color": "rgb(254,235,221)" },
    { "color": "rgb(251,247,192)" },
    { "color": "rgb(221,251,223)" },
    { "color": "rgb(220,250,240)" },
    { "color": "rgb(218,243,254)" },
    { "color": "rgb(230,230,255)" },
    { "color": "rgb(251,223,244)" },
    { "color": "rgb(255,116,135)" },
    { "color": "rgb(255,123,100)" },
    { "color": "rgb(255,179,90)" },
    { "color": "rgb(255,214,53)" },
    { "color": "rgb(25,222,166)" },
    { "color": "rgb(0,219,218)" },
    { "color": "rgb(131,198,255)" },
    { "color": "rgb(162,155,249)" },
    { "color": "rgb(250,153,231)" }
].reverse();

class NoteSelector extends EventsComponent {
    onMousedown(ct: ColorType, event: React.MouseEvent) {
        this.emit('selector', ct);
        this.visible = false;
        this.forceUpdate();
    }
    renderNote(c: ColorType) {
        var color = c.color;
        return <a className="size-32 gap-r-10 gap-b-10 cursor round item-hover-light"
            key={color}
            onMouseDown={e => { this.onMousedown(c, e) }}><svg
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <filter x="-18.8%" y="-120%" width="137.5%" height="340%" filterUnits="objectBoundingBox" id="aeqa">
                        <feGaussianBlur stdDeviation="2" in="SourceGraphic"></feGaussianBlur>
                    </filter>
                    <filter x="-9.4%" y="-60%" width="118.8%" height="220%" filterUnits="objectBoundingBox" id="aeqb">
                        <feGaussianBlur stdDeviation="1" in="SourceGraphic"></feGaussianBlur>
                    </filter>
                </defs>
                <g fill="none" fillRule="evenodd">
                    <path fill="#353535" opacity=".5" filter="url(#aeqa)" d="M8 39h32v5H8z"></path>
                    <path fill="#353535" opacity=".5" filter="url(#aeqb)" d="M8 39h32v5H8z"></path>
                    <path fill={color} d="M4 4h40v40H4z"></path>
                </g>
            </svg>
        </a>
    }
    render() {
        if (this.visible != true) return <></>;
        var style: CSSProperties = {
            top: this.point?.y,
            left: this.point?.x,
            width: (32 + 10) * 2
        };

        return <div className="pos bg-white shadow flex flex-wrap padding-t-10 padding-l-10 round z-10000" style={style}>
            {colors.map(c => {
                return this.renderNote(c);
            })}
        </div>
    }
    private point: Point;
    visible: boolean = false;
    open(point: Point) {
        this.point = point;
        this.visible = true;
        this.forceUpdate()
    }
    close() {
        this.visible = false;
        this.forceUpdate();
    }
}

interface NoteSelector {
    emit(name: 'selector', data: ColorType);
    only(name: 'selector', fn: (data: ColorType) => void)
}
var _noteSelector: NoteSelector;
export async function getNoteSelector() {
    return _noteSelector = await Singleton(NoteSelector);
}
export function closeNoteSelector() {
    if (_noteSelector) _noteSelector.close();
}
