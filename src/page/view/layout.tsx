import React, { CSSProperties } from "react";
import { Page } from "..";
import { PageLayoutType } from "../declare";

export function PageLayoutView(props: {
    page: Page,
    children?: React.ReactNode
}) {
    var type = props.page.pageLayout.type;
    var mh = props.page.pageVisibleHeight ? (props.page.pageVisibleHeight + 'px') : '100%';
    if (type == PageLayoutType.doc) {
        var style: CSSProperties = { minHeight: mh, width: '100%' };
        return <div className='shy-page-layout shy-page-layout-doc' style={style}>
            {props.children}
        </div>
    }
    else if (type == PageLayoutType.db) {
        var style: CSSProperties = { minHeight: mh, width: '100%' };
        return <div className='shy-page-layout shy-page-layout-db' style={style}>
            {props.children}
        </div>
    }
    else if ([PageLayoutType.dbForm, PageLayoutType.dbPickRecord].includes(type)) {
        var style: CSSProperties = { minHeight: mh, width: '100%' };
        return <div className={"shy-page-layout shy-page-layout-db-form"} style={style}>
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
        </div>
    }
    else {
        return <div>没有定义版面</div>
    }
}