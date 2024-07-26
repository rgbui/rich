import React from "react"
import { BoardEditTool } from "."
import { SizeSvg } from "../../component/svgs"
import { Icon } from "../../component/view/icon"
import { S } from "../../i18n/view"
import { InputNumber } from "../../component/view/input/number"


export function ElementSize(props: {
    name: string,
    tool: BoardEditTool,
    width: number,
    height: number,
    showHeight?: boolean,
    showRadius?: boolean,
    radius?: number,
    change?(width: number,
        height: number,
        radius?: number
    ): void
}) {

    return <div className="shy-board-edit-font-color" >
        <div className="shy-board-edit-font-color-current  size-20 flex-center"
            onMouseDown={e => props.tool.showDrop(props.name)}>
            <Icon size={18} icon={SizeSvg}></Icon>
        </div>
        {props.tool.isShowDrop(props.name) && <div style={{ width: 180, height: 'auto', minHeight: 'auto' }}
            className="w-160 shy-board-edit-font-color-drops">
            <div className="flex gap-h-10">
                <label className="flex-fixed gap-r-5"><S>宽度</S></label>
                <InputNumber
                    className={'flex-auto'}
                    value={parseFloat(props.width.toFixed(2))}
                    onChange={e => {
                        if (typeof e == 'number')
                            props.change?.(e, undefined)
                    }} />
            </div>
            {props.showHeight && <div className="flex gap-h-10">
                <label className="flex-fixed gap-r-5"><S>高度</S></label>
                <InputNumber
                    className={'flex-auto'}
                    value={parseFloat(props.height.toFixed(2))}
                    onChange={e => {
                        if (typeof e == 'number')
                            props.change?.(undefined, e)
                    }}
                />
            </div>}
            {props.showRadius && <div className="flex gap-h-10">
                <label><S>圆角</S></label>
                <InputNumber className={'flex-auto'} value={parseFloat(props.radius.toFixed(2))}
                    onChange={e => {
                        if (typeof e == 'number')
                            props.change?.(undefined, undefined, e)
                    }}
                />
            </div>}
        </div>}
    </div>
}
