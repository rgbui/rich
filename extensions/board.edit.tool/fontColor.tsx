import React from "react";
import { BoardEditTool } from ".";
import { FontcolorSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { BoardBackgroundColorList, BoardTextFontColorList } from "../color/data";
import { ColorListBox } from "../color/list";
import { lst } from "../../i18n/store";

export function FontColor(props: { tool: BoardEditTool, value: string, change?(value: string): void }) {
    var colors = BoardTextFontColorList() as { text: string, color: string }[];
    return <div className="shy-board-edit-font-color" >
        <div className="shy-board-edit-font-color-current flex-center flex-col" style={{ marginTop: 2 }} onMouseDown={e => props.tool.showDrop('fontColor')}>
            <Icon size={12} icon={FontcolorSvg}></Icon>
            <div className="bottom-border round-2" style={{ backgroundColor: props.value || '#fff' }}></div>
        </div>
        {props.tool.isShowDrop('fontColor') && <div style={{ width: 230 }} className="w-160 shy-board-edit-font-color-drops">
            <ColorListBox title={lst('字体颜色')}
                name={'fillColor'}
                colors={colors}
                value={props.value}
                onChange={e => {
                    props.change(e.color)
                }}></ColorListBox>
        </div>}
    </div>
}

export function MindLineColor(props: { tool: BoardEditTool, value: string, change?(value: string): void }) {
    var colors = BoardBackgroundColorList();
    return <div className="shy-board-edit-font-color" >
        <div className="shy-board-edit-font-color-current  flex-center flex-col" style={{ marginTop: 2 }} onMouseDown={e => props.tool.showDrop('mindLineColor')}>
            <Icon size={16} icon={{ name: 'byte', code: 'mindmap-map' }}></Icon>
            <div className="bottom-border round-2" style={{ backgroundColor: props.value || '#fff' }}></div>
        </div>
        {props.tool.isShowDrop('mindLineColor') && <div style={{ width: 230 }} className="w-160 shy-board-edit-font-color-drops">
            <ColorListBox title={lst('分支颜色')}
                name={'mindLineColor'}
                colors={colors}
                value={props.value}
                onChange={e => {
                    props.change(e.color)
                }}></ColorListBox>
        </div>}
    </div>
}

export function LineColor(props: { name: string, tool: BoardEditTool, value: string, change?(value: string): void }) {
    var colors = BoardBackgroundColorList();
    return <div className="shy-board-edit-font-color" >
        <div className="shy-board-edit-font-color-current  flex-center flex-col" style={{ marginTop: 2 }} onMouseDown={e => props.tool.showDrop(props.name)}>
            <svg fill="none" viewBox="0 0 24 24" style={{ width: 12, height: 12 }} xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd"
                    d="M22.958 8.713a1 1 0 01-.67 1.245l-20 6a1 1 0 01-.575-1.916l20-6a1 1 0 011.245.67z" fill="currentColor">
                </path>
            </svg>
            <div className="bottom-border round-2" style={{ backgroundColor: props.value || '#fff' }}></div>
        </div>
        {props.tool.isShowDrop(props.name) && <div style={{ width: 230 }} className="w-160 shy-board-edit-font-color-drops">
            <ColorListBox title={lst('线条颜色')}
                name={props.name}
                colors={colors}
                value={props.value}
                onChange={e => {
                    props.change(e.color)
                }}></ColorListBox>
        </div>}
    </div>
}