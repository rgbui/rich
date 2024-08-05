import React from "react";
import { BoardEditTool } from ".";
import { TransparentSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { BoardBackgroundColorList, BoardTextFontColorList } from "../color/data";
import { ColorListBox } from "../color/list";
import { lst } from "../../i18n/store";
import { S } from "../../i18n/view";
import { Divider } from "../../component/view/grid";
import { ToolTip } from "../../component/view/tooltip";
import { UA } from "../../util/ua";
import { MeasureText } from "./common/measure";


export function MindLineColor(props: {
    tool: BoardEditTool,
    value: string,
    change?(value: string): void
}) {
    var colors = BoardBackgroundColorList();
    return <div className="shy-board-edit-font-color" >
        <div
            className="shy-board-edit-font-color-current    size-20 flex-center"
            onMouseDown={e => props.tool.showDrop('mindLineColor')}>
            <Icon size={16} icon={{ name: 'byte', code: 'mindmap-map' }}></Icon>
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

export function FillColor(props: {
    name: string,
    tool: BoardEditTool,
    value: string,
    fillOpacity?: number,
    showOpacity?: boolean,
    noTransparent?: boolean,
    change?(value: string, fillOpacity?: number): void
}) {
    var colors = BoardBackgroundColorList();
    var cs = props.noTransparent ? colors.filter(g => g.color != 'transparent') : colors;
    return <div className="shy-board-edit-font-color" >
        <div className="shy-board-edit-font-color-current  size-20 flex-center"
            onMouseDown={e => props.tool.showDrop(props.name)}>
            {props.value == 'transparent' && <Icon size={16} icon={TransparentSvg}></Icon>}
            {props.value != 'transparent' && <a className="size-16 flex-center circle" style={{
                border: '1px solid rgba(0, 0, 0, 0.1)',
                backgroundColor: props.value || '#000'
            }}></a>}
        </div>
        {props.tool.isShowDrop(props.name) && <div style={{ width: 230 }} className="w-160 shy-board-edit-font-color-drops">

            {props.showOpacity && <div className="shy-shape-fill-opacity gap-b-10">
                <MeasureText value={props.fillOpacity} onChange={e => {
                    props.change(undefined, e);
                }} ></MeasureText>
            </div>}

            <ColorListBox
                title={lst('填充颜色')}
                name={props.name}
                colors={colors}
                value={props.value}
                onChange={e => {
                    props.change(e.color)
                }}></ColorListBox>
        </div>}
    </div>
}

export function FontBgColor(props: {
    tool: BoardEditTool,
    fontColor: string,
    name: string,
    showBg?: boolean,
    bgColor: string,
    noTransparent?: boolean,
    bgOpacity?: number,
    showOpacity?: boolean
    change?(fontColor: string, bgColor?: string, bgOpacity?: number): void
}) {
    var colors = BoardTextFontColorList() as { text: string, color: string }[];
    var name = props.name || 'bgColor';
    var bgcolors = BoardBackgroundColorList();
    colors.splice(0, 0, { color: 'transparent', text: lst('透明') });
    bgcolors.splice(0, 0, { color: 'transparent', text: lst('透明') });
    var cs = props.noTransparent ? bgcolors.filter(g => g.color != 'transparent') : bgcolors;
    var showBg = props.showBg == false ? false : true;
    return <div className="shy-board-edit-font-color size-20" >
        <div className="shy-board-edit-font-color-current flex-center size-20 round" style={{}} onMouseDown={e => props.tool.showDrop('fontColor')}>
            <Icon style={{
            }} size={16} icon={{ name: "byte", code: 'text-style-one' }}></Icon>
        </div>
        {props.tool.isShowDrop('fontColor') && <div
            style={{ width: 230 }}
            className="w-160 shy-board-edit-font-color-drops">

            <ColorListBox title={lst('字体颜色')}
                name={'fontColor'}
                colors={colors}
                value={props.fontColor}
                onChange={e => {
                    props.change(e.color, undefined, undefined)
                }}></ColorListBox>
            {showBg && <>
                <Divider></Divider>
                {props.showOpacity && <div className="shy-shape-fill-opacity gap-h-10">
                    <MeasureText value={props.bgOpacity} onChange={e => {
                        props.change(undefined, undefined, e);
                    }} ></MeasureText>
                </div>}
                <ColorListBox
                    title={lst('背景色')}
                    name={name}
                    colors={cs}
                    value={props.bgColor}
                    onChange={e => {
                        props.change(undefined, e.color, undefined);
                    }}></ColorListBox>
            </>}
        </div>}
    </div>
}


export function FontTextAlign(props: {
    tool: BoardEditTool,
    align: string,
    valign?: string,
    change?(value: string, valign?: string): void
}) {
    var aligns = [
        { text: lst('左对齐'), icon: { name: 'byte', code: 'align-text-left' }, value: 'left' },
        { text: lst('居中对齐'), icon: { name: 'byte', code: 'align-text-center' }, value: 'center' },
        { text: lst('右对齐'), icon: { name: 'byte', code: 'align-text-right' }, value: 'right' },
    ];
    var valigns = [
        { text: lst('顶部对齐'), icon: { name: 'byte', code: 'align-text-top' }, value: 'top' },
        { text: lst('垂直居中对齐'), icon: { name: 'byte', code: 'align-text-middle' }, value: 'middle' },
        { text: lst('底部对齐'), icon: { name: 'byte', code: 'align-text-bottom' }, value: 'bottom' }
    ]
    var name = 'text-align';
    var al = aligns.find(g => g.value == props.align);
    return <div className="shy-board-edit-background-color">
        <div className="shy-board-edit-background-color-current size-20 flex-center">
            <Icon icon={(al?.icon || { name: 'byte', code: 'align-text-both' } as any)} size={16}></Icon>
        </div>
        {props.tool.isShowDrop(name) && <div style={{ position: 'absolute', top: 20, transform: 'translate(-50%, 0px)' }}> <div
            style={{ marginTop: 15, height: props.valign ? 60 : 30, width: 'auto', minHeight: 'auto', padding: '5px 0px' }}
            className=" bg-white shadow-s round">
            <div className="h-30 flex r-item-hover r-round r-cursor r-gap-w-5">
                {aligns.map((g, i) => {
                    return <ToolTip key={i} overlay={g.text}><span onMouseDown={e => {
                        props.change(g.value);
                    }} className={"flex-center size-24 round" + (props.align == g.value ? " item-hover-focus link" : "item-hover-light")}>
                        <Icon icon={g.icon as any} size={16}></Icon>
                    </span>
                    </ToolTip>
                })}
            </div>
            {props.valign && <div className="h-30 flex r-item-hover r-round r-cursor r-gap-w-5">
                {valigns.map((g, i) => {
                    return <ToolTip key={i} overlay={g.text}><span onMouseDown={e => {
                        props.change(undefined, g.value);
                    }} className={"flex-center size-24 round" + (props.valign == g.value ? " item-hover-focus link" : "item-hover-light")}>
                        <Icon icon={g.icon as any} size={16}></Icon>
                    </span>
                    </ToolTip>
                })}
            </div>
            }

        </div>
        </div>}
    </div>
}

export function FontTextStyle(props: {
    tool: BoardEditTool,
    fontWeight: any,
    fontStyle: any,
    textDecoration: any,
    change(e: {
        fontWeight?: any,
        fontStyle?: any,
        textDecoration?: any,
    }): void
}) {
    var name = 'text-font-style';
    return <div className="shy-board-edit-background-color">
        <div className="shy-board-edit-background-color-current size-20 flex-center">
            <div className="size-20">
                <Icon className={'pos pos-center'} icon={
                    { name: 'byte', code: 'text' }
                } size={17}></Icon>
            </div>
        </div>
        {props.tool.isShowDrop(name) && <div style={{ position: 'absolute', top: 20, transform: 'translate(-50%, 0px)' }}>
            <div style={{ marginTop: 15, height: 30, width: 'auto', minHeight: 'auto', padding: '5px 0px' }} className=" round bg-white shadow-s">
                <div className="h-30 flex r-item-hover r-round r-cursor r-gap-w-5">

                    <ToolTip overlay={<div><S>加粗</S><br /><span style={{ color: '#bbb' }}>{UA.isMacOs ? "⌘+B" : 'Ctrl+B'}</span></div>}>
                        <span onMouseDown={e => {
                            props.change({
                                fontWeight: props.fontWeight == 'bold' || props.fontWeight == true || props.fontWeight > 500 ? "normal" : 'bold'
                            })
                        }} className={"size-24 flex-center " + (props.fontWeight == 'bold' || props.fontWeight == true || props.fontWeight > 500 ? " item-hover-focus link" : "")}><Icon size={16} icon={{ name: 'byte', code: 'text-bold' }}></Icon></span>
                    </ToolTip>

                    <ToolTip overlay={<div><S>斜体</S><br /><span style={{ color: '#bbb' }}>{UA.isMacOs ? "⌘+I" : 'Ctrl+I'}</span></div>}>
                        <span onMouseDown={e => {
                            props.change({
                                fontStyle: props.fontStyle == 'itailc' || props.fontStyle == true ? false : true
                            })
                        }} className={"size-24 flex-center " + (props.fontStyle == 'itailc' || props.fontStyle == true ? " item-hover-focus link" : "")}><Icon size={16} icon={{ name: 'byte', code: 'text-italic' }} ></Icon></span>
                    </ToolTip>

                    <ToolTip overlay={<div><S>下划线</S><br /><span style={{ color: '#bbb' }}>{UA.isMacOs ? "⌘+U" : 'Ctrl+U'}</span></div>}>
                        <span
                            onMouseDown={e => {
                                props.change({ textDecoration: props.textDecoration == 'underline' ? 'none' : 'underline' })
                            }}
                            className={"size-24 flex-center " + (props.textDecoration == 'underline' ? " item-hover-focus link" : "")}><Icon size={16} icon={{ name: 'byte', code: 'text-underline' }}></Icon>
                        </span>
                    </ToolTip>

                    <ToolTip overlay={<div><S>删除线</S><br /><span style={{ color: '#bbb' }}>{UA.isMacOs ? "⌘+Shift+S" : 'Ctrl+Shift+S'}</span></div>}>
                        <span onMouseDown={e => {
                            props.change({
                                textDecoration: props.textDecoration == 'line-through' ? 'none' : 'line-through'
                            })
                        }} className={"size-24 flex-center " + (props.textDecoration == 'line-through' ? " item-hover-focus link" : "")}><Icon size={16} icon={{ name: 'byte', code: 'strikethrough' }}></Icon></span>
                    </ToolTip>

                </div>
            </div>
        </div>}
    </div>
}