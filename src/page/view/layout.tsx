import React, { CSSProperties } from "react";
import { Page } from "..";
import { PageLayoutType } from "../declare";

export function PageLayoutView(props: {
    page: Page,
    boardSelector?: React.ReactNode,
    children?: React.ReactNode
}) {
    var type = props.page.pageLayout.type;
    var mh = props.page.pageVisibleHeight ? (props.page.pageVisibleHeight + 'px') : '100%';
    if (type == PageLayoutType.doc) {
        return <div className='shy-page-layout shy-page-layout-doc'>
            <div className='shy-page-layout-wrapper'>
                {props.children}
            </div>
            {props.boardSelector}
        </div>
    }
    else if ([PageLayoutType.dbForm, PageLayoutType.dbPickRecord].includes(type)) {
        return <div className={"shy-page-layout shy-page-layout-db-form"}>
            <div className='shy-page-layout-wrapper' >
                {props.children}
            </div>
        </div>
    }
    else if (type == PageLayoutType.board) {
        var style: CSSProperties = { minHeight: mh, width: '100%' };
        Object.assign(style, props.page.matrix.getCss());
        return <div className={"shy-page-layout shy-page-layout-board"} style={{ width: '100%', height: mh }}>
            <div className='shy-page-layout-wrapper' style={style}>
                {props.children}
            </div>
            {props.boardSelector}
        </div>
    }
    else if (type == PageLayoutType.textChannel) {
        var style: CSSProperties = { minHeight: mh, width: '100%' };
        Object.assign(style, props.page.matrix.getCss());
        return <div className={"shy-page-layout shy-page-layout-text-channel"} style={{ width: '100%', height: mh }}>
            <div className='shy-page-layout-wrapper' style={style}>
                {props.children}
            </div>
        </div>
    }
    else if (type == PageLayoutType.textBroadcast) {
        var style: CSSProperties = { minHeight: mh, width: '100%' };
        Object.assign(style, props.page.matrix.getCss());
        return <div className={"shy-page-layout shy-page-layout-text-broadcast"} style={{ width: '100%', height: mh }}>
            <div className='shy-page-layout-wrapper' style={style}>
                {props.children}
            </div>
            {props.boardSelector}
        </div>
    }
    else {
        return <div>没有定义版面</div>
    }
}