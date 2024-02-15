import React from "react";
import { BoardEditTool } from ".";
import { TransparentSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { BoardBackgroundColorList } from "../color/data";
import { lst } from "../../i18n/store";
import { ColorListBox } from "../color/list";

export function BackgroundColor(props: { name?: string, tool: BoardEditTool, noTransparent?: boolean, value: string, change?(value: string): void }) {
    var colors = BoardBackgroundColorList();
    colors.splice(0, 0, { color: 'transparent', text: lst('透明') })
    var cs = props.noTransparent ? colors.filter(g => g.color != 'transparent') : colors;
    var name = props.name || 'fill';
    return <div className="shy-board-edit-background-color" >
        <div className="shy-board-edit-background-color-current size-20 flex-center" onMouseDown={e => props.tool.showDrop(name)}>
            {props.value == 'transparent' && <Icon size={16} icon={TransparentSvg}></Icon>}
            {props.value != 'transparent' && <a className="size-16 flex-center circle" style={{ border: '1px solid rgba(0, 0, 0, 0.1)', backgroundColor: props.value || '#000' }}></a>}
        </div>
        {props.tool.isShowDrop(name) && <div className=" shy-board-edit-background-color-drops">
            <div style={{ width: 230 }}>
                <ColorListBox title={lst('背景色')} name={name} colors={cs} value={props.value} onChange={e => {
                    props.change(e.color);
                }}></ColorListBox>
            </div>
        </div>}
    </div>
}