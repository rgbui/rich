import React from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { PopoverSingleton } from "../../component/popover/popover";
import { PopoverPosition } from "../../component/popover/position";
import { BackgroundColorList, FontColorList } from "./data";
import "./style.less";
import { S } from "../../i18n/view";
import { ToolTip } from "../../component/view/tooltip";
import { ls } from "../../i18n/store";

export type ColorValue = {
    color?: string | { color: string, grad: string },
    backgroundColor?: string
}
class ColorSelector extends EventsComponent {
    constructor(props) {
        super(props);
    }
    private renderFontColor() {
        return <div className='shy-color-selector-box'>
            <div className='shy-color-selector-box-head'><span><S>文字颜色</S></span></div>
            <div className={'shy-color-selector-box-content' + (ls.isCn ? "" : " lang-en")}>
                {FontColorList().map((x, i) => {
                    return <ToolTip key={i} overlay={x.text}><div onMouseDown={e => this.onChange({ color: x.color })} className={'shy-color-selector-item item-hover-light' + (x.color == this.cv?.color || !this.cv?.color && i == 0 ? " item-hover-focus" : "")}>
                        <a style={{
                            color: typeof x.color == 'string' ? x.color : x.color.color,
                            backgroundImage: typeof x.color != 'string' ? x.color.grad : undefined,
                            WebkitBackgroundClip: typeof x.color != 'string' ? 'text' : undefined,
                        }}>A</a>
                        <span >{x.text}</span>
                    </div></ToolTip>
                })}
            </div>
        </div>;
    }
    private renderBackgroundColor() {
        return <div className='shy-color-selector-box'>
            <div className='shy-color-selector-box-head'><span><S>背景色</S></span></div>
            <div className={'shy-color-selector-box-content' + (ls.isCn ? "" : " lang-en")}>
                {BackgroundColorList().map((x, i) => {
                    return <ToolTip overlay={x.text} key={x.color + 'bg'}><div onMouseDown={e => this.onChange({ backgroundColor: x.color })} className={'shy-color-selector-item  item-hover-light' + (x.color == this.cv?.backgroundColor || !this.cv?.backgroundColor && i == 0 ? " item-hover-focus" : "")}>
                        <a style={{ backgroundColor: x.color }}>A</a>
                        <span >{x.text}</span>
                    </div></ToolTip>
                })}
            </div>
        </div>;
    }
    render() {
        return <div className='shy-color-selector max-h-300 overflow-y'>
            {this.renderFontColor()}
            <div className='shy-color-selector-devider'></div>
            {this.renderBackgroundColor()}</div>
    }
    onChange(value: ColorValue) {
        this.emit('change', value);
    }
    cv: ColorValue;
    open(cv: ColorValue) {
        this.cv = cv;
        this.forceUpdate();
    }
}

interface ColorSelector {
    emit(name: 'change', data: ColorValue);
    only(name: 'change', fn: (data: ColorValue) => void);
}
export async function useColorSelector(pos: PopoverPosition, options: ColorValue) {
    let popover = await PopoverSingleton(ColorSelector, { mask: true });
    let colorSelector = await popover.open(pos);
    colorSelector.open(options);
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