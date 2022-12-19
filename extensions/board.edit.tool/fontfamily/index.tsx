import React from "react"
import { BoardEditTool } from ".."
import { CheckSvg } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
import { FontFamilyStyle, FontStores, loadFontFamily } from "./store"

export function FontFamily(props: {
    tool: BoardEditTool,
    value: string,
    change?(value: string): void
}) {

    async function changeFont(ft: FontFamilyStyle) {
        props.change(ft.name);
        loadFontFamily(ft.name)
    }
    return <div className="relative" >
        <div className="h-20 padding-w-5" style={{ marginTop: 2, minWidth: 20, minHeight: 20 }} onMouseDown={e => props.tool.showDrop('fontFamily')}>
            {FontStores.find(c => c.name == props.value)?.text||'默认'}
        </div>
        {props.tool.isShowDrop('fontFamily') && <div style={{ top: 30 }} className="w-180 z-2 bg-white max-h-250 overflow-y pos shadow padding-h-10 round ">
            {FontStores.map(c => {
                return <div className="flex min-h-30 padding-w-10 item-hover round cursor"
                    onMouseDown={e => changeFont(c)}
                    key={c.name}
                >
                    <span className="flex-auto text-overflow">{c.text}</span>
                    <span className="flex-fixed size-24">
                        {(c.name == props.value || c.name == '' && !props.value) && <Icon size={18} icon={CheckSvg}></Icon>}
                    </span>
                </div>
            })}
        </div>}
    </div>
}