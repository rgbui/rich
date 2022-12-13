import React from "react"
import { BoardEditTool } from ".."
import { FontFamilyStyle, FontStores, loadFontFamily } from "./store"

export function FontFamily(props: { tool: BoardEditTool, value: string, change?(value: string): void }) {

    async function changeFont(ft: FontFamilyStyle) {
        await loadFontFamily(ft.name)
        props.change(ft.name);
    }

    return <div className="shy-board-edit-font-color" >
        <div className="shy-board-edit-font-color-current" style={{ marginTop: 2 }} onMouseDown={e => props.tool.showDrop('fontFamily')}>
            {FontStores.find(c => c.name == props.value)?.text}
        </div>
        {props.tool.isShowDrop('fontFamily') && <div className="w-160 shy-board-edit-font-color-drops">
            {FontStores.map(c => {
                return <a className={c.name == props.value ? "selected" : ""}
                    onMouseDown={e => changeFont(c)}
                    key={c.name}
                >{c.text}</a>
            })}
        </div>}
    </div>
}