import React from "react";
import { BoardEditTool } from ".";
import { MeasureView } from "../../component/view/progress";
import { ShapeType } from "../shapes/shapes";
import { S } from "../../i18n/view";

var lineSvg = `<svg viewBox="0 0 32 32"  xmlns="http://www.w3.org/2000/svg">
<path d="M2 15 L30 15 L30 17 L2 17Z" fill="currentColor"></path>
</svg>`;

export var leftArrows: ShapeType[] = [
    {
        shape: `<svg viewBox="0 0 31 32"  xmlns="http://www.w3.org/2000/svg">
    <path d="M18.64 14H0v2h18.64c-.218 1-.765 2-1.64 3l14-4-14-4c.875 1 1.422 2 1.64 3z" fill="currentColor"
        fillRule="evenodd"></path>
</svg>`,
        value: '0'
    },
    {
        shape: `<svg viewBox="0 0 31 32" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M25.587 16.003H0v2h25.58l-.55.234-5.443 3.023.826 1.486 10.337-5.743-10.337-5.743-.826 1.486 5.415 3.009.585.248z"
            fill="currentColor" fillRule="evenodd"></path>
    </svg>`,
        value: '1'
    },
    {
        shape: `<svg viewBox="0 0 31 32"  xmlns="http://www.w3.org/2000/svg">
        <path d="M20 16H0v2h20v5l11-6-11-6v5z" fill="currentColor" fillRule="evenodd"></path>
    </svg>`,
        value: '2'
    },
    {
        shape: `<svg viewBox="0 0 31 32"  xmlns="http://www.w3.org/2000/svg">
        <g fill="currentColor" fillRule="evenodd">
            <path d="M0 16h21v2H0z"></path>
            <path d="M31 17l-11 6V11l11 6zm-3.536.004L21.7 13.85v6.295l5.764-3.14z"></path>
        </g>
    </svg>`,
        value: '3'
    },
    {
        shape: `<svg viewBox="0 0 31 32"  xmlns="http://www.w3.org/2000/svg">
        <path d="M20 16H0v2h20l5 5 6-6-6-6-5 5z" fill="currentColor" fillRule="evenodd"></path>
    </svg>`,
        value: '4'
    },
    {
        shape: `<svg viewBox="0 0 31 32"  xmlns="http://www.w3.org/2000/svg">
        <g fill="currentColor" fillRule="evenodd">
            <path d="M0 16h21v2H0z"></path>
            <path fillRule="nonzero"
                d="M31 17l-6 6-6-6 6-6 6 6zm-2.4.006l-3.6-3.61-3.591 3.607 3.596 3.597 3.595-3.594z"></path>
        </g>
    </svg>`,
        value: '5'
    },
    {
        shape: `<svg viewBox="0 0 29 32"  xmlns="http://www.w3.org/2000/svg">
        <path d="M19.1 16a5.002 5.002 0 019.9 1 5 5 0 01-9.9 1H0v-2h19.1z" fill="currentColor" fillRule="evenodd">
        </path>
    </svg>`,
        value: '6'
    },
    {
        shape: `<svg viewBox="0 0 29 32"  xmlns="http://www.w3.org/2000/svg">
        <g fill="currentColor" fillRule="evenodd">
            <path d="M0 15h20v2H0z"></path>
            <path d="M24 19.3a3.3 3.3 0 100-6.6 3.3 3.3 0 000 6.6zm0 1.7a5 5 0 110-10 5 5 0 010 10z"></path>
        </g>
    </svg>`,
        value: '7'
    }
]
export var rightArrows: ShapeType[] = [
    {
        shape: `<svg viewBox="0 0 31 32"  xmlns="http://www.w3.org/2000/svg">
    <path d="M18.64 14H0v2h18.64c-.218 1-.765 2-1.64 3l14-4-14-4c.875 1 1.422 2 1.64 3z" fill="currentColor"
        fillRule="evenodd"></path>
</svg>`,
        value: '0'
    },
    {
        shape: `<svg viewBox="0 0 31 32"  xmlns="http://www.w3.org/2000/svg">
    <path
        d="M25.587 16.003H0v2h25.58l-.55.234-5.443 3.023.826 1.486 10.337-5.743-10.337-5.743-.826 1.486 5.415 3.009.585.248z"
        fill="currentColor" fillRule="evenodd"></path>
</svg>`,
        value: '1'
    },
    {
        shape: `<svg viewBox="0 0 31 32"  xmlns="http://www.w3.org/2000/svg">
    <path d="M20 16H0v2h20v5l11-6-11-6v5z" fill="currentColor" fillRule="evenodd"></path>
</svg>`,
        value: '2'
    },
    {
        shape: `<svg viewBox="0 0 31 32"  xmlns="http://www.w3.org/2000/svg">
        <g fill="currentColor" fillRule="evenodd">
            <path d="M0 16h21v2H0z"></path>
            <path d="M31 17l-11 6V11l11 6zm-3.536.004L21.7 13.85v6.295l5.764-3.14z"></path>
        </g>
    </svg>` ,
        value: '3'
    },
    {
        shape: `<svg viewBox="0 0 31 32"  xmlns="http://www.w3.org/2000/svg">
    <path d="M20 16H0v2h20l5 5 6-6-6-6-5 5z" fill="currentColor" fillRule="evenodd"></path>
</svg>`,
        value: '4'
    },
    {
        shape: `<svg viewBox="0 0 31 32"  xmlns="http://www.w3.org/2000/svg">
        <g fill="currentColor" fillRule="evenodd">
            <path d="M0 16h21v2H0z"></path>
            <path fillRule="nonzero"
                d="M31 17l-6 6-6-6 6-6 6 6zm-2.4.006l-3.6-3.61-3.591 3.607 3.596 3.597 3.595-3.594z"></path>
        </g>
    </svg>`,
        value: '5'
    },
    {
        shape: `<svg viewBox="0 0 29 32"  xmlns="http://www.w3.org/2000/svg">
    <path d="M19.1 16a5.002 5.002 0 019.9 1 5 5 0 01-9.9 1H0v-2h19.1z" fill="currentColor" fillRule="evenodd">
    </path>
</svg>`,
        value: '6'
    },
    {
        shape: `<svg viewBox="0 0 29 32"  xmlns="http://www.w3.org/2000/svg">
        <g fill="currentColor" fillRule="evenodd">
            <path d="M0 15h20v2H0z"></path>
            <path d="M24 19.3a3.3 3.3 0 100-6.6 3.3 3.3 0 000 6.6zm0 1.7a5 5 0 110-10 5 5 0 010 10z"></path>
        </g>
    </svg>`,
        value: '7'
    },
]

