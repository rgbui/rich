import React from "react";
import { BoardEditTool } from ".";
import { BoardIconTextStylesSvg, FontcolorSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { BoardBackgroundColorList, BoardTextFontColorList } from "../color/data";
import { ColorListBox } from "../color/list";
import { lst } from "../../i18n/store";
import { MeasureView } from "../../component/view/progress";
import { S } from "../../i18n/view";
import { Divider } from "../../component/view/grid";


export function MindLineColor(props: {
    tool: BoardEditTool,
    value: string,
    change?(value: string): void
}) {
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


export function FillFontColor(props: {
    tool: BoardEditTool,
    fontColor: string,
    name: string,
    fillColor: string,
    noTransparent?: boolean,
    fillOpacity?: number,
    showOpacity?: boolean
    change?(fontColor: string, fillColor?: string, fillOpacity?: number): void
}) {
    var colors = BoardTextFontColorList() as { text: string, color: string }[];
    var name = props.name || 'fillColor';
    var bgcolors = BoardBackgroundColorList();
    colors.splice(0, 0, { color: 'transparent', text: lst('透明') });
    var cs = props.noTransparent ? bgcolors.filter(g => g.color != 'transparent') : bgcolors;
    console.log('props.fill', props.fillColor);
    return <div className="shy-board-edit-font-color" >
        <div className="shy-board-edit-font-color-current flex-center size-18 round" style={{
            backgroundColor: props.fillColor
        }} onMouseDown={e => props.tool.showDrop('fontColor')}>
            <Icon style={{ color: props.fontColor }} size={14} icon={FontcolorSvg}></Icon>
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

            <Divider></Divider>

            {props.showOpacity && <div className="shy-shape-fill-opacity gap-h-10">
                <div className="shy-measure-view-label"><label className="f-12 remark"><S>透明度</S></label><span className="f-12 remark" style={{ float: 'right' }}>{props.fillOpacity}</span></div>
                <MeasureView
                    theme="light"
                    min={0}
                    ratio={0.1}
                    max={1}
                    showValue={false}
                    value={props.fillOpacity}
                    inputting={false}
                    onChange={e => {
                        console.log('gggg', e);
                        props.change(undefined, undefined, e);
                    }}></MeasureView>
            </div>}

            <ColorListBox
                title={lst('背景色')}
                name={name}
                colors={cs}
                value={props.fillColor}
                onChange={e => {
                    props.change(undefined, e.color, undefined);
                }}></ColorListBox>


        </div>}
    </div>
}


export function FontTextAlign(props: {
    tool: BoardEditTool,
    align: string,
    change?(value: string): void
}) {
    var aligns = [
        { text: lst('左对齐'), icon: { name: 'byte', code: 'align-text-left' }, value: 'left' },
        { text: lst('居中对齐'), icon: { name: 'byte', code: 'align-text-center' }, value: 'center' },
        { text: lst('右对齐'), icon: { name: 'byte', code: 'align-text-right' }, value: 'right' },
    ];
    var name = 'text-align';
    var al = aligns.find(g => g.value == props.align);
    return <div className="shy-board-edit-background-color"
    >
        <div className="shy-board-edit-background-color-current size-20 flex-center">
            <Icon icon={(al?.icon || { name: 'byte', code: 'align-text-both' } as any)} size={16}></Icon>
        </div>
        {props.tool.isShowDrop(name) && <div
            style={{ top: 25, height: 30, width: 'auto', minHeight: 'auto', padding: '5px 0px' }}
            className=" shy-board-edit-background-color-drops">
            <div className="h-30 flex r-item-hover r-round r-cursor r-gap-w-5">
                {aligns.map((g, i) => {
                    return <span onMouseDown={e => {
                        props.change(g.value);
                    }} key={i} className={"flex-center size-20 round" + (props.align == g.value ? " item-hover-focus link" : "item-hover-light")}>
                        <Icon icon={g.icon as any} size={14}></Icon>
                    </span>
                })}
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
    return <div className="shy-board-edit-background-color"
    >
        <div className="shy-board-edit-background-color-current size-20 flex-center">
            <div className="size-20">
                <Icon className={'pos pos-center text-1'} icon={BoardIconTextStylesSvg} size={32}></Icon>
            </div>
        </div>
        {props.tool.isShowDrop(name) && <div style={{ top: 25, height: 30, width: 120, minHeight: 'auto', padding: '5px 0px' }} className=" shy-board-edit-background-color-drops flex r-item-hover r-round r-cursor r-gap-w-5">
            <span onMouseDown={e => {
                props.change({
                    fontWeight: props.fontWeight == 'bold' || props.fontWeight == true || props.fontWeight > 500 ? "normal" : 'bold'
                })
            }} className={"size-20 flex-center " + (props.fontWeight == 'bold' || props.fontWeight == true || props.fontWeight > 500 ? " item-hover-focus link" : "")}><Icon size={14} icon={{ name: 'byte', code: 'text-bold' }}></Icon></span>

            <span onMouseDown={e => {
                props.change({
                    fontStyle: props.fontStyle == 'itailc' || props.fontStyle == true ? false : true
                })
            }} className={"size-20 flex-center " + (props.fontStyle == 'itailc' || props.fontStyle == true ? " item-hover-focus link" : "")}><Icon size={14} icon={{ name: 'byte', code: 'text-italic' }} ></Icon></span>

            <span onMouseDown={e => {
                props.change({
                    textDecoration: props.textDecoration == 'line-through' ? 'none' : 'line-through'
                })
            }} className={"size-20 flex-center " + (props.textDecoration == 'line-through' ? " item-hover-focus link" : "")}><Icon size={14} icon={{ name: 'byte', code: 'strikethrough' }}></Icon></span>

            <span
                onMouseDown={e => {
                    props.change({
                        textDecoration: props.textDecoration == 'underline' ? 'none' : 'underline'
                    })
                }}
                className={"size-20 flex-center " + (props.textDecoration == 'underline' ? " item-hover-focus link" : "")}><Icon size={14} icon={{ name: 'byte', code: 'text-underline' }}></Icon></span>
        </div>}
    </div>
}