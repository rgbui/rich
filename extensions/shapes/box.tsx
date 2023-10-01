import React from "react";
import { ReactNode } from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { PopoverSingleton } from "../popover/popover";
import { PopoverPosition } from "../popover/position";
import { ShapesList, ShapeType } from "./shapes";

class ShapeBox extends EventsComponent {
    render(): ReactNode {
        return <div style={{ width: 160 }} className="relative w-180 min-h-160 bg-white shadow border  round-4  padding-5 ">
            <div className="w-160 flex flex-wrap r-cursor r-flex-center r-gap-5  r-size-30 r-round-4 r-item-hover">
                {ShapesList.findAll(g => g.svg ? true : false).map((s, index) => {
                    return <span
                        className="r-size-24"
                        onMouseDown={e => { this.onMousedown(s, e) }}
                        key={index}
                        dangerouslySetInnerHTML={{ __html: s.shape }}></span>
                })}
            </div>
        </div>
    }
    onMousedown(s: ShapeType, event: React.MouseEvent) {
        this.emit('selector', s);
    }
}

interface ShapeBox {
    emit(name: 'selector', data: ShapeType);
    only(name: 'selector', fn: (data: ShapeType) => void)
}


export async function useShapeSelector(pos: PopoverPosition) {
    var popover = await PopoverSingleton(ShapeBox, { mask: true });
    var shapeSelector = await popover.open(pos);
    return new Promise((resolve: (data: ShapeType) => void, reject) => {
        shapeSelector.only('selector', (data) => {
            resolve(data);
            popover.close();
        });
        popover.only('close', () => {
            resolve(null);
        })
    })
}