export var Lines: ShapeType[] = [
    {
        shape: `<svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd"
        d="M22.958 8.713a1 1 0 01-.67 1.245l-20 6a1 1 0 01-.575-1.916l20-6a1 1 0 011.245.67z" fill="currentColor">
    </path>
</svg>`
    },
    {
        shape: `<svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M11 7h11a1 1 0 110 2h-9v8H2a1 1 0 110-2h9V7z"
        fill="currentColor"></path>
</svg>`
    },
    {
        shape: `<svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd"
        d="M2.948 12.317a1.102 1.102 0 010 .003 2.753 2.753 0 01.145-.303c.12-.217.317-.513.614-.81C4.282 10.632 5.283 10 7 10c.732 0 1.41.27 2.118.76.725.501 1.41 1.183 2.175 1.947l.032.032c.728.728 1.531 1.532 2.418 2.146C14.661 15.52 15.733 16 17 16c2.283 0 3.782-.868 4.707-1.793a5.69 5.69 0 00.948-1.253 4.738 4.738 0 00.284-.611l.006-.016.002-.006v-.002l.001-.002L22 12l.949.316a1 1 0 00-1.897-.636 2.76 2.76 0 01-.145.303c-.12.217-.317.513-.614.81C19.718 13.368 18.718 14 17 14c-.732 0-1.41-.27-2.118-.76-.725-.501-1.41-1.183-2.175-1.947l-.032-.032c-.728-.728-1.531-1.532-2.418-2.146C9.339 8.48 8.267 8 7 8c-2.283 0-3.782.868-4.707 1.793a5.693 5.693 0 00-.948 1.253 4.736 4.736 0 00-.284.611l-.006.016-.002.006v.002l-.001.002L2 12l-.949-.316a1 1 0 001.895.64m18.106-.641L22 12a85.381 85.381 0 01-.948-.317z"
        fill="currentColor"></path>
</svg>` }
]

