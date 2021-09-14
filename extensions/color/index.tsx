import React from "react";
import { EventsComponent } from "../../component/events.component";
import { PopoverSingleton } from "../popover/popover";
import { PopoverPosition } from "../popover/position";
import { BackgroundColorList, FontColorList } from "./data";
import "./style.less";

export type ColorValue = {
    color?: string,
    backgroundColor?: string
}
class ColorSelector extends EventsComponent {
    constructor(props) {
        super(props);
    }
    private renderFontColor() {
        return <div className='shy-color-selector-box'>
            <div className='shy-color-selector-box-head'><span>文字颜色</span></div>
            <div className='shy-color-selector-box-content'>
                {FontColorList.map((x, i) => {
                    return <div key={x.color + i} className='shy-color-selector-item'>
                        <a onMouseDown={e => this.onChange({ color: x.color })}
                            style={{ color: x.color }}>A</a>
                        <span>{x.text}</span>
                    </div>
                })}
            </div>
        </div>;
    }
    private renderBackgroundColor() {
        return <div className='shy-color-selector-box'>
            <div className='shy-color-selector-box-head'><span>背景色</span></div>
            <div className='shy-color-selector-box-content'>
                {BackgroundColorList.map(x => {
                    return <div key={x.color + 'bg'} className='shy-color-selector-item'>
                        <a onMouseDown={e => this.onChange({ backgroundColor: x.color })}
                            style={{ backgroundColor: x.color }}>A</a>
                        <span>{x.text}</span>
                    </div>
                })}
            </div>
        </div>;
    }
    render() {
        return <div className='shy-color-selector'>
            {this.renderFontColor()}
            <div className='shy-color-selector-devider'></div>
            {this.renderBackgroundColor()}</div>
    }
    onChange(value: ColorValue) {
        this.emit('change', value);
    }
}

interface ColorSelector {
    emit(name: 'change', data: ColorValue);
    only(name: 'change', fn: (data: ColorValue) => void);
}
export async function useColorSelector(pos: PopoverPosition) {
    let popover = await PopoverSingleton(ColorSelector, {});
    let colorSelector = await popover.open(pos);
    return new Promise((resolve: (data: ColorValue) => void, reject) => {
        colorSelector.only('change', (data) => {
            popover.close();
            resolve(data);
        })
        popover.only('close', () => {
            resolve(null)
        })
    })
}