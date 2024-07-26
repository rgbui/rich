import React, { CSSProperties } from "react";
import { EventsComponent } from "../../../component/lib/events.component";
import { Singleton } from "../../../component/lib/Singleton";
import { Point } from "../../../src/common/vector/point";
import { ColorType } from "../../color/data";

var colors: ColorType[] = [
    { color: 'rgb(245,246,248)' },
    { color: 'rgb(255,249,177)' },
    { color: 'rgb(213,246,146)' },
    { color: 'rgb(245,209,40)' },
    { color: 'rgb(201,223,86)' },
    { color: 'rgb(255,157,72)' },
    { color: 'rgb(147,210,117)' },
    { color: 'rgb(241,108,127)' },
    { color: 'rgb(103,198,192)' },
    { color: 'rgb(234,148,187)' },
    { color: 'rgb(108,216,250)' },
    { color: 'rgb(255,206,224)' },
    { color: 'rgb(166,204,245)' },
    { color: 'rgb(190,136,199)' },
    { color: 'rgb(123,146,255)' },
    { color: 'rgb(0,0,0)' },
];

class NoteSelector extends EventsComponent {
    onMousedown(ct: ColorType, event: React.MouseEvent) {
        this.emit('selector', ct);
        this.visible = false;
        this.forceUpdate();
    }
    renderNote(c: ColorType) {
        var color = c.color;
        return <a className="size-32 gap-r-10 gap-b-10" key={color} onMouseDown={e => { this.onMousedown(c, e) }}><svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
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
    close(){
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
    return _noteSelector= await Singleton(NoteSelector);
}
export function closeNoteSelector() {
    if(_noteSelector) _noteSelector.close();
}
