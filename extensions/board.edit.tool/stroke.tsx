import React, { CSSProperties } from "react";
import { BoardEditTool } from ".";
import { NoneSvg, TransparentSvg } from "../../component/svgs";
import { MeasureView } from "../../component/view/progress";
import { ColorType } from "../note";
import { S } from "../../i18n/view";
import { Switch } from "../../component/view/switch";
import { Tip } from "../../component/view/tooltip/tip";
import { Icon } from "../../component/view/icon";

var colors: ColorType[] = [
    { color: 'transparent' },
    { color: 'rgb(254,244,69)' },
    { color: 'rgb(250,199,16)' },
    { color: 'rgb(242,71,38)' },
    { color: 'rgb(230,230,230)' },
    { color: 'rgb(206,231,65)' },
    { color: 'rgb(143,209,79)' },
    { color: 'rgb(218,0,99)' },

    { color: 'rgb(128,128,128)' },
    { color: 'rgb(18,205,212)' },
    { color: 'rgb(12,167,137)' },
    { color: 'rgb(149,16,172)' },

    { color: 'rgb(26,26,26)' },
    { color: 'rgb(45,155,240)' },
    { color: 'rgb(101,44,179)' },
    { color: 'rgb(255,249,177)' }
];

export function ShapeStroke(props: {
    tool: BoardEditTool,
    stroke: string;
    strokeWidth: number;
    strokeOpacity: number;
    strokeDasharray: 'none' | 'dash' | 'dash-larger' | 'dash-circle';
    change: (name: string, value: any, isLazy?: boolean) => void
}) {
    return <div className="shy-shape-stroke">
        <div className="shy-shape-stroke-current flex-center" onMouseDown={e => props.tool.showDrop('stroke')}>
            {(props.stroke == 'transparent' || props.strokeOpacity == 0) && <TransparentSvg></TransparentSvg>}
            {props.stroke != 'transparent' && <a style={{ backgroundColor: props.stroke || '#000', opacity: props.strokeOpacity }}></a>}
        </div>
        {props.tool.isShowDrop('stroke') && <div className="shy-shape-stroke-drops padding-w-10 text-1">
            <div className="gap-h-10">
                <MeasureView ratio={0.1} min={0} max={1} showValue={false} inputting={false} value={props.strokeOpacity} onChange={e => { props.change('strokeOpacity', e) }}></MeasureView>
                <div className="shy-measure-view-label"><label className="remark f-12"><S>透明度</S></label><span style={{ float: 'right' }}>{props.strokeOpacity}</span></div>
            </div>
            <div className="gap-h-10">
                <MeasureView min={1} max={30} showValue={false} inputting={false} value={props.strokeWidth} onChange={e => { props.change('strokeWidth', e) }}></MeasureView>
                <div className="shy-measure-view-label"><label className="remark f-12"><S>边框</S></label><span >{Math.round(props.strokeWidth)}px</span></div>
            </div>
            <div className="flex  gap-h-10 r-size-24 r-flex-center r-item-hover r-cursor r-round" style={{ justifyContent: 'space-between' }}>
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

            <div className="shy-shape-stroke-colors gap-h-10 flex flex-wrap">{colors.map(c => {
                if (c.color == 'transparent') return <a className={'transparent ' + (c.color == props.stroke ? "selected" : "")} onMouseDown={e => props.change('stroke', c.color)} key={c.color} style={{ borderColor: 'transparent', backgroundColor: c.color }}><NoneSvg></NoneSvg></a>
                return <a key={c.color} className={props.stroke == c.color ? "selected" : ""} onMouseDown={e => { props.change('stroke', c.color) }} style={{ backgroundColor: c.color }}></a>
            })}</div>
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
        borderWidth: Math.min(4, props.borderWidth),
        borderStyle: props.borderType,
        borderColor: props.borderColor,
        borderRadius: props.borderRadius
    }
    return <div className="shy-shape-stroke">
        <div className="shy-shape-stroke-current flex-center" style={{ width: 20, height: 20 }} onMouseDown={e => props.tool.showDrop('border')}>
            <div className="box-border size-18" style={style}></div>
        </div>
        {props.tool.isShowDrop('border') && <div className="shy-shape-stroke-drops padding-w-10 text-1">

            <div className="flex-end gap-h-10">
                <label className="f-12 remark gap-r-5"><S>显示边框</S></label><Switch checked={props.borderType == 'none' ? false : true} onChange={e => {
                    props.change('borderType', e ? "solid" : 'none')
                }}></Switch>
            </div>

            {props.borderType != 'none' && <>
                <div className="shy-line-types-stash gap-h-10">
                    <div className="remark f-12"><S>类型</S></div>
                    <div className="flex   r-round-4 r-cursor r-item-hover">
                        <Tip text='实线'><a className={'inline-block size-30 text-1 ' + (props.borderType == 'solid' ? "hover" : "")}
                            onMouseDown={e => props.change('borderType', 'solid')}
                        ><svg className="size-24" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
                                <g fill="none" fillRule="evenodd">
                                    <path d="M-18-5h60v40h-60z"></path>
                                    <path fill="currentColor" d="M0 14h24v2H0z"></path>
                                </g>
                            </svg>
                        </a></Tip>
                        <Tip text='虚线'><a
                            className={'inline-block size-30 text-1 ' + (props.borderType == 'dash' ? "hover" : "")}
                            onMouseDown={e => props.change('borderType', 'dash')}
                        ><svg className="size-24" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 14h6v2H0zm9 0h6v2H9zm9 0h6v2h-6z" fill="currentColor" fillRule="evenodd"></path>
                            </svg>
                        </a></Tip>
                    </div>
                </div>

                <div className="gap-h-10">
                    <MeasureView min={1} max={30} showValue={false} value={props.borderRadius} inputting={false} onChange={e => { props.change('borderRadius', e) }}></MeasureView>
                    <div className="shy-measure-view-label"><label className="remark f-12"><S>圆角</S></label><span >{Math.round(props.borderRadius)}px</span></div>
                </div>

                <div className="gap-h-10">
                    <MeasureView min={1} max={30} showValue={false} value={props.borderWidth} inputting={false} onChange={e => { props.change('borderWidth', e) }}></MeasureView>
                    <div className="shy-measure-view-label"><label className="remark f-12"><S>边宽</S></label><span >{Math.round(props.borderWidth)}px</span></div>
                </div>

                <div className="shy-shape-stroke-colors gap-h-10">{colors.map(c => {
                    if (c.color == 'transparent') return <a key={c.color} className={'transparent flex-center ' + (c.color == props.borderColor ? "selected" : "")} onMouseDown={e => props.change('borderColor', c.color)}
                        style={{ display: 'inline-flex', borderColor: 'transparent', backgroundColor: c.color }}>
                        <Icon size={30} icon={NoneSvg}></Icon>
                    </a>
                    return <a key={c.color} className={props.borderColor == c.color ? "selected" : ""} onMouseDown={e => { props.change('borderColor', c.color) }} style={{ backgroundColor: c.color }}></a>
                })}</div>

            </>}

        </div>}
    </div>
}