export function LineArrow(props: { tool: BoardEditTool, lineStart?: string, lineEnd?: string, change: (name: string, value: any) => void }) {
    return <div className="shy-line-arrow">
        <div className="shy-line-arrow-current">
            {props.lineStart && <span
                style={{ transform: `scale(-1,1)` }}
                onMouseDown={e => props.tool.showDrop('leftArrow')}
                dangerouslySetInnerHTML={{ __html: props.lineStart == 'none' ? `<span style='transform:scale(-1,1)'>${lineSvg}</span>` : leftArrows.find(g => g.value == props.lineStart).shape }}
            ></span>}
            {props.lineEnd && <span
                onMouseDown={e => props.tool.showDrop('rightArrow')}
                dangerouslySetInnerHTML={{ __html: props.lineEnd == 'none' ? lineSvg : rightArrows.find(g => g.value == props.lineEnd).shape }}
            ></span>}
        </div>
        {props.tool.isShowDrop('leftArrow') && props.lineStart && <div className="shy-line-arrow-left-drops">
            <a style={{ transform: `scale(-1,1)` }} dangerouslySetInnerHTML={{ __html: lineSvg }} onMouseDown={e => props.change('lineStart', 'none')}></a>
            {leftArrows.map((arrow, index) => { return <a style={{ transform: 'scale(-1,1)' }} key={index} onMouseDown={e => props.change('lineStart', arrow.value)} dangerouslySetInnerHTML={{ __html: arrow.shape }}></a> })}
        </div>}
        {props.tool.isShowDrop('rightArrow') && props.lineEnd && <div className="shy-line-arrow-right-drops">
            <a style={{ transform: `scale(-1,1)` }} onMouseDown={e => props.change('lineEnd', 'none')} dangerouslySetInnerHTML={{ __html: lineSvg }} ></a>
            {rightArrows.map((arrow, index) => { return <a style={{ transform: `scale(-1,1)` }} key={index} onMouseDown={e => props.change('lineEnd', arrow.value)} dangerouslySetInnerHTML={{ __html: arrow.shape }}></a> })}
        </div>}
    </div>
}

export function LineTypes(props: {
    tool: BoardEditTool,
    lineType: string,
    strokeWidth: number,
    strokeDasharray: string,
    change: (name: string, value: any, isLazy?: boolean) => void
}) {

    return <div className="shy-line-types">
        <div className="shy-line-types-current"
            onMouseDown={e => props.tool.showDrop('lineType')}
            dangerouslySetInnerHTML={{ __html: Lines[props.lineType == 'straight' ? 0 : (props.lineType == 'line' ? 1 : 2)].shape }}
        ></div>
        {props.tool.isShowDrop('lineType') && <div className="shy-line-types-drops">
            <div className="shy-line-types-opacity">
                <MeasureView
                    showValue={false}
                    min={1}
                    max={30}
                    value={props.strokeWidth}
                    inputting={false}
                    onChange={e => {
                        props.change('strokeWidth', e);
                    }}></MeasureView>
                <div className="shy-measure-view-label f-12 text-1"><label><S>线宽</S></label><span style={{ float: 'right' }}>{Math.round(props.strokeWidth)}px</span></div>
            </div>
            <div className="shy-line-types-all  r-round-4 r-cursor r-item-hover">
                <a className={'text-1 ' + (props.lineType == 'straight' ? "hover" : "")}
                    onMouseDown={e => props.change('lineType', 'straight')}
                    dangerouslySetInnerHTML={{ __html: Lines[0].shape }}
                ></a>
                {/* <a className={props.lineType == 'line' ? "hover" : ""}
                    onMouseDown={e => props.change('lineType', 'line')}
                    dangerouslySetInnerHTML={{ __html: Lines[1].shape }}
                ></a> */}
                <a className={'text-1 ' + (props.lineType == 'curve' ? "hover" : "")}
                    onMouseDown={e => props.change('lineType', 'curve')}
                    dangerouslySetInnerHTML={{ __html: Lines[2].shape }}
                ></a>
            </div>
            <div className="shy-line-types-stash   r-round-4 r-cursor r-item-hover">
                <a className={'text-1 ' + (props.strokeDasharray == 'none' ? "hover" : "")}
                    onMouseDown={e => props.change('strokeDasharray', 'none')}
                ><svg viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
                        <g fill="none" fillRule="evenodd">
                            <path d="M-18-5h60v40h-60z"></path>
                            <path fill="currentColor" d="M0 14h24v2H0z"></path>
                        </g>
                    </svg>
                </a>
                <a className={'text-1 ' + (props.strokeDasharray == 'dash' ? "hover" : "")}
                    onMouseDown={e => props.change('strokeDasharray', 'dash')}
                >
                    <svg viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 14h6v2H0zm9 0h6v2H9zm9 0h6v2h-6z" fill="currentColor" fillRule="evenodd"></path>
                    </svg>
                </a>
                {/*<a className={props.strokeDasharray == 'dash-circle' ? "hover" : ""}
                    onMouseDown={e => props.change('strokeDasharray', 'dash-circle')}
                >
                    <svg viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
                        <g fill="currentColor" transform="translate(0 14)" fillRule="evenodd">
                            <rect width="2" height="2" rx="1"></rect>
                            <rect width="2" height="2" x="4" rx="1"></rect>
                            <rect width="2" height="2" x="8" rx="1"></rect>
                            <rect width="2" height="2" x="12" rx="1"></rect>
                            <rect width="2" height="2" x="16" rx="1"></rect>
                            <rect width="2" height="2" x="20" rx="1"></rect>
                        </g>
                    </svg>
                </a> */}
            </div>
        </div>}
    </div>
}