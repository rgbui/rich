import React, { CSSProperties } from "react";
import { BoardEditTool } from ".";
import { TransparentSvg } from "../../component/svgs";
import { MeasureView } from "../../component/view/progress";
import { S } from "../../i18n/view";
import { Switch } from "../../component/view/switch";
import { Tip } from "../../component/view/tooltip/tip";
import { lst } from "../../i18n/store";
import { BoardTextFontColorList } from "../color/data";
import { ColorListBox } from "../color/list";
import { Icon } from "../../component/view/icon";

export function ShapeStroke(props: {
    tool: BoardEditTool,
    stroke: string;
    strokeWidth: number;
    strokeOpacity: number;
    strokeDasharray: 'none' | 'dash' | 'dash-larger' | 'dash-circle';
    change: (name: string, value: any, isLazy?: boolean) => void
}) {
    var colors = BoardTextFontColorList();
    colors.splice(0, 0, { color: 'transparent', text: lst('透明') })
    return <div className="shy-shape-stroke flex-center">
        <div className="shy-shape-stroke-current flex-center circle" style={{
            width: 16, boxSizing: 'border-box', height: 16
            // , border: '1px solid rgba(0,0,0,0.1)' 
        }} onMouseDown={e => props.tool.showDrop('stroke')}>
            {(props.stroke == 'transparent' || props.strokeOpacity == 0) && <Icon size={16} icon={TransparentSvg}></Icon>}
            {props.stroke != 'transparent' && <a className="size-16 circle" style={{ backgroundColor: props.stroke || '#000', opacity: props.strokeOpacity }}></a>}
        </div>
        {props.tool.isShowDrop('stroke') && <div style={{ width: 230 }} className="shy-shape-stroke-drops padding-w-10 text-1">
            <div className="gap-h-10">

                <div ><label className="remark f-12"><S>透明度</S></label><span className="f-12" style={{ float: 'right' }}>{props.strokeOpacity}</span></div>
                <MeasureView theme="light" ratio={0.1} min={0} max={1} showValue={false} inputting={false} value={props.strokeOpacity} onChange={e => { props.change('strokeOpacity', e) }}></MeasureView>
            </div>
            <div className="gap-h-10">
                <div ><label className="remark f-12"><S>边框</S></label><span className="f-12" style={{ float: 'right' }}>{Math.round(props.strokeWidth)}</span></div>
                <MeasureView theme="light" min={1} max={30} showValue={false} inputting={false} value={props.strokeWidth} onChange={e => { props.change('strokeWidth', e) }}></MeasureView>

            </div>
            <div className="gap-h-10">
                <div className="remark f-12"><S>边框样式</S></div>
                <div className="flex   r-size-24 r-flex-center r-item-hover r-cursor r-round" style={{ justifyContent: 'space-between' }}>
                    <span onMouseDown={e => props.change('strokeDasharray', 'none')} className={props.strokeDasharray == 'none' ? "item-hover-focus" : ""}>
                        <svg style={{ width: 24, height: 24 }} viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
                            <g fill="none" fillRule="evenodd">
                                <path d="M-18-5h60v40h-60z"></path>
                                <path fill="currentColor" d="M0 14h24v2H0z"></path>
                            </g>
                        </svg>
                    </span>

                    <span onMouseDown={e => props.change('strokeDasharray', 'dash-larger')} className={props.strokeDasharray == 'dash-larger' ? "item-hover-focus" : ""}>
                        <svg style={{ width: 24, height: 24 }} viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 14h6v2H0zm9 0h6v2H9zm9 0h6v2h-6z" fill="currentColor" fillRule="evenodd"></path>
                        </svg>
                    </span>

                    <span onMouseDown={e => props.change('strokeDasharray', 'dash')} className={props.strokeDasharray == 'dash' ? "item-hover-focus" : ""}>
                        <svg style={{ width: 24, height: 24 }} viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
                            <g fill="currentColor" transform="translate(0 14)" fillRule="evenodd">
                                <rect width="2" height="2" rx="1"></rect>
                                <rect width="2" height="2" x="4" rx="1"></rect>
                                <rect width="2" height="2" x="8" rx="1"></rect>
                                <rect width="2" height="2" x="12" rx="1"></rect>
                                <rect width="2" height="2" x="16" rx="1"></rect>
                                <rect width="2" height="2" x="20" rx="1"></rect>
                            </g>
                        </svg>
                    </span>
                </div>
            </div>

            <div className="gap-h-10">
                <ColorListBox title={lst('边框色')} name={'borderColor'} colors={colors} value={props.stroke} onChange={e => {
                    props.change('stroke', e.color)
                }}></ColorListBox>
            </div>
        </div>}
    </div>
}

