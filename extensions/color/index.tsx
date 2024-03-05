import React from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { PopoverSingleton } from "../../component/popover/popover";
import { PopoverPosition } from "../../component/popover/position";
import { BackgroundColorList, FontColorList } from "./data";
import { S } from "../../i18n/view";
import { ToolTip } from "../../component/view/tooltip";
import { ls } from "../../i18n/store";
import { Divider } from "../../component/view/grid";
import "./style.less";

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
            <div className=' remark f-12 padding-w-10 gap-b-3'><span><S>文字颜色</S></span></div>
            <div className={'shy-color-selector-box-content  flex flex-wrap  padding-w-5 ' + (ls.isCn ? "" : " lang-en")}>
                {FontColorList().map((x, i) => {
                    return <ToolTip key={i} overlay={x.text}><div onMouseDown={e => this.onChange({ color: x.color })}
                        className={'shy-color-selector-item flex gap-b-5 flex-col flex-full round cursor  ' + (ls.isCn ? " item-hover-light padding-w-5  gap-w-5 " : " item-hover padding-h-5 padding-w-10 ") + (x.color == this.cv?.color || !this.cv?.color && i == 0 ? " item-hover-focus" : "")}>
                        <a className={" flex-center round" + (ls?.isCn ? " size-24" : " border-light size-20")} style={{
                            color: typeof x.color == 'string' ? x.color : x.color.color,
                            backgroundImage: typeof x.color != 'string' ? x.color.grad : undefined,
                            WebkitBackgroundClip: typeof x.color != 'string' ? 'text' : undefined,
                        }}>A</a>
                        <span className="flex-center f-12 l-20" >{x.text}</span>
                    </div></ToolTip>
                })}
            </div>
        </div>;
    }
    private renderBackgroundColor() {
        return <div className='shy-color-selector-box'>
            <div className=' remark f-12 padding-w-10 gap-b-3'><span><S>背景色</S></span></div>
            <div className={'shy-color-selector-box-content flex flex-wrap padding-w-5 ' + (ls.isCn ? "" : " lang-en")}>
                {BackgroundColorList().map((x, i) => {
                    return <ToolTip overlay={x.text} key={x.color + 'bg'}><div onMouseDown={e => this.onChange({ backgroundColor: x.color })}
                        className={'shy-color-selector-item gap-b-5 flex flex-col flex-full round   item-hover-light' + (ls.isCn ? " item-hover-light  padding-w-5  gap-w-5 " : " item-hover padding-h-5 padding-w-10 ") + (x.color == this.cv?.backgroundColor || !this.cv?.backgroundColor && i == 0 ? " item-hover-focus" : "")}>
                        <a className={" flex-center round" + (ls?.isCn ? " size-24" : " border-light size-20")} style={{ backgroundColor: x.color }}>A</a>
                        <span className="flex-center f-12 l-20" >{x.text}</span>
                    </div></ToolTip>
                })}
            </div>
        </div>;
    }
    render() {
        return <div style={{
            width: ls.isCn ? 240 : 200
        }} className={'shy-color-selector   padding-t-10 ' + (ls.isCn ? " " : " max-h-300 overflow-y")}>
            {this.renderFontColor()}
            <Divider></Divider>
            {this.renderBackgroundColor()}</div>
    }
    onChange(value: ColorValue) {
        this.emit('change', value);
    }
    cv: ColorValue;
    open(cv?: ColorValue) {
        this.cv = cv;
        this.forceUpdate();
    }
}

interface ColorSelector {
    emit(name: 'change', data: ColorValue);
    only(name: 'change', fn: (data: ColorValue) => void);
}
export async function useColorSelector(pos: PopoverPosition, options?: ColorValue) {
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