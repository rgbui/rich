import React from "react";
import { ReactNode } from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { PopoverSingleton } from "../popover/popover";
import { PopoverPosition } from "../popover/position";
import { ShapesList, ShapeType } from "./shapes";
class ShapeBox extends EventsComponent {
    render(): ReactNode {
        return <div className="shy-shapes-selector" style={{ position: 'relative' }}>
            <div className="shy-shapes-selector-list">
                {ShapesList.findAll(g => g.svg ? true : false).map((s, index) => {
                    return <span
                        className="shy-shapes-selector-shape"
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