export function BorderBoxStyle(props: {
    tool: BoardEditTool,
    borderWidth: number,
    borderType: 'solid' | 'dash' | 'none',
    borderColor: string,
    borderRadius: number
    change: (name: string, value: any, isLazy?: boolean) => void
}) {
    var style: CSSProperties = {
        backgroundColor: props.borderColor
    }
    var colors = BoardTextFontColorList();
    return <div className="shy-shape-stroke  flex-center ">
        <div className="shy-shape-stroke-current flex-center circle" style={{
            width: 16, boxSizing: 'border-box', height: 16,
            //  border: '1px solid rgba(0,0,0,0.1)' 
        }} onMouseDown={e => props.tool.showDrop('border')}>
            <div className="box-border size-16 circle" style={style}>
                {(props.borderColor == 'transparent' || props.borderColor == 'none') && <Icon size={10} icon={TransparentSvg}></Icon>}
            </div>
        </div>
        {props.tool.isShowDrop('border') && <div style={{ width: 230 }} className="shy-shape-stroke-drops padding-w-10 text-1">
            <div className="flex gap-h-10">
                <div className="flex-fixed f-12 remark gap-r-5"><S>显示边框</S></div>
                <span className="flex-auto flex-end">
                    <Switch checked={props.borderType == 'none' ? false : true} onChange={e => {
                        props.change('borderType', e ? "solid" : 'none')
                    }}></Switch>
                </span>
            </div>

            {props.borderType != 'none' && <>
                <div className="shy-line-types-stash gap-h-10">
                    <div className="remark f-12"><S>类型</S></div>
                    <div className="flex   r-round-4 r-cursor r-item-hover r-gap-r-10">
                        <Tip text='实线'><a className={'inline-flex flex-center size-30 text-1 ' + (props.borderType == 'solid' ? "item-hover-focus" : "")}
                            onMouseDown={e => props.change('borderType', 'solid')}
                        ><svg className="size-24" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
                                <g fill="none" fillRule="evenodd">
                                    <path d="M-18-5h60v40h-60z"></path>
                                    <path fill="currentColor" d="M0 14h24v2H0z"></path>
                                </g>
                            </svg>
                        </a></Tip>
                        <Tip text='虚线'><a
                            className={'inline-flex flex-center size-30 text-1 ' + (props.borderType == 'dash' ? "item-hover-focus" : "")}
                            onMouseDown={e => props.change('borderType', 'dash')}
                        ><svg className="size-24" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 14h6v2H0zm9 0h6v2H9zm9 0h6v2h-6z" fill="currentColor" fillRule="evenodd"></path>
                            </svg>
                        </a></Tip>
                    </div>
                </div>

                <div className="gap-h-10">
                    <div ><label className="remark f-12"><S>圆角</S></label><span className="f-12" style={{ float: 'right' }} >{Math.round(props.borderRadius)}</span></div>
                    <MeasureView theme="light" min={1} max={30} showValue={false} value={props.borderRadius} inputting={false} onChange={e => { props.change('borderRadius', e) }}></MeasureView>
                </div>

                <div className="gap-h-10">
                    <div ><label className="remark f-12"><S>边宽</S></label><span className="f-12" style={{ float: 'right' }}>{Math.round(props.borderWidth)}</span></div>
                    <MeasureView theme="light" min={1} max={30} showValue={false} value={props.borderWidth} inputting={false} onChange={e => { props.change('borderWidth', e) }}></MeasureView>
                </div>

                <div className="gap-h-10"> <ColorListBox title={lst('边框色')} name={'borderColor'} colors={colors} value={props.borderColor} onChange={e => {
                    props.change('borderColor', e.color)
                }}></ColorListBox></div>

            </>}
        </div>}
    </div>
